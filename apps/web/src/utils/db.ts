import { openDB, type IDBPDatabase } from 'idb';
import {
  DB_NAME, DB_VERSION, STORE_CLASS, STORE_AUDIO,
  type CompressedStroke, type AudioBatch,
} from '@/utils/constant';

// ── Singleton connection ───────────────────────────────────────────────────────
// One IDBDatabase instance is reused for the lifetime of the tab.
// The old raw-API version opened a new connection on every single call.

let _db: IDBPDatabase | null = null;

async function db(): Promise<IDBPDatabase> {
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

export async function clearAudio(): Promise<void> {
  await (await db()).clear(STORE_AUDIO);
}
