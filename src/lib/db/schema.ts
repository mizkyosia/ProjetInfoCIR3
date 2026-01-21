import { openDB, type DBSchema } from "idb";
import type { Presentation } from "$lib/types/presentation";

interface EditorDB extends DBSchema {
    images: {
        key: string;
        value: {
            id: string;
            blob: Blob;
            type: string;
            createdAt: number;
        };
        indexes: {
            "by-uploaded": number;
        };
    };
    presentations: {
        key: string;
        value: Presentation;
        indexes: {
            "by-updated": number;
        };
    };
    slideThumbnails: {
        key: string; // slideId
        value: {
            slideId: string;
            blob: Blob;
            updatedAt: number;
        };
        indexes: {
            "by-updated": number;
        };
    };
}

export const editorDB = await openDB<EditorDB>("editor-db", 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains("images")) {
            const store = db.createObjectStore("images", { keyPath: "id" });
            store.createIndex("by-uploaded", "createdAt");
        }

        if (!db.objectStoreNames.contains("presentations")) {
            const store = db.createObjectStore("presentations", {
                keyPath: "id",
            });
            store.createIndex("by-updated", "createdAt");
        }

        if (!db.objectStoreNames.contains("slideThumbnails")) {
            const store = db.createObjectStore("slideThumbnails", {
                keyPath: "slideId",
            });
            store.createIndex("by-updated", "updatedAt");
        }
    },
});
