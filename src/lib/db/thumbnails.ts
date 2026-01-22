import { captureElement } from "$lib/util";
import { editorDB } from "$lib/db/schema";
import { imageUrlMap } from "$lib/state.svelte";

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

    imageUrlMap.set(slideId, URL.createObjectURL(blob));
}

export async function getSlideThumbnailURL(
    slideId: string,
): Promise<string | null> {
    let url = imageUrlMap.get(slideId);

    if (!url) {
        const entry = await editorDB.get("slideThumbnails", slideId);
        if (!entry) return null;

        url = URL.createObjectURL(entry.blob);
        imageUrlMap.set(slideId, url);
    }
    return url;
}
