import { editorDB } from "./schema";
import type { Presentation } from "$lib/types/presentation";

export async function savePresentation(presentation: Presentation) {
    presentation.updatedAt = Date.now();
    await editorDB.put("presentations", presentation);
}

export async function getPresentation(
    id: string,
): Promise<Presentation | null> {
    return (await editorDB.get("presentations", id)) ?? null;
}

export async function listPresentations(): Promise<Presentation[]> {
    return await editorDB.getAllFromIndex("presentations", "by-updated");
}

export async function deletePresentation(id: string) {
    await editorDB.delete("presentations", id);
}
