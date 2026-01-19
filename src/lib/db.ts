// src/lib/db/images.ts
import { openDB, type DBSchema } from "idb";

interface ImageDB extends DBSchema {
    images: {
        key: string;
        value: {
            blob: Blob;
            type: string;
            createdAt: number;
        };
    };
}

interface PresentationDB extends DBSchema {
    images: {
        key: string;
        value: {
            blob: Blob;
            type: string;
            createdAt: number;
        };
    };
}

export const imageDB = await openDB<ImageDB>("image-assets", 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains("images")) {
            db.createObjectStore("images");
        }
    },
});

export const presentationDB = await openDB<ImageDB>("image-assets", 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains("images")) {
            db.createObjectStore("images");
        }
    },
});

export async function saveImage(file: File): Promise<string> {
    const id = crypto.randomUUID();

    await imageDB.put(
        "images",
        {
            blob: file,
            type: file.type,
            createdAt: Date.now(),
        },
        id,
    );

    return id;
}

export async function getImageURL(id: string): Promise<string | null> {
    const record = await imageDB.get("images", id);
    if (!record) return null;

    return URL.createObjectURL(record.blob);
}