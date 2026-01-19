import { openDB, type DBSchema } from "idb";
import type { Presentation } from "$lib/types/presentation";

interface EditorDB extends DBSchema {
    images: {
        key: string;
        value: {
            blob: Blob;
            type: string;
            createdAt: number;
        };
    };
    presentations: {
        key: string;
        value: Presentation;
        indexes: {
            "by-updated": number;
        };
    };
}

export const editorDB = await openDB<EditorDB>("editor-db", 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains("images")) {
            db.createObjectStore("images");
        }

        if (!db.objectStoreNames.contains("presentations")) {
            const store = db.createObjectStore("presentations", {
                keyPath: "id",
            });
            store.createIndex("by-updated", "updatedAt");
        }
    },
});
