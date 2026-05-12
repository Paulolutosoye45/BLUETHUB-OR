import type { MediaType } from "@/utils/constant";
import { openDB } from "idb";

const DB_NAME = "image-store";
const DB_VERSION = 2; // bump to wipe stale blobs cached without sourceUrl
const STORE = "images";

const getDb = () =>
    openDB(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion) {
            // v1 → v2: drop and recreate the store so all old blobs are evicted.
            if (oldVersion < 2 && db.objectStoreNames.contains(STORE)) {
                db.deleteObjectStore(STORE);
            }
            if (!db.objectStoreNames.contains(STORE)) {
                db.createObjectStore(STORE, { keyPath: "id" });
            }
        },
    });

// ✅ CREATE
export const saveImage = async (id: string, blob: Blob, type: MediaType, name: string, sourceUrl?: string): Promise<void> => {
    const db = await getDb();
    await db.put(STORE, { id, blob, name, createdAt: Date.now(), type, sourceUrl: sourceUrl ?? null });
};

// ✅ READ ONE
export const getImage = async (id: string): Promise<string | null> => {
    const db = await getDb();
    const record = await db.get(STORE, id);
    if (!record) return null;
    return URL.createObjectURL(record.blob);
};

// Returns the stored sourceUrl so callers can check if the file changed.
export const getImageSourceUrl = async (id: string): Promise<string | null> => {
    const db = await getDb();
    const record = await db.get(STORE, id);
    return record?.sourceUrl ?? null;
};

// ✅ READ ALL
export const getAllImages = async (): Promise<{ id: string; url: string }[]> => {
    const db = await getDb();
    const records = await db.getAll(STORE);
    return records.map((record) => ({
        id: record.id,
        url: URL.createObjectURL(record.blob),
    }));
};

// ✅ UPDATE
export const updateImage = async (id: string, blob: Blob): Promise<void> => {
    const db = await getDb();
    const existing = await db.get(STORE, id);
    if (!existing) throw new Error(`Image with id "${id}" not found`);
    await db.put(STORE, { id, blob, createdAt: existing.createdAt, updatedAt: Date.now() });
};

// ✅ DELETE ONE
export const deleteImage = async (id: string): Promise<void> => {
    const db = await getDb();
    await db.delete(STORE, id);
};

// ✅ DELETE ALL
export const clearAllImages = async (): Promise<void> => {
    const db = await getDb();
    await db.clear(STORE);
};