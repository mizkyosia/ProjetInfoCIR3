import { editorDB } from "./schema";

export async function saveImage(file: File): Promise<string> {
    const id = crypto.randomUUID();

    await editorDB.put("images", {
        blob: file as Blob,
        type: file.type,
        createdAt: Date.now(),
        id,
    });

    return id;
}

export async function listImageURLs(): Promise<{ id: string; url: string }[]> {
    const tx = editorDB.transaction("images", "readonly");
    const index = tx.store.index("by-uploaded");

    const results = [];

    for await (const cursor of index.iterate(null, "prev")) {
        results.push({
            url: URL.createObjectURL(cursor.value.blob),
            id: cursor.value.id,
        });
    }

    await tx.done;


    return results;
}

export async function getImageURL(id: string): Promise<string | null> {
    const record = await editorDB.get("images", id);
    if (!record) return null;

    return URL.createObjectURL(record.blob);
}

export async function deleteImage(id: string) {
    await editorDB.delete("images", id);
}
