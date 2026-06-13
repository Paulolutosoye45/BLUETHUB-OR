import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { Loader2, AlertCircle } from "lucide-react";
import Replay from "@/component/reply";
import { store } from "@/store";
import boardSessionService from "@/services/board-session";
import type { SessionManifestPayload } from "@/services/board-session";
import {
  addAudio,
  addStrokes,
  deleteAudioBySession,
  deleteClassBySession,
  getAudioBySession,
  getClassBySession,
} from "@/utils/db";
import type { AudioBatch, IActions, IBatch } from "@/utils/constant";
import type { MediaType } from "@/utils/constant";
import { LESSON_MEDIA_CACHE, buildLessonScopedCacheKey } from "@/utils/lesson-media-cache";

// ── Helpers (same as WatchClass) ─────────────────────────────────────────────

const toMmSs = (ms: number): string => {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const mm = Math.floor(totalSec / 60).toString().padStart(2, "0");
  const ss = (totalSec % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
};

const clockToMs = (value: string | null | undefined): number => {
  if (!value) return NaN;
  const parts = String(value).trim().split(":").map(Number);
  if (!parts.every(Number.isFinite)) return NaN;
  if (parts.length === 2) return Math.max(0, (parts[0] * 60 + parts[1]) * 1000);
  if (parts.length === 3) return Math.max(0, (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000);
  return NaN;
};

interface ManifestChunkEvent {
  type: string;
  timestampMs: number;
  mediaAssetId?: string;
  frameIndex?: 0 | 1;
  fromBoard?: number | null;
  toBoard?: number | null;
}

const buildReplayBatches = (manifest: SessionManifestPayload): IActions => {
  const sortedChunks = [...manifest.chunks].sort((a, b) => a.startMs - b.startMs);
  const batches: IBatch[] = sortedChunks.map((chunk, idx) => ({
    id: `batch-${idx}`,
    startTime: toMmSs(chunk.startMs),
    endTime: toMmSs(chunk.endMs),
    hasAudio: true,
    hasBoard: true,
    mediaAction: [],
  }));

  const assetById = new Map(manifest.mediaAssets.map((asset) => [asset.id, asset] as const));
  const openMedia = new Map<string, {
    id: string; name: string; url: string; type: MediaType;
    show: string; showMs: number; frameIndex?: 0 | 1;
  }>();

  const attachToBatch = (media: {
    id: string; name: string; url: string; type: MediaType;
    show: string; closed: string; showMs: number; closedMs: number; frameIndex?: 0 | 1;
  }) => {
    const idx = sortedChunks.findIndex(
      (c) => media.showMs >= c.startMs && media.showMs < c.endMs
    );
    const batchIdx = idx >= 0 ? idx : Math.max(0, sortedChunks.length - 1);
    batches[batchIdx].mediaAction = [...(batches[batchIdx].mediaAction ?? []), media];
  };

  const totalDurationMs = Math.max(
    manifest.stats.totalDurationMs,
    sortedChunks.length > 0 ? sortedChunks[sortedChunks.length - 1].endMs : 0
  );

  // If the manifest stores event timestamps as absolute wall-clock ms (like
  // stroke.timestamp), convert them to session-relative ms before use.
  const sessionStartForEvents = manifest.session?.recordedAt
    ? new Date(manifest.session.recordedAt).getTime()
    : 0;
  const ABSOLUTE_TS_THRESHOLD = 1_000_000_000_000; // year 2001+
  const toRelativeMs = (rawMs: number): number => {
    if (sessionStartForEvents > 0 && rawMs > ABSOLUTE_TS_THRESHOLD) {
      return Math.max(0, rawMs - sessionStartForEvents);
    }
    return Math.max(0, rawMs);
  };

  // ── Board switches — merge three sources ────────────────────────────────────
  // 1. manifest.boardSwitches (top-level, server-aggregated)
  // 2. strokeBatches[N].boardSwitches (per-batch, client-submitted)
  // 3. chunks[N].events type=board:switch (most complete — covers every chunk
  //    even when no corresponding stroke batch was submitted for that window)
  // Dedup by exact timestampMs (first-write wins).
  const switchSet = new Map<number, number>(); // timestampMs → toBoard
  for (const s of manifest.boardSwitches ?? []) {
    switchSet.set(toRelativeMs(s.timestampMs), s.toBoard);
  }
  for (const batch of manifest.strokeBatches ?? []) {
    for (const s of batch.boardSwitches ?? []) {
      const t = toRelativeMs(s.timestampMs);
      if (!switchSet.has(t)) switchSet.set(t, s.toBoard);
    }
  }
  // Server now returns board:switch events with fromBoard/toBoard in chunk events.
  // This is the only place switches that fall after the last stroke batch appear.
  for (const chunk of sortedChunks) {
    const chunkEvents = (chunk.events as ManifestChunkEvent[] | undefined) ?? [];
    for (const e of chunkEvents) {
      if (e.type !== 'board:switch' || e.toBoard == null) continue;
      const t = toRelativeMs(e.timestampMs);
      if (!switchSet.has(t)) switchSet.set(t, e.toBoard);
    }
  }
  const boardSwitchTimeline: Array<{ timestampMs: number; toBoard: number }> =
    Array.from(switchSet.entries())
      .map(([timestampMs, toBoard]) => ({ timestampMs, toBoard }))
      .sort((a, b) => a.timestampMs - b.timestampMs);

  // ── Media events from chunk events ───────────────────────────────────────
  for (const chunk of sortedChunks) {
    const events = ((chunk.events as ManifestChunkEvent[] | undefined) ?? [])
      .filter((e) => Number.isFinite(e.timestampMs))
      .sort((a, b) => a.timestampMs - b.timestampMs);

    for (const event of events) {
      if (!event.mediaAssetId) continue;
      const asset = assetById.get(event.mediaAssetId);
      if (!asset) continue;

      const relativeMs = toRelativeMs(event.timestampMs);

      if (event.type === "media:show") {
        openMedia.set(event.mediaAssetId, {
          id: asset.id, name: asset.name, url: asset.url,
          type: asset.type as MediaType,
          show: toMmSs(relativeMs), showMs: relativeMs,
          frameIndex: event.frameIndex,
        });
      } else if (event.type === "media:hide") {
        const active = openMedia.get(event.mediaAssetId);
        if (!active) continue;
        attachToBatch({
          ...active, closed: toMmSs(relativeMs), closedMs: relativeMs,
        });
        openMedia.delete(event.mediaAssetId);
      }
    }
  }

  for (const active of openMedia.values()) {
    attachToBatch({
      ...active, closed: toMmSs(totalDurationMs), closedMs: totalDurationMs,
    });
  }

  // Fallback: if the server didn't return any media:show events but the session
  // has media assets, show them from the session midpoint. This avoids blocking
  // the board at t=0 while still making media visible during replay.
  const hasAnyMediaEvents = batches.some((b) => (b.mediaAction?.length ?? 0) > 0);
  if (!hasAnyMediaEvents && manifest.mediaAssets.length > 0 && sortedChunks.length > 0) {
    const fallbackShowMs = Math.floor(totalDurationMs / 2);
    for (const asset of manifest.mediaAssets) {
      attachToBatch({
        id: asset.id, name: asset.name, url: asset.url,
        type: asset.type as MediaType,
        show: toMmSs(fallbackShowMs), closed: toMmSs(totalDurationMs),
        showMs: fallbackShowMs, closedMs: totalDurationMs,
      });
    }
  }

  return {
    totalDuration: totalDurationMs,
    totalBatches: batches.length,
    batches,
    boardSwitchTimeline: boardSwitchTimeline.length > 0 ? boardSwitchTimeline : undefined,
  };
};

// ── Component ─────────────────────────────────────────────────────────────────

interface LocationState { sessionId?: string; lessonId?: string; }

const StudentReplay = () => {
  const { classId } = useParams<{ classId: string }>();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? null;

  const sessionId = state?.sessionId ?? classId ?? "";
  const lessonId = state?.lessonId ?? classId ?? "";

  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Checking cached data…");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) { setError("Missing session ID."); return; }

    let cancelled = false;

    const prepare = async () => {
      try {
        // ── Fast path: data already cached from WatchClass ────────────────
        // Version key: bumped to "3" to evict cached audio that may include
        // phantom batches for empty sub-segments (sizeBytes=0) that were
        // downloaded before the skip-empty-chunks fix was applied.
        const REPLAY_DATA_VERSION = "3";
        const cachedVersion = localStorage.getItem(`replayDataVersion_${sessionId}`);

        const [cachedAudio, cachedStrokes] = await Promise.all([
          getAudioBySession(sessionId),
          getClassBySession(sessionId),
        ]);

        if (cachedAudio.length > 0 && cachedStrokes.length > 0 && cachedVersion === REPLAY_DATA_VERSION) {
          // IDB data is valid. Still re-fetch the manifest to regenerate
          // currentBatches — this is a cheap JSON call that ensures media
          // event timing in localStorage is always fresh (never stale from
          // old code or a previous watch-class.tsx run).
          const fastManifest = await boardSessionService.getStudentManifest(sessionId);
          if (fastManifest) {
            const fastReplayManifest = buildReplayBatches(fastManifest);
            localStorage.setItem("currentBatches", JSON.stringify(fastReplayManifest));
            const fastStartWallMs = fastManifest.session?.recordedAt
              ? new Date(fastManifest.session.recordedAt).getTime()
              : Date.now();
            localStorage.setItem("sessionStartWallMs", String(fastStartWallMs));
            localStorage.setItem("sessionStartSessionId", sessionId);
            localStorage.setItem("recordingStartTimerMs", "0");
            localStorage.setItem("recordingStartSessionId", sessionId);
          }
          localStorage.setItem("replaySessionId", sessionId);
          if (!cancelled) setIsReady(true);
          return;
        }

        // ── Slow path: fetch from API ─────────────────────────────────────
        if (!cancelled) { setStatusText("Downloading session manifest…"); setProgress(5); }

        // Clean any stale partial data
        await Promise.all([deleteAudioBySession(sessionId), deleteClassBySession(sessionId)]);

        const manifest = await boardSessionService.getStudentManifest(sessionId);
        if (!manifest) throw new Error("Replay manifest not found for this session.");

        const sessionStartWallMs = (manifest as { session?: { recordedAt?: string } }).session?.recordedAt
          ? new Date((manifest as { session: { recordedAt: string } }).session.recordedAt).getTime()
          : Date.now();

        const replayManifest = buildReplayBatches(manifest);
        localStorage.setItem("currentBatches", JSON.stringify(replayManifest));
        localStorage.setItem("replaySessionId", sessionId);
        localStorage.setItem("sessionStartWallMs", String(sessionStartWallMs));
        localStorage.setItem("sessionStartSessionId", sessionId);
        localStorage.setItem("recordingStartTimerMs", "0");
        localStorage.setItem("recordingStartSessionId", sessionId);

        const total = manifest.strokeBatches.length + manifest.chunks.length + manifest.mediaAssets.length + 1;
        let done = 1; // manifest counts as 1

        // ── Stroke batches ────────────────────────────────────────────────
        for (const batchRef of manifest.strokeBatches) {
          if (cancelled) return;

          const batch = await boardSessionService.getBatchByIndexKey(sessionId, batchRef.indexKey);
          if (!batch) continue;

          const batchStartMs = Math.max(0, batchRef.startMs ?? batch.startMs ?? 0);
          const batchEndMs = Math.max(batchStartMs + 1000, batchRef.endMs ?? batch.endMs ?? batchStartMs + 60000);
          const batchWindowMs = Math.max(1000, batchEndMs - batchStartMs);

          const sorted = [...batch.strokes].sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));
          const validTs = sorted.map((s) => s.timestamp).filter((t): t is number => typeof t === "number" && Number.isFinite(t));
          const minTs = validTs.length > 0 ? Math.min(...validTs) : null;
          const maxTs = validTs.length > 0 ? Math.max(...validTs) : null;

          const normalized = sorted.map((stroke, index) => {
            const duration = Math.max(50, stroke.duration ?? 0);
            const providedStart = clockToMs(stroke.startTime);
            const inWindow = Number.isFinite(providedStart) &&
              providedStart >= batchStartMs - 2000 && providedStart <= batchEndMs + 2000;

            let alignedStart: number;
            if (inWindow) {
              alignedStart = providedStart;
            } else if (minTs !== null && maxTs !== null && maxTs > minTs && typeof stroke.timestamp === "number") {
              const ratio = (stroke.timestamp - minTs) / (maxTs - minTs);
              alignedStart = batchStartMs + Math.round(ratio * Math.max(0, batchWindowMs - duration));
            } else {
              alignedStart = batchStartMs + Math.round((index / Math.max(1, sorted.length - 1)) * Math.max(0, batchWindowMs - duration));
            }
            alignedStart = Math.max(batchStartMs, Math.min(alignedStart, Math.max(batchStartMs, batchEndMs - duration)));

            const providedEnd = clockToMs(stroke.endTime);
            const alignedEnd = Math.max(
              alignedStart + 50,
              Math.min(batchEndMs, Number.isFinite(providedEnd) && providedEnd >= alignedStart ? providedEnd : alignedStart + duration)
            );

            return {
              ...stroke,
              sessionId,
              timestamp: sessionStartWallMs + alignedStart,
              startTime: toMmSs(alignedStart),
              endTime: toMmSs(alignedEnd),
              duration: Math.max(50, alignedEnd - alignedStart),
            };
          });

          await addStrokes(normalized);
          done++;
          if (!cancelled) {
            setProgress(Math.min(95, Math.round((done / total) * 100)));
            setStatusText(`Downloaded board batch ${batchRef.batchIndex + 1} / ${manifest.strokeBatches.length}`);
          }
        }

        // ── Audio chunks ──────────────────────────────────────────────────
        for (const chunk of manifest.chunks) {
          if (cancelled) return;

          // Skip chunks with no audio content (sizeBytes=0 means the server
          // uploaded nothing for this sub-segment). Without this, the player
          // would create a phantom audio batch that fails immediately in
          // onError, causing playedSessionMsRef to jump the full chunk window
          // in one frame — producing the "board rushes to 1 min" effect.
          if (chunk.audio.sizeBytes === 0) {
            done++;
            if (!cancelled) setProgress(Math.min(95, Math.round((done / total) * 100)));
            continue;
          }

          const audioRes = await fetch(chunk.audio.url);
          if (!audioRes.ok) throw new Error(`Failed to download audio chunk ${chunk.index}.`);

          const blob = await audioRes.blob();
          const chunkWindowMs = Math.max(1000, chunk.endMs - chunk.startMs);
          // Use the actual audio blob duration (mirrors useAudioRecorder approach).
          // Anchoring to the chunk window end (chunkWindowMs) causes plannedEndMs to
          // jump to the window end even when the audio file is much shorter, triggering
          // a spurious gap-fill that races the timer to 1 minute.
          const actualDurationMs = Math.max(1000, chunk.audio.durationMs > 0 ? chunk.audio.durationMs : chunkWindowMs);
          const audioBatch: AudioBatch = {
            id: `${sessionId}_audio_${chunk.index}`,
            type: "audio",
            sessionId,
            batchId: chunk.index,
            timestamp: sessionStartWallMs + chunk.startMs + actualDurationMs,
            blob,
            duration: actualDurationMs / 1000,
            size: chunk.audio.sizeBytes,
          };

          await addAudio(audioBatch);
          done++;
          if (!cancelled) {
            setProgress(Math.min(95, Math.round((done / total) * 100)));
            setStatusText(`Downloaded audio ${chunk.index + 1} / ${manifest.chunks.length}`);
          }
        }

        // ── Media assets (Service Worker / Cache API) ─────────────────────
        if (typeof window !== "undefined" && "caches" in window) {
          const cache = await caches.open(LESSON_MEDIA_CACHE);
          for (const media of manifest.mediaAssets) {
            if (cancelled) return;
            const scoped = buildLessonScopedCacheKey(lessonId, media.url);
            const hit = (await cache.match(scoped)) ?? (await cache.match(media.url));
            if (!hit) {
              const fetched = await fetch(media.url);
              if (fetched.ok) {
                await cache.put(media.url, fetched.clone());
                await cache.put(scoped, fetched.clone());
              }
            }
            done++;
            if (!cancelled) {
              setProgress(Math.min(98, Math.round((done / total) * 100)));
              setStatusText(`Cached media asset ${done} / ${manifest.mediaAssets.length}`);
            }
          }
        }

        if (!cancelled) {
          localStorage.setItem(`replayDataVersion_${sessionId}`, REPLAY_DATA_VERSION);
          setProgress(100);
          setIsReady(true);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load replay.");
      }
    };

    prepare();
    return () => { cancelled = true; };
  }, [sessionId, lessonId]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex max-w-md flex-col items-center gap-3 rounded-xl border border-red-200 bg-white p-8 text-center shadow">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="text-lg font-semibold text-slate-800">Could not load replay</p>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex w-80 flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-8 shadow">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-slate-700">{statusText}</p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">{progress}%</p>
        </div>
      </div>
    );
  }

  return (
    <Provider store={store}>
      <Replay />
    </Provider>
  );
};

export default StudentReplay;
