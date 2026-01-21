import { toBlob } from "html-to-image";

export async function captureElement(
    el: HTMLElement,
    options?: {
        pixelRatio?: number;
        backgroundColor?: string;
    },
): Promise<Blob> {
    console.log("before");
    const blob = await toBlob(el, {
        cacheBust: true,
        pixelRatio: options?.pixelRatio ?? window.devicePixelRatio,
        backgroundColor: options?.backgroundColor ?? "#ffffff",
        skipFonts: true,
    });

    console.log("test");

    if (!blob) {
        throw new Error("Failed to capture element");
    }

    return blob;
}
