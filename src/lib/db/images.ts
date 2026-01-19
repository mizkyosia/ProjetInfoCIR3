import { editorDB } from "./schema";

export async function saveImage(file: File): Promise<string> {
    const id = crypto.randomUUID();

    await editorDB.put(
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
    const record = await editorDB.get("images", id);
    if (!record) return null;

    return URL.createObjectURL(record.blob);
}

export async function deleteImage(id: string) {
    await editorDB.delete("images", id);
}
