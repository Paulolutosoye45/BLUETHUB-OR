import { openDB, type IDBPDatabase } from 'idb';
import {
  DB_NAME, DB_VERSION,
  STORE_CLASS, STORE_AUDIO, STORE_SESSIONS,
  STORE_AUDIO_CHUNKS, STORE_STROKE_BATCHES, STORE_REPLAY_CACHE,
  STORE_STUDENT_BOARDS,
  type CompressedStroke, type AudioBatch, type LocalSession,
  type LocalAudioChunk, type LocalStrokeBatch, type ReplayDownloadCache,
  type SyncStatus, type SessionStatus,
} from './constant';

// ── DB singleton ──────────────────────────────────────────────────────────────

let _db: IDBPDatabase | null = null;

async function getDb(): Promise<IDBPDatabase> {
  if (_db) return _db;
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_CLASS)) {
        db.createObjectStore(STORE_CLASS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_AUDIO)) {
        db.createObjectStore(STORE_AUDIO, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
        const s = db.createObjectStore(STORE_SESSIONS, { keyPath: 'id' });
        s.createIndex('lessonId', 'lessonId', { unique: false });
        s.createIndex('status', 'status', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_AUDIO_CHUNKS)) {
        const s = db.createObjectStore(STORE_AUDIO_CHUNKS, { keyPath: 'id' });
        s.createIndex('sessionId', 'sessionId', { unique: false });
        s.createIndex('lessonId', 'lessonId', { unique: false });
        s.createIndex('syncStatus', 'syncStatus', { unique: false });
        s.createIndex('sessionId_chunkIndex', ['sessionId', 'chunkIndex'], { unique: true });
      }
      if (!db.objectStoreNames.contains(STORE_STROKE_BATCHES)) {
        const s = db.createObjectStore(STORE_STROKE_BATCHES, { keyPath: 'id' });
        s.createIndex('sessionId', 'sessionId', { unique: false });
        s.createIndex('lessonId', 'lessonId', { unique: false });
        s.createIndex('syncStatus', 'syncStatus', { unique: false });
        s.createIndex('sessionId_batchIndex', ['sessionId', 'batchIndex'], { unique: true });
      }
      if (!db.objectStoreNames.contains(STORE_REPLAY_CACHE)) {
        db.createObjectStore(STORE_REPLAY_CACHE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_STUDENT_BOARDS)) {
        db.createObjectStore(STORE_STUDENT_BOARDS, { keyPath: 'id' });
      }
    },
  });
  return _db;
}

// ── Startup ───────────────────────────────────────────────────────────────────

export async function ensureAllStoresExist(): Promise<void> {
  await getDb();
}

// ── STORE_CLASS — CompressedStroke (live board / replay strokes) ──────────────

export async function addStrokes(strokes: CompressedStroke[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(STORE_CLASS, 'readwrite');
  await Promise.all(strokes.map(s => tx.store.put(s)));
  await tx.done;
}

export async function getClass(): Promise<CompressedStroke[]> {
  return (await getDb()).getAll(STORE_CLASS);
}

export async function getClassBySession(sessionId: string): Promise<CompressedStroke[]> {
  return (await getClass()).filter(s => s.sessionId === sessionId);
}

export async function getClassBySessionAndBoard(sessionId: string, board: number): Promise<CompressedStroke[]> {
  return (await getClassBySession(sessionId)).filter(s => s.currentBoard === board);
}

export async function deleteClassBySession(sessionId: string): Promise<void> {
  const db = await getDb();
  const all: CompressedStroke[] = await db.getAll(STORE_CLASS);
  const tx = db.transaction(STORE_CLASS, 'readwrite');
  await Promise.all(all.filter(s => s.sessionId === sessionId).map(s => tx.store.delete(s.id)));
  await tx.done;
}

export async function clearClass(): Promise<void> {
  await (await getDb()).clear(STORE_CLASS);
}

// ── STORE_AUDIO — AudioBatch (live audio blobs) ───────────────────────────────

export async function addAudio(audio: AudioBatch): Promise<void> {
  await (await getDb()).put(STORE_AUDIO, audio);
}

export async function getAudio(): Promise<AudioBatch[]> {
  return (await getDb()).getAll(STORE_AUDIO);
}

export async function getAudioBySession(sessionId: string): Promise<AudioBatch[]> {
  return (await getAudio()).filter(a => a.sessionId === sessionId);
}

export async function deleteAudioBySession(sessionId: string): Promise<void> {
  const db = await getDb();
  const all: AudioBatch[] = await db.getAll(STORE_AUDIO);
  const tx = db.transaction(STORE_AUDIO, 'readwrite');
  await Promise.all(all.filter(a => a.sessionId === sessionId).map(a => tx.store.delete(a.id)));
  await tx.done;
}

export async function deleteAudioById(id: string): Promise<void> {
  await (await getDb()).delete(STORE_AUDIO, id);
}

export async function clearAudio(): Promise<void> {
  await (await getDb()).clear(STORE_AUDIO);
}

// ── STORE_SESSIONS — LocalSession ─────────────────────────────────────────────

export async function getSession(sessionId: string): Promise<LocalSession | undefined> {
  return (await getDb()).get(STORE_SESSIONS, sessionId);
}

export async function updateSession(session: LocalSession): Promise<void> {
  await (await getDb()).put(STORE_SESSIONS, session);
}

export async function saveSessionAsDraft(sessionId: string, session: LocalSession): Promise<void> {
  await (await getDb()).put(STORE_SESSIONS, { ...session, id: sessionId, status: 'draft' });
}

export async function getAllSessions(): Promise<LocalSession[]> {
  return (await getDb()).getAll(STORE_SESSIONS);
}

export async function getSessionsByStatus(status: SessionStatus): Promise<LocalSession[]> {
  const db = await getDb();
  try {
    return db.getAllFromIndex(STORE_SESSIONS, 'status', status);
  } catch {
    return (await db.getAll(STORE_SESSIONS)).filter((s: LocalSession) => s.status === status);
  }
}

/** Sessions that were recording or paused when the app last closed — candidates for recovery. */
export async function getInterruptedSessions(): Promise<LocalSession[]> {
  const all = await getAllSessions();
  return all.filter(s => s.status === 'recording' || s.status === 'paused');
}

export interface SessionSyncStats {
  totalAudioChunks: number;
  sentAudioChunks: number;
  failedAudioChunks: number;
  pendingAudioChunks: number;
  totalStrokeBatches: number;
  sentStrokeBatches: number;
  failedStrokeBatches: number;
  pendingStrokeBatches: number;
  manifestSent: boolean;
}

export async function getSessionSyncStats(sessionId: string): Promise<SessionSyncStats> {
  const db = await getDb();
  const [chunks, batches, session] = await Promise.all([
    db.getAllFromIndex(STORE_AUDIO_CHUNKS, 'sessionId', sessionId) as Promise<LocalAudioChunk[]>,
    db.getAllFromIndex(STORE_STROKE_BATCHES, 'sessionId', sessionId) as Promise<LocalStrokeBatch[]>,
    db.get(STORE_SESSIONS, sessionId) as Promise<LocalSession | undefined>,
  ]);
  return {
    totalAudioChunks: chunks.length,
    sentAudioChunks:  chunks.filter(c => c.syncStatus === 'sent').length,
    failedAudioChunks: chunks.filter(c => c.syncStatus === 'failed').length,
    pendingAudioChunks: chunks.filter(c => c.syncStatus === 'pending' || c.syncStatus === 'uploading').length,
    totalStrokeBatches: batches.length,
    sentStrokeBatches:  batches.filter(b => b.syncStatus === 'sent').length,
    failedStrokeBatches: batches.filter(b => b.syncStatus === 'failed').length,
    pendingStrokeBatches: batches.filter(b => b.syncStatus === 'pending' || b.syncStatus === 'uploading').length,
    manifestSent: session?.syncProgress?.manifestSent ?? false,
  };
}

/** Keep session metadata but wipe audio blobs (published — no longer need local copy). */
export async function cleanupPublishedSession(sessionId: string): Promise<void> {
  const db = await getDb();
  const chunks: LocalAudioChunk[] = await db.getAllFromIndex(STORE_AUDIO_CHUNKS, 'sessionId', sessionId);
  const tx = db.transaction(STORE_AUDIO_CHUNKS, 'readwrite');
  for (const c of chunks) {
    await tx.store.put({ ...c, blob: null as unknown as Blob, isDeleted: true });
  }
  await tx.done;
  await deleteAudioBySession(sessionId);
}

/** Delete everything for a session from all stores. */
export async function cleanupEntireSession(sessionId: string): Promise<void> {
  const db = await getDb();
  const [chunks, batches] = await Promise.all([
    db.getAllFromIndex(STORE_AUDIO_CHUNKS, 'sessionId', sessionId) as Promise<LocalAudioChunk[]>,
    db.getAllFromIndex(STORE_STROKE_BATCHES, 'sessionId', sessionId) as Promise<LocalStrokeBatch[]>,
  ]);

  const txChunks = db.transaction(STORE_AUDIO_CHUNKS, 'readwrite');
  await Promise.all(chunks.map(c => txChunks.store.delete(c.id)));
  await txChunks.done;

  const txBatches = db.transaction(STORE_STROKE_BATCHES, 'readwrite');
  await Promise.all(batches.map(b => txBatches.store.delete(b.id)));
  await txBatches.done;

  await db.delete(STORE_SESSIONS, sessionId);
  await deleteClassBySession(sessionId);
  await deleteAudioBySession(sessionId);
  await deleteReplayDownloadCache(sessionId);
}

// ── STORE_AUDIO_CHUNKS — LocalAudioChunk ──────────────────────────────────────

export async function getAudioChunksBySession(sessionId: string): Promise<LocalAudioChunk[]> {
  return (await getDb()).getAllFromIndex(STORE_AUDIO_CHUNKS, 'sessionId', sessionId);
}

export async function updateAudioChunkStatus(
  id: string,
  status: SyncStatus,
  extras?: Partial<LocalAudioChunk>,
): Promise<void> {
  const db = await getDb();
  const chunk: LocalAudioChunk | undefined = await db.get(STORE_AUDIO_CHUNKS, id);
  if (!chunk) return;
  await db.put(STORE_AUDIO_CHUNKS, { ...chunk, syncStatus: status, ...extras });
}

// ── STORE_STROKE_BATCHES — LocalStrokeBatch ───────────────────────────────────

export async function getStrokeBatchesBySession(sessionId: string): Promise<LocalStrokeBatch[]> {
  return (await getDb()).getAllFromIndex(STORE_STROKE_BATCHES, 'sessionId', sessionId);
}

export async function updateStrokeBatchStatus(
  id: string,
  status: SyncStatus,
  extras?: Partial<LocalStrokeBatch>,
): Promise<void> {
  const db = await getDb();
  const batch: LocalStrokeBatch | undefined = await db.get(STORE_STROKE_BATCHES, id);
  if (!batch) return;
  await db.put(STORE_STROKE_BATCHES, { ...batch, syncStatus: status, ...extras });
}

// ── STORE_REPLAY_CACHE — ReplayDownloadCache ──────────────────────────────────

export async function getReplayDownloadCache(sessionId: string): Promise<ReplayDownloadCache | null> {
  return (await (await getDb()).get(STORE_REPLAY_CACHE, sessionId)) ?? null;
}

export async function saveReplayDownloadCache(cache: ReplayDownloadCache): Promise<void> {
  await (await getDb()).put(STORE_REPLAY_CACHE, cache);
}

export async function deleteReplayDownloadCache(sessionId: string): Promise<void> {
  await (await getDb()).delete(STORE_REPLAY_CACHE, sessionId);
}

// ── STORE_STUDENT_BOARDS — Student assessment board cache ─────────────────────

export interface StudentBoardCache {
  id: string;  // `${assessmentId}_${studentId}_${attemptId}`
  assessmentId: string;
  studentId: string;
  attemptId: string;
  drawModeByQuestion: Record<string, boolean>;
  questionBoardMeta: Record<string, { boardSessionId: string; boardIndex: number; boardLabel: string }[]>;
  boardDataByQuestion: Record<string, Record<number, {
    strokes: { points: { x: number; y: number }[]; color: string; width: number; isEraser: boolean }[];
    sessionId: string;
    batchIndex: number;
  }>>;
}

function boardCacheId(assessmentId: string, studentId: string, attemptId: string): string {
  return `${assessmentId}_${studentId}_${attemptId}`;
}

export async function saveStudentBoardCache(cache: StudentBoardCache): Promise<void> {
  await (await getDb()).put(STORE_STUDENT_BOARDS, cache);
}

export async function loadStudentBoardCache(assessmentId: string, studentId: string, attemptId: string): Promise<StudentBoardCache | null> {
  return (await (await getDb()).get(STORE_STUDENT_BOARDS, boardCacheId(assessmentId, studentId, attemptId))) ?? null;
}

export async function clearStudentBoardCache(assessmentId: string, studentId: string, attemptId: string): Promise<void> {
  await (await getDb()).delete(STORE_STUDENT_BOARDS, boardCacheId(assessmentId, studentId, attemptId));
}

// ── Storage utilities ─────────────────────────────────────────────────────────

/** Clears cached replay data to free IDB/Cache quota when storage is critically low. */
export async function freeDiskSpace(): Promise<void> {
  await clearAudio();
  await clearClass();
  try {
    const keys = await caches.keys();
    for (const key of keys) {
      if (key.startsWith('bluethub-replay')) await caches.delete(key);
    }
  } catch { /* Cache API unavailable in some contexts */ }
}

/** Returns true when the error is a storage quota exceeded error from IDB or Cache API. */
export function isStorageFullError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return (
    err.name === 'QuotaExceededError' ||
    err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    err.message.toLowerCase().includes('quota')
  );
}

