import type { MediaType } from "@/utils/constant";
import { openDB } from "idb";

const DB_NAME = "image-store";
const STORE = "images";

const getDb = () =>
    openDB(DB_NAME, 1, {
        upgrade(db) {
            db.createObjectStore(STORE, { keyPath: "id" });
        },
    });

// ✅ CREATE
export const saveImage = async (id: string, blob: Blob, type: MediaType, name: string): Promise<void> => {
    const db = await getDb();
    await db.put(STORE, { id, blob, name, createdAt: Date.now(), type });
};

// ✅ READ ONE
export const getImage = async (id: string): Promise<string | null> => {
    const db = await getDb();
    const record = await db.get(STORE, id);
    if (!record) return null;
    return URL.createObjectURL(record.blob);
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