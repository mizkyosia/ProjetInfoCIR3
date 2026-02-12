import { renderSlideToCanvas } from "$lib/utils/exportPDF";
import { editorDB } from "$lib/db/schema";
import { imageUrlMap } from "$lib/state.svelte";

export async function updateSlideThumbnail(
    slideId: string,
    slideElement: HTMLElement,
    slideWidth: number,
    slideHeight: number,
) {
    const canvas = await renderSlideToCanvas(
        slideElement,
        slideWidth,
        slideHeight,
        0.4, // scale for thumbnail resolution
    );

    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error("Failed to convert canvas to blob"));
                }
            },
            "image/png",
        );
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
