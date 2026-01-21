import { editorDB } from "./schema";
import type { Presentation, Slide } from "$lib/types/presentation";

export async function savePresentation(presentation: Presentation) {
    presentation.updatedAt = Date.now();
    await editorDB.put("presentations", $state.snapshot(presentation));
}

export async function getPresentation(
    id: string,
): Promise<Presentation | null> {
    const pres = await editorDB.get("presentations", id);

    return pres ?? null;
}

export async function listPresentations(): Promise<Presentation[]> {
    return await editorDB.getAllFromIndex("presentations", "by-updated");
}

export async function deletePresentation(id: string) {
    await editorDB.delete("presentations", id);
}

export function newSlide(): Slide {
    return {
        id: crypto.randomUUID(),
        background: {
            type: "color",
            value: "#ffffff",
        },
        elements: [],
        width: 800,
        height: 500,
    };
}
