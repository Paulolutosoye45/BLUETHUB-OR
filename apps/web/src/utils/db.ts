import { openDB, type IDBPDatabase } from 'idb';
import {
  DB_NAME, DB_VERSION, STORE_CLASS, STORE_AUDIO,
  STORE_SESSIONS, STORE_AUDIO_CHUNKS, STORE_STROKE_BATCHES,
  type CompressedStroke, type AudioBatch,
  type LocalSession, type LocalAudioChunk, type LocalStrokeBatch,
  type SyncStatus,
} from '@/utils/constant';

// ── Singleton connection ───────────────────────────────────────────────────────
// One IDBDatabase instance is reused for the lifetime of the tab.
// The old raw-API version opened a new connection on every single call.

let _db: IDBPDatabase | null = null;

const upgradeHandler = (database: IDBPDatabase, _oldVersion: number) => {
  console.log('[DB] Running upgrade handler, creating missing stores...');

  // Legacy stores
  if (!database.objectStoreNames.contains(STORE_CLASS)) {
    console.log('[DB] Creating store:', STORE_CLASS);
    database.createObjectStore(STORE_CLASS, { keyPath: 'id' });
  }
  if (!database.objectStoreNames.contains(STORE_AUDIO)) {
    console.log('[DB] Creating store:', STORE_AUDIO);
    database.createObjectStore(STORE_AUDIO, { keyPath: 'id' });
  }

  // Sessions store - ALWAYS check and create if missing
  if (!database.objectStoreNames.contains(STORE_SESSIONS)) {
    console.log('[DB] Creating store:', STORE_SESSIONS);
    const sessionsStore = database.createObjectStore(STORE_SESSIONS, { keyPath: 'id' });
    sessionsStore.createIndex('lessonId', 'lessonId', { unique: false });
    sessionsStore.createIndex('status', 'status', { unique: false });
  }

  // Audio chunks store - ALWAYS check and create if missing
  if (!database.objectStoreNames.contains(STORE_AUDIO_CHUNKS)) {
    console.log('[DB] Creating store:', STORE_AUDIO_CHUNKS);
    const audioStore = database.createObjectStore(STORE_AUDIO_CHUNKS, { keyPath: 'id' });
    audioStore.createIndex('sessionId', 'sessionId', { unique: false });
    audioStore.createIndex('lessonId', 'lessonId', { unique: false });
    audioStore.createIndex('syncStatus', 'syncStatus', { unique: false });
    audioStore.createIndex('sessionId_chunkIndex', ['sessionId', 'chunkIndex'], { unique: true });
  }

  // Stroke batches store - ALWAYS check and create if missing
  if (!database.objectStoreNames.contains(STORE_STROKE_BATCHES)) {
    console.log('[DB] Creating store:', STORE_STROKE_BATCHES);
    const strokesStore = database.createObjectStore(STORE_STROKE_BATCHES, { keyPath: 'id' });
    strokesStore.createIndex('sessionId', 'sessionId', { unique: false });
    strokesStore.createIndex('lessonId', 'lessonId', { unique: false });
    strokesStore.createIndex('syncStatus', 'syncStatus', { unique: false });
    strokesStore.createIndex('sessionId_batchIndex', ['sessionId', 'batchIndex'], { unique: true });
  }

  console.log('[DB] Upgrade complete. Stores:', Array.from(database.objectStoreNames));
};

async function db(): Promise<IDBPDatabase> {
  if (_db) return _db;
  _db = await openDB(DB_NAME, DB_VERSION, { upgrade: upgradeHandler });
  return _db;
}

// Fresh connection for critical operations (avoids stale singleton issues)
async function freshDb(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, { upgrade: upgradeHandler });
}

// ── Strokes ────────────────────────────────────────────────────────────────────

export async function addStrokes(strokes: CompressedStroke[]): Promise<void> {
  const store = await db();
  const tx = store.transaction(STORE_CLASS, 'readwrite');
  await Promise.all([
    ...strokes.map(s => tx.store.put(s)),
    tx.done,
  ]);
}

export async function getClass(): Promise<CompressedStroke[]> {
  return (await db()).getAll(STORE_CLASS);
}

export async function getClassByBoard(boardNumber: number): Promise<CompressedStroke[]> {
  const allStrokes = await (await db()).getAll(STORE_CLASS);
  return allStrokes.filter(stroke => stroke.currentBoard === boardNumber);
}

export async function getClassBySession(sessionId: string): Promise<CompressedStroke[]> {
  const allStrokes = await (await db()).getAll(STORE_CLASS);
  return allStrokes.filter(stroke => stroke.sessionId === sessionId);
}

export async function getClassBySessionAndBoard(sessionId: string, boardNumber: number): Promise<CompressedStroke[]> {
  const allStrokes = await (await db()).getAll(STORE_CLASS);
  return allStrokes.filter(stroke => stroke.sessionId === sessionId && stroke.currentBoard === boardNumber);
}

export async function getAvailableBoards(): Promise<number[]> {
  const allStrokes = await (await db()).getAll(STORE_CLASS);
  const boards = new Set<number>(allStrokes.map(stroke => stroke.currentBoard));
  return Array.from(boards).sort((a, b) => a - b);
}

export async function getClassById(id: string): Promise<CompressedStroke | undefined> {
  return (await db()).get(STORE_CLASS, id);
}

export async function updateClass(stroke: CompressedStroke): Promise<void> {
  if (!stroke.id) throw new Error('Stroke ID is required for update');
  await (await db()).put(STORE_CLASS, stroke);
}

export async function deleteClass(id: string): Promise<void> {
  await (await db()).delete(STORE_CLASS, id);
}

export async function clearClass(): Promise<void> {
  await (await db()).clear(STORE_CLASS);
}

// ── Audio ──────────────────────────────────────────────────────────────────────

export async function addAudio(payload: AudioBatch): Promise<void> {
  await (await db()).add(STORE_AUDIO, payload);
}

export async function getAudio(): Promise<AudioBatch[]> {
  const all = await (await db()).getAll(STORE_AUDIO);
  return all.sort((a, b) => a.batchId - b.batchId);
}

export async function getAudioBySession(sessionId: string): Promise<AudioBatch[]> {
  const all = await (await db()).getAll(STORE_AUDIO);
  return all.filter(a => a.sessionId === sessionId).sort((a, b) => a.batchId - b.batchId);
}

export async function clearAudio(): Promise<void> {
  await (await db()).clear(STORE_AUDIO);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SESSIONS (New Sync Architecture)
// ═══════════════════════════════════════════════════════════════════════════════

export async function createSession(session: LocalSession): Promise<void> {
  await (await db()).add(STORE_SESSIONS, session);
}

export async function getSession(id: string): Promise<LocalSession | undefined> {
  return (await db()).get(STORE_SESSIONS, id);
}

export async function getSessionByLessonId(lessonId: string): Promise<LocalSession | undefined> {
  const store = await db();
  const sessions = await store.getAllFromIndex(STORE_SESSIONS, 'lessonId', lessonId);
  return sessions.find(s => s.status !== 'published');
}

export async function getAllSessions(): Promise<LocalSession[]> {
  return (await db()).getAll(STORE_SESSIONS);
}

export async function getSessionsByStatus(status: string): Promise<LocalSession[]> {
  return (await db()).getAllFromIndex(STORE_SESSIONS, 'status', status);
}

/**
 * Get interrupted sessions (recording or paused) for recovery on page refresh.
 * Returns sessions that were interrupted before being properly saved as draft.
 */
export async function getInterruptedSessions(): Promise<LocalSession[]> {
  const allSessions = await (await db()).getAll(STORE_SESSIONS);
  return allSessions.filter(s =>
    s.status === 'recording' || s.status === 'paused'
  );
}

/**
 * Get interrupted session for a specific lesson (for recovery on page load).
 */
export async function getInterruptedSessionByLesson(lessonId: string): Promise<LocalSession | undefined> {
  const store = await db();
  const sessions = await store.getAllFromIndex(STORE_SESSIONS, 'lessonId', lessonId);
  return sessions.find(s => s.status === 'recording' || s.status === 'paused');
}

export async function updateSession(session: LocalSession): Promise<void> {
  session.modifiedAt = new Date().toISOString();
  await (await db()).put(STORE_SESSIONS, session);
}

export async function deleteSession(id: string): Promise<void> {
  await (await db()).delete(STORE_SESSIONS, id);
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIO CHUNKS (New Sync Architecture)
// ═══════════════════════════════════════════════════════════════════════════════

export async function addAudioChunk(chunk: LocalAudioChunk): Promise<void> {
  await (await db()).add(STORE_AUDIO_CHUNKS, chunk);
}

export async function getAudioChunk(id: string): Promise<LocalAudioChunk | undefined> {
  return (await db()).get(STORE_AUDIO_CHUNKS, id);
}

export async function getAudioChunksBySession(sessionId: string): Promise<LocalAudioChunk[]> {
  const chunks = await (await db()).getAllFromIndex(STORE_AUDIO_CHUNKS, 'sessionId', sessionId);
  return chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
}

export async function getAudioChunksByStatus(sessionId: string, status: SyncStatus): Promise<LocalAudioChunk[]> {
  const allChunks = await getAudioChunksBySession(sessionId);
  return allChunks.filter(c => c.syncStatus === status);
}

export async function getPendingAudioChunks(sessionId: string): Promise<LocalAudioChunk[]> {
  const allChunks = await getAudioChunksBySession(sessionId);
  return allChunks
    .filter(c => (c.syncStatus === 'pending' || c.syncStatus === 'failed') && !c.isDeleted)
    .sort((a, b) => a.chunkIndex - b.chunkIndex);
}

export async function updateAudioChunk(chunk: LocalAudioChunk): Promise<void> {
  await (await db()).put(STORE_AUDIO_CHUNKS, chunk);
}

export async function updateAudioChunkStatus(
  id: string,
  status: SyncStatus,
  extras?: Partial<LocalAudioChunk>
): Promise<void> {
  const store = await db();
  const chunk = await store.get(STORE_AUDIO_CHUNKS, id);
  if (!chunk) return;

  await store.put(STORE_AUDIO_CHUNKS, {
    ...chunk,
    syncStatus: status,
    lastAttemptAt: new Date().toISOString(),
    uploadAttempts: status === 'failed' ? chunk.uploadAttempts + 1 : chunk.uploadAttempts,
    sentAt: status === 'sent' ? new Date().toISOString() : chunk.sentAt,
    ...extras,
  });
}

export async function deleteAudioChunk(id: string): Promise<void> {
  await (await db()).delete(STORE_AUDIO_CHUNKS, id);
}

export async function deleteAudioChunksBySession(sessionId: string): Promise<number> {
  const store = await db();
  const chunks = await store.getAllFromIndex(STORE_AUDIO_CHUNKS, 'sessionId', sessionId);
  let freedBytes = 0;

  const tx = store.transaction(STORE_AUDIO_CHUNKS, 'readwrite');
  for (const chunk of chunks) {
    freedBytes += chunk.sizeBytes;
    await tx.store.delete(chunk.id);
  }
  await tx.done;

  return freedBytes;
}

export async function deleteSentAudioChunks(sessionId: string): Promise<number> {
  const store = await db();
  const chunks = await store.getAllFromIndex(STORE_AUDIO_CHUNKS, 'sessionId', sessionId);
  let freedBytes = 0;

  const tx = store.transaction(STORE_AUDIO_CHUNKS, 'readwrite');
  for (const chunk of chunks) {
    if (chunk.syncStatus === 'sent') {
      freedBytes += chunk.sizeBytes;
      await tx.store.delete(chunk.id);
    }
  }
  await tx.done;

  return freedBytes;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STROKE BATCHES (New Sync Architecture)
// ═══════════════════════════════════════════════════════════════════════════════

export async function addStrokeBatch(batch: LocalStrokeBatch): Promise<void> {
  await (await db()).add(STORE_STROKE_BATCHES, batch);
}

export async function getStrokeBatch(id: string): Promise<LocalStrokeBatch | undefined> {
  return (await db()).get(STORE_STROKE_BATCHES, id);
}

export async function getStrokeBatchesBySession(sessionId: string): Promise<LocalStrokeBatch[]> {
  const batches = await (await db()).getAllFromIndex(STORE_STROKE_BATCHES, 'sessionId', sessionId);
  return batches.sort((a, b) => a.batchIndex - b.batchIndex);
}

export async function getPendingStrokeBatches(sessionId: string): Promise<LocalStrokeBatch[]> {
  const allBatches = await getStrokeBatchesBySession(sessionId);
  return allBatches
    .filter(b => b.syncStatus === 'pending' || b.syncStatus === 'failed')
    .sort((a, b) => a.batchIndex - b.batchIndex);
}

export async function updateStrokeBatch(batch: LocalStrokeBatch): Promise<void> {
  await (await db()).put(STORE_STROKE_BATCHES, batch);
}

export async function updateStrokeBatchStatus(
  id: string,
  status: SyncStatus,
  extras?: Partial<LocalStrokeBatch>
): Promise<void> {
  const store = await db();
  const batch = await store.get(STORE_STROKE_BATCHES, id);
  if (!batch) return;

  await store.put(STORE_STROKE_BATCHES, {
    ...batch,
    syncStatus: status,
    lastAttemptAt: new Date().toISOString(),
    uploadAttempts: status === 'failed' ? batch.uploadAttempts + 1 : batch.uploadAttempts,
    sentAt: status === 'sent' ? new Date().toISOString() : batch.sentAt,
    ...extras,
  });
}

export async function deleteStrokeBatch(id: string): Promise<void> {
  await (await db()).delete(STORE_STROKE_BATCHES, id);
}

export async function deleteStrokeBatchesBySession(sessionId: string): Promise<number> {
  const store = await db();
  const batches = await store.getAllFromIndex(STORE_STROKE_BATCHES, 'sessionId', sessionId);
  let freedBytes = 0;

  const tx = store.transaction(STORE_STROKE_BATCHES, 'readwrite');
  for (const batch of batches) {
    freedBytes += batch.sizeBytes;
    await tx.store.delete(batch.id);
  }
  await tx.done;

  return freedBytes;
}

export async function deleteSentStrokeBatches(sessionId: string): Promise<number> {
  const store = await db();
  const batches = await store.getAllFromIndex(STORE_STROKE_BATCHES, 'sessionId', sessionId);
  let freedBytes = 0;

  const tx = store.transaction(STORE_STROKE_BATCHES, 'readwrite');
  for (const batch of batches) {
    if (batch.syncStatus === 'sent') {
      freedBytes += batch.sizeBytes;
      await tx.store.delete(batch.id);
    }
  }
  await tx.done;

  return freedBytes;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYNC PROGRESS HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

export async function updateSessionSyncProgress(sessionId: string): Promise<void> {
  const store = await db();
  const session = await store.get(STORE_SESSIONS, sessionId);
  if (!session) return;

  const audioChunks = await store.getAllFromIndex(STORE_AUDIO_CHUNKS, 'sessionId', sessionId);
  const strokeBatches = await store.getAllFromIndex(STORE_STROKE_BATCHES, 'sessionId', sessionId);

  const audioSent = audioChunks.filter(c => c.syncStatus === 'sent').length;
  const audioFailed = audioChunks.filter(c => c.syncStatus === 'failed').length;
  const strokesSent = strokeBatches.filter(b => b.syncStatus === 'sent').length;
  const strokesFailed = strokeBatches.filter(b => b.syncStatus === 'failed').length;

  await store.put(STORE_SESSIONS, {
    ...session,
    syncProgress: {
      ...session.syncProgress,
      audioSent,
      audioFailed,
      strokesSent,
      strokesFailed,
    },
    modifiedAt: new Date().toISOString(),
  });
}

export async function getSessionSyncStats(sessionId: string): Promise<{
  totalAudio: number;
  audioSent: number;
  audioPending: number;
  audioFailed: number;
  totalStrokes: number;
  strokesSent: number;
  strokesPending: number;
  strokesFailed: number;
}> {
  const store = await db();
  const audioChunks = await store.getAllFromIndex(STORE_AUDIO_CHUNKS, 'sessionId', sessionId);
  const strokeBatches = await store.getAllFromIndex(STORE_STROKE_BATCHES, 'sessionId', sessionId);

  return {
    totalAudio: audioChunks.length,
    audioSent: audioChunks.filter(c => c.syncStatus === 'sent').length,
    audioPending: audioChunks.filter(c => c.syncStatus === 'pending').length,
    audioFailed: audioChunks.filter(c => c.syncStatus === 'failed').length,
    totalStrokes: strokeBatches.length,
    strokesSent: strokeBatches.filter(b => b.syncStatus === 'sent').length,
    strokesPending: strokeBatches.filter(b => b.syncStatus === 'pending').length,
    strokesFailed: strokeBatches.filter(b => b.syncStatus === 'failed').length,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLEANUP HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

export async function cleanupPublishedSession(sessionId: string): Promise<number> {
  let totalFreed = 0;
  totalFreed += await deleteSentAudioChunks(sessionId);
  totalFreed += await deleteSentStrokeBatches(sessionId);
  return totalFreed;
}

export async function cleanupEntireSession(sessionId: string): Promise<number> {
  let totalFreed = 0;
  totalFreed += await deleteAudioChunksBySession(sessionId);
  totalFreed += await deleteStrokeBatchesBySession(sessionId);
  await deleteSession(sessionId);
  return totalFreed;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DRAFT SAVE (Uses raw IndexedDB API to avoid transaction conflicts with worker)
// ═══════════════════════════════════════════════════════════════════════════════

// Helper to delete and recreate database if stores are missing
async function ensureStoresExist(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);

    request.onsuccess = () => {
      const database = request.result;
      const hasAllStores =
        database.objectStoreNames.contains(STORE_SESSIONS) &&
        database.objectStoreNames.contains(STORE_AUDIO_CHUNKS) &&
        database.objectStoreNames.contains(STORE_STROKE_BATCHES);

      database.close();

      if (hasAllStores) {
        console.log('[DB] All required stores exist');
        resolve();
      } else {
        console.log('[DB] Missing stores detected, deleting database to force recreation...');
        // Close singleton if open
        if (_db) {
          _db.close();
          _db = null;
        }

        const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
        deleteRequest.onsuccess = () => {
          console.log('[DB] Database deleted, will recreate on next access');
          resolve();
        };
        deleteRequest.onerror = () => {
          reject(new Error('Failed to delete database for recreation'));
        };
        deleteRequest.onblocked = () => {
          reject(new Error('Database deletion blocked - close all tabs and try again'));
        };
      }
    };

    request.onerror = () => {
      // Database doesn't exist yet, that's fine
      resolve();
    };
  });
}

export async function saveSessionAsDraft(sessionId: string, sessionData: LocalSession): Promise<void> {
  // First ensure all stores exist (may delete and recreate DB if needed)
  try {
    await ensureStoresExist();
  } catch (err) {
    console.warn('[SaveDraft] ensureStoresExist failed:', err);
  }

  // Try multiple approaches in sequence
  const errors: string[] = [];

  // Attempt 1: Use the idb singleton (simplest, works if no transaction conflict)
  try {
    console.log('[SaveDraft] Attempt 1: Using idb singleton');
    const store = await db();
    const existing = await store.get(STORE_SESSIONS, sessionId);

    const dataToSave: LocalSession = existing
      ? {
          ...existing,
          status: 'draft',
          uploadRequested: false,
          recording: {
            ...existing.recording,
            totalDurationMs: sessionData.recording.totalDurationMs,
            endedAt: sessionData.recording.endedAt,
          },
          modifiedAt: new Date().toISOString(),
        }
      : {
          ...sessionData,
          modifiedAt: new Date().toISOString(),
        };

    await store.put(STORE_SESSIONS, dataToSave);
    console.log('[SaveDraft] Success via idb singleton');
    return;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[SaveDraft] Attempt 1 failed:', msg);
    errors.push(`idb: ${msg}`);
  }

  // Attempt 2: Use a fresh idb connection
  try {
    console.log('[SaveDraft] Attempt 2: Using fresh idb connection');
    const store = await freshDb();
    const existing = await store.get(STORE_SESSIONS, sessionId);

    const dataToSave: LocalSession = existing
      ? {
          ...existing,
          status: 'draft',
          uploadRequested: false,
          recording: {
            ...existing.recording,
            totalDurationMs: sessionData.recording.totalDurationMs,
            endedAt: sessionData.recording.endedAt,
          },
          modifiedAt: new Date().toISOString(),
        }
      : {
          ...sessionData,
          modifiedAt: new Date().toISOString(),
        };

    await store.put(STORE_SESSIONS, dataToSave);
    store.close();
    console.log('[SaveDraft] Success via fresh idb connection');
    return;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[SaveDraft] Attempt 2 failed:', msg);
    errors.push(`freshDb: ${msg}`);
  }

  // Attempt 3: Raw IndexedDB API with retries
  console.log('[SaveDraft] Attempt 3: Raw IndexedDB API');

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await saveSessionRaw(sessionId, sessionData);
      console.log(`[SaveDraft] Success via raw API on attempt ${attempt}`);
      return;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[SaveDraft] Raw API attempt ${attempt} failed:`, msg);
      errors.push(`raw(${attempt}): ${msg}`);

      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise(r => setTimeout(r, 500 * attempt));
      }
    }
  }

  // All attempts failed
  throw new Error(`All save attempts failed: ${errors.join('; ')}`);
}

function saveSessionRaw(sessionId: string, sessionData: LocalSession): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error(`Failed to open database: ${request.error?.message}`));
    };

    request.onblocked = () => {
      reject(new Error('Database blocked - another connection is preventing upgrade'));
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      // Create stores if they don't exist (shouldn't happen if worker ran first)
      if (!database.objectStoreNames.contains(STORE_SESSIONS)) {
        const sessionsStore = database.createObjectStore(STORE_SESSIONS, { keyPath: 'id' });
        sessionsStore.createIndex('lessonId', 'lessonId', { unique: false });
        sessionsStore.createIndex('status', 'status', { unique: false });
      }
    };

    request.onsuccess = () => {
      const database = request.result;

      // Handle database close events
      database.onversionchange = () => {
        database.close();
        reject(new Error('Database version changed while connection open'));
      };

      try {
        // Check if store exists
        if (!database.objectStoreNames.contains(STORE_SESSIONS)) {
          database.close();
          reject(new Error(`Store ${STORE_SESSIONS} does not exist`));
          return;
        }

        const transaction = database.transaction(STORE_SESSIONS, 'readwrite');
        const store = transaction.objectStore(STORE_SESSIONS);

        // Get existing session first
        const getRequest = store.get(sessionId);

        getRequest.onsuccess = () => {
          const existing = getRequest.result;
          const dataToSave: LocalSession = existing
            ? {
                ...existing,
                status: 'draft',
                uploadRequested: false,
                recording: {
                  ...existing.recording,
                  totalDurationMs: sessionData.recording.totalDurationMs,
                  endedAt: sessionData.recording.endedAt,
                },
                modifiedAt: new Date().toISOString(),
              }
            : {
                ...sessionData,
                modifiedAt: new Date().toISOString(),
              };

          const putRequest = store.put(dataToSave);

          putRequest.onsuccess = () => {
            // Don't close until transaction completes
          };

          putRequest.onerror = () => {
            database.close();
            reject(new Error(`Put failed: ${putRequest.error?.message}`));
          };
        };

        getRequest.onerror = () => {
          // Get failed, try put with new data anyway
          const dataToSave = { ...sessionData, modifiedAt: new Date().toISOString() };
          const putRequest = store.put(dataToSave);

          putRequest.onerror = () => {
            database.close();
            reject(new Error(`Put failed after get error: ${putRequest.error?.message}`));
          };
        };

        transaction.oncomplete = () => {
          database.close();
          resolve();
        };

        transaction.onerror = () => {
          database.close();
          reject(new Error(`Transaction error: ${transaction.error?.message}`));
        };

        transaction.onabort = () => {
          database.close();
          reject(new Error(`Transaction aborted: ${transaction.error?.message}`));
        };

      } catch (err) {
        database.close();
        reject(err);
      }
    };
  });
}
