/// <reference lib="webworker" />
/**
 * Session Worker — off-loads these from the main thread:
 *   • gzip compression of stroke / shape data
 *   • IndexedDB writes (strokes + audio blobs)  — via idb (same as main thread)
 *   • Drift-free batch timer (anchored to session start)
 *   • Manifest building (media show/hide, board/audio flags)
 *
 * The worker drives the 10-second clock. On each TICK it posts a message
 * to the main thread so the MediaRecorder is stopped at the correct moment,
 * keeping audio and board batches aligned to the same master clock.
 *
 * localStorage is not available in workers — the manifest JSON is posted
 * back to the main thread for storage.
 */

import { openDB, type IDBPDatabase } from 'idb';
import {
  DB_NAME, DB_VERSION, STORE_CLASS, STORE_AUDIO,
  type CompressedStroke, type AudioBatch, type IBatch, type IActiveMedia,
} from '@/utils/constant';

const BATCH_MS = 10_000;

// ── Types for inbound messages ────────────────────────────────────────────────

type ToWorkerMsg =
  | { type: 'INIT';       sessionId: string; sessionStartMs: number; }
  | { type: 'RAW_STROKE'; id: string; rawPoints: number[]; color: string; width: number;
      strokeType: 'stroke' | 'eraser'; currentBoard: number;
      startTime: string; endTime: string; timestamp: number; }
  | { type: 'RAW_SHAPE';  id: string; shape: Record<string, unknown>; color: string;
      strokeWidth: number; shapeType: string; currentBoard: number;
      startTime: string; endTime: string; timestamp: number; }
  | { type: 'AUDIO_CHUNK'; blob: Blob; batchIndex: number; duration: number; }
  | { type: 'MEDIA_SHOW'; mediaId: string; name: string; mediaType: string;
      url: string; timerDisplay: string; elapsedMs?: number; frameIndex?: 0 | 1; }
    | { type: 'MEDIA_HIDE'; mediaId: string; timerDisplay: string; elapsedMs?: number; }
    | { type: 'PDF_PAGE';   mediaId: string; page: number; timerDisplay: string; elapsedMs?: number; }
    | { type: 'MEDIA_SCROLL'; mediaId: string; scrollRatio: number; timerDisplay: string; elapsedMs?: number; }
  | { type: 'END'; }

// ── Session state ─────────────────────────────────────────────────────────────

let sessionId         = '';
let sessionStartMs    = 0;
let currentSlot       = 0;
let _db: IDBPDatabase | null = null;

// Per-batch accumulators — no stroke buffer; strokes are written to IDB immediately
// after compression so replay sees them in near real-time (< 20ms latency).
let hasStrokesInBatch = false;
let batchMediaActions: IActiveMedia[] = [];

// Full session manifest (grows each batch)
let manifest = { totalDuration: 0, totalBatches: 0, batches: [] as IBatch[] };

let batchTimer: ReturnType<typeof setTimeout> | null = null;

// ── IndexedDB via idb ─────────────────────────────────────────────────────────
// idb works in workers — it has no DOM dependencies.
// A single connection is opened once and reused for the whole session.

async function getDb(): Promise<IDBPDatabase> {
  if (_db) return _db;
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE_CLASS))
        database.createObjectStore(STORE_CLASS, { keyPath: 'id' });
      if (!database.objectStoreNames.contains(STORE_AUDIO))
        database.createObjectStore(STORE_AUDIO, { keyPath: 'id' });
    },
  });
  return _db;
}

async function writeStrokes(strokes: CompressedStroke[]): Promise<void> {
  if (strokes.length === 0) return;
  const db = await getDb();
  const tx = db.transaction(STORE_CLASS, 'readwrite');
  await Promise.all([
    ...strokes.map(s => tx.store.put(s)),
    tx.done,
  ]);
}

async function writeAudio(payload: AudioBatch): Promise<void> {
  await (await getDb()).add(STORE_AUDIO, payload);
}

// ── Compression (runs off main thread) ───────────────────────────────────────

async function gzipCompress(data: string): Promise<Uint8Array> {
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  writer.write(new TextEncoder().encode(data));
  writer.close();
  const buf = await new Response(cs.readable).arrayBuffer();
  return new Uint8Array(buf);
}

// Safe btoa for large buffers — avoids call-stack overflow from spread operator
function toBase64(u8: Uint8Array): string {
  let binary = '';
  const CHUNK = 8_192;
  for (let i = 0; i < u8.length; i += CHUNK)
    binary += String.fromCharCode(...u8.subarray(i, i + CHUNK));
  return btoa(binary);
}

