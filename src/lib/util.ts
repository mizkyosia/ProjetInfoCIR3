import { toBlob } from "html-to-image";

export async function captureElement(
    el: HTMLElement,
    options?: {
        pixelRatio?: number;
        backgroundColor?: string;
    },
): Promise<Blob> {
    const blob = await toBlob(el, {
        cacheBust: true,
        pixelRatio: options?.pixelRatio ?? window.devicePixelRatio,
        backgroundColor: options?.backgroundColor ?? "#ffffff",
        skipFonts: true,
    });

    if (!blob) {
        throw new Error("Failed to capture element");
    }

    return blob;
}
