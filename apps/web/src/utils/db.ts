import { DB_NAME, DB_VERSION, STORE_AUDIO, STORE_CLASS, type AudioBatch, type CompressedStroke } from "@/utils/constant";


/** Open (or create) IndexedDB database with both stores */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request: IDBOpenDBRequest = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create CLASS store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_CLASS)) {
        db.createObjectStore(STORE_CLASS, {
          keyPath: "id",
          autoIncrement: true,
        });
      }

      // Create Audio store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_AUDIO)) {
        db.createObjectStore(STORE_AUDIO, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = (event: Event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// ==================== STROKE OPERATIONS ====================

export async function addStrokes(
  payloads: CompressedStroke[],
): Promise<string[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CLASS, "readwrite");
    const store = tx.objectStore(STORE_CLASS);

    const ids: string[] = [];

    payloads.forEach((payload) => {
      const request = store.add(payload);

      request.onsuccess = () => {
        ids.push(request.result as string);
      };

      request.onerror = () => reject(request.error);
    });

    tx.oncomplete = () => resolve(ids);
    tx.onerror = () => reject(tx.error);
  });
}

/** READ: Get all strokes from IndexedDB */
export async function getClass(): Promise<CompressedStroke[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx: IDBTransaction = db.transaction(STORE_CLASS, "readonly");
    const store: IDBObjectStore = tx.objectStore(STORE_CLASS);

    const request: IDBRequest<CompressedStroke[]> = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);

    tx.onerror = () => reject(tx.error);
  });
}

/** READ: Get a single stroke by ID */
export async function getClassById(
  id: string,
): Promise<CompressedStroke | undefined> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx: IDBTransaction = db.transaction(STORE_CLASS, "readonly");
    const store: IDBObjectStore = tx.objectStore(STORE_CLASS);

    const request: IDBRequest<CompressedStroke> = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);

    tx.onerror = () => reject(tx.error);
  });
}

/** UPDATE: Update an existing stroke */
export async function updateClass(stroke: CompressedStroke): Promise<void> {
  if (!stroke.id) {
    throw new Error("Stroke ID is required for update");
  }

  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx: IDBTransaction = db.transaction(STORE_CLASS, "readwrite");
    const store: IDBObjectStore = tx.objectStore(STORE_CLASS);

    const request: IDBRequest<IDBValidKey> = store.put(stroke);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    tx.onerror = () => reject(tx.error);
  });
}

/** DELETE: Remove a stroke by ID */
export async function deleteClass(id: string): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx: IDBTransaction = db.transaction(STORE_CLASS, "readwrite");
    const store: IDBObjectStore = tx.objectStore(STORE_CLASS);

    const request: IDBRequest<undefined> = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    tx.onerror = () => reject(tx.error);
  });
}

/** DELETE: Clear all strokes */
export async function clearClass(): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx: IDBTransaction = db.transaction(STORE_CLASS, "readwrite");
    const store: IDBObjectStore = tx.objectStore(STORE_CLASS);

    const request: IDBRequest<undefined> = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    tx.onerror = () => reject(tx.error);
  });
}

// ==================== AUDIO OPERATIONS ====================

/** CREATE: Add audio to IndexedDB */
export async function addAudio(payload: AudioBatch): Promise<string> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx: IDBTransaction = db.transaction(STORE_AUDIO, "readwrite");
    const store: IDBObjectStore = tx.objectStore(STORE_AUDIO);

    const request: IDBRequest<IDBValidKey> = store.add(payload);

    request.onsuccess = () => resolve(request.result as string);
    request.onerror = () => reject(request.error);

    tx.onerror = () => reject(tx.error);
  });
}

/** READ: Get all audio from IndexedDB */
export async function getAudio(): Promise<AudioBatch[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx: IDBTransaction = db.transaction(STORE_AUDIO, "readonly");
    const store: IDBObjectStore = tx.objectStore(STORE_AUDIO);

    const request: IDBRequest<AudioBatch[]> = store.getAll();

    request.onsuccess = () => {
      // ✅ Sort by batchId before returning
      const sortedAudio = request.result.sort((a, b) => a.batchId - b.batchId);
      resolve(sortedAudio);
    };

    request.onerror = () => reject(request.error);

    tx.onerror = () => reject(tx.error);
  });
}

/** DELETE: Clear all audio */
export async function clearAudio(): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx: IDBTransaction = db.transaction(STORE_AUDIO, "readwrite");
    const store: IDBObjectStore = tx.objectStore(STORE_AUDIO);

    const request: IDBRequest<undefined> = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    tx.onerror = () => reject(tx.error);
  });
}