// ── Drift-free batch timer ────────────────────────────────────────────────────
// Each timeout is computed relative to sessionStartMs, not the previous fire.
// This prevents cumulative drift (setTimeout can be up to ~50ms late each call).

function scheduleNextBatch() {
  if (batchTimer) clearTimeout(batchTimer);
  const nextBoundaryMs = sessionStartMs + (currentSlot + 1) * BATCH_MS;
  const delay = Math.max(0, nextBoundaryMs - Date.now());
  batchTimer = setTimeout(flushAndTick, delay);
}

function secondsToClock(totalSeconds: number): string {
  const secs = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

async function flushAndTick() {
  const slot = currentSlot;
  currentSlot++;

  // Strokes are already in IDB (written immediately on RAW_STROKE).
  // TICK is only responsible for manifest building + audio sync signal.

  // ── Build manifest entry for this batch ──
  // startTime/endTime follow the existing nextTime() × 10 convention
  const startVal = slot * 10;
  const endVal   = (slot + 1) * 10;

  const batch: IBatch = {
    id:        crypto.randomUUID(),
    startTime: String(startVal),
    endTime:   String(endVal),
    hasAudio:  true,                     // session is active = audio is recording
    hasBoard:  hasStrokesInBatch,
    ...(batchMediaActions.length > 0
      ? { mediaAction: batchMediaActions.slice() }
      : {}),
  };

  manifest.batches.push(batch);
  manifest.totalBatches  = manifest.batches.length;
  manifest.totalDuration = BATCH_MS * manifest.totalBatches;

  // ── 3. Reset per-batch accumulators ──
  hasStrokesInBatch = false;
  batchMediaActions = [];

  // ── 4. Notify main thread ──
  //   TICK  → stop the current MediaRecorder at the right moment
  //   MANIFEST_UPDATE → persist to localStorage (worker cannot access it)
  self.postMessage({ type: 'TICK', batchSlot: slot });
  self.postMessage({ type: 'MANIFEST_UPDATE', manifest: JSON.stringify(manifest) });

  // ── 5. Schedule the next batch from the anchored reference ──
  scheduleNextBatch();
}

// ── Message handler ───────────────────────────────────────────────────────────

self.onmessage = async (e: MessageEvent<ToWorkerMsg>) => {
  const msg = e.data;

  switch (msg.type) {

    case 'INIT': {
      // Reset all state for a new session
      sessionId         = msg.sessionId;
      sessionStartMs    = msg.sessionStartMs;
      currentSlot       = 0;
      // strokeBuffer      = [];
      batchMediaActions = [];
      hasStrokesInBatch = false;
      manifest          = { totalDuration: 0, totalBatches: 0, batches: [] };

      if (batchTimer) clearTimeout(batchTimer);

      try {
        // Warm the connection now so the first write has no cold-start latency
        await getDb();
        self.postMessage({ type: 'READY' });
        scheduleNextBatch();
      } catch (err) {
        postError(`DB init failed: ${err}`);
      }
      break;
    }

    case 'RAW_STROKE': {
      const { id, rawPoints, color, width, strokeType, currentBoard,
              startTime, endTime, timestamp } = msg;
      try {
        const compressed = await gzipCompress(JSON.stringify(rawPoints));
        const base64     = toBase64(compressed);
        const stroke: CompressedStroke = {
          id, sessionId, data: base64, color, width,
          type: strokeType, currentBoard, timestamp,
          duration: 0, startTime, endTime,
        };
        // Write immediately — replay sees it within ~10-20ms of drawing
        await writeStrokes([stroke]);
        hasStrokesInBatch = true;
      } catch (err) {
        postError(`RAW_STROKE compress: ${err}`);
      }
      break;
    }

    case 'RAW_SHAPE': {
      const { id, shape, color, strokeWidth, shapeType, currentBoard,
              startTime, endTime, timestamp } = msg;
      try {
        const compressed = await gzipCompress(JSON.stringify(shape));
        const base64     = toBase64(compressed);
        const stroke: CompressedStroke = {
          id, sessionId, data: base64, color,
          width: strokeWidth, type: shapeType,
          currentBoard, timestamp, duration: 0,
          startTime, endTime,
        };
        // Write immediately
        await writeStrokes([stroke]);
        hasStrokesInBatch = true;
      } catch (err) {
        postError(`RAW_SHAPE compress: ${err}`);
      }
      break;
    }

    case 'AUDIO_CHUNK': {
      const { blob, batchIndex, duration } = msg;
      try {
        await writeAudio({
          id:        crypto.randomUUID(),
          type:      'audio',
          sessionId,
          batchId:   batchIndex,
          timestamp: Date.now(),
          blob,
          duration,
          size:      blob.size,
        });
      } catch (err) {
        postError(`AUDIO_CHUNK write: ${err}`);
      }
      break;
    }

    case 'MEDIA_SHOW': {
      const { mediaId, name, mediaType, url, timerDisplay, elapsedMs, frameIndex } = msg;

      // Close any still-open instance of the same asset in this batch
      const prev = batchMediaActions.find(m => m.id === mediaId && m.closed === null);
      if (prev) prev.closed = timerDisplay;

      batchMediaActions.push({
        id:     mediaId,
        name,
        type:   mediaType as 'video' | 'pdf' | 'image',
        url,
        show:   timerDisplay,
        showMs: elapsedMs,
        closed: null,
        frameIndex,
      });
      break;
    }

    case 'PDF_PAGE': {
      const { mediaId, page, timerDisplay, elapsedMs } = msg;
      // Find the active media entry in current batch or previous batches
      const active = batchMediaActions.find(m => m.id === mediaId && m.closed === null);
      if (active) {
        if (!active.pdfPages) active.pdfPages = [];
        active.pdfPages.push({ page, timerDisplay, elapsedMs });
      } else {
        // Media spans a previous batch — append to the most recent open entry there
        for (let i = manifest.batches.length - 1; i >= 0; i--) {
          const prev = manifest.batches[i].mediaAction?.find(m => m.id === mediaId && m.closed === null);
          if (prev) {
            if (!prev.pdfPages) prev.pdfPages = [];
            prev.pdfPages.push({ page, timerDisplay, elapsedMs });
            break;
          }
        }
      }
      break;
    }

    case 'MEDIA_SCROLL': {
      const { mediaId, scrollRatio, timerDisplay, elapsedMs } = msg;
      const event = { scrollRatio, timerDisplay, elapsedMs };

      const active = batchMediaActions.find(m => m.id === mediaId && m.closed === null);
      if (active) {
        if (!active.pdfScrollEvents) active.pdfScrollEvents = [];
        active.pdfScrollEvents.push(event);
      } else {
        for (let i = manifest.batches.length - 1; i >= 0; i--) {
          const prev = manifest.batches[i].mediaAction?.find(m => m.id === mediaId && m.closed === null);
          if (prev) {
            if (!prev.pdfScrollEvents) prev.pdfScrollEvents = [];
            prev.pdfScrollEvents.push(event);
            break;
          }
        }
      }
      break;
    }

    case 'MEDIA_HIDE': {
      const { mediaId, timerDisplay, elapsedMs } = msg;

      // Try current batch first, then search previous batches
      const current = batchMediaActions.find(m => m.id === mediaId && m.closed === null);
      if (current) {
        current.closed = timerDisplay;
        current.closedMs = elapsedMs;
      } else {
        for (const batch of manifest.batches) {
          const prev = batch.mediaAction?.find(m => m.id === mediaId && m.closed === null);
          if (prev) {
            prev.closed = timerDisplay;
            prev.closedMs = elapsedMs;
            break;
          }
        }
      }
      break;
    }

    case 'END': {
      if (batchTimer) clearTimeout(batchTimer);

      // Strokes are already in IDB — just finalise the manifest.
      // Close any media still open at session end.
      const elapsedSecs = Math.ceil(Math.max(0, Date.now() - sessionStartMs) / 1000);
      const endClock = secondsToClock(elapsedSecs);
      batchMediaActions.forEach(m => { if (!m.closed) m.closed = endClock; });

      // Also close any still-open media stored in already-flushed batches.
      for (const batch of manifest.batches) {
        for (const media of batch.mediaAction ?? []) {
          if (!media.closed || media.closed === '—') {
            media.closed = endClock;
          }
        }
      }

      // If class ended before the next 10s tick, flush a final partial batch
      // so media open/close actions are not lost from the manifest.
      if (hasStrokesInBatch || batchMediaActions.length > 0) {
        const startVal = currentSlot * 10;
        const endVal = Math.max(startVal + 1, elapsedSecs);

        const batch: IBatch = {
          id:        crypto.randomUUID(),
          startTime: String(startVal),
          endTime:   String(endVal),
          hasAudio:  true,
          hasBoard:  hasStrokesInBatch,
          ...(batchMediaActions.length > 0
            ? { mediaAction: batchMediaActions.slice() }
            : {}),
        };

        manifest.batches.push(batch);
        manifest.totalBatches  = manifest.batches.length;
        manifest.totalDuration = BATCH_MS * manifest.totalBatches;
      }

      // Emit final manifest
      self.postMessage({ type: 'MANIFEST_UPDATE', manifest: JSON.stringify(manifest) });
      break;
    }
  }
};

function postError(msg: string) {
  console.error('[SessionWorker]', msg);
  self.postMessage({ type: 'ERROR', error: msg });
}
