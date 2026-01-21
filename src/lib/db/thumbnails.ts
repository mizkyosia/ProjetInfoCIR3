import { captureElement } from "$lib/util";
import { editorDB } from "$lib/db/schema";

export async function updateSlideThumbnail(
    slideId: string,
    slideElement: HTMLElement,
) {
    const blob = await captureElement(slideElement, {
        pixelRatio: 0.4, // thumbnail resolution
        backgroundColor: "#ffffff",
    });

    await editorDB.put("slideThumbnails", {
        slideId,
        blob,
        updatedAt: Date.now(),
    });
}

export async function getSlideThumbnailURL(
    slideId: string,
): Promise<string | null> {
    const entry = await editorDB.get("slideThumbnails", slideId);
    if (!entry) return null;
    return URL.createObjectURL(entry.blob);
}
