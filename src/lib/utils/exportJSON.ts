import type { Presentation, Slide, Element, ImageElement } from '$lib/types/presentation';
import type { PresentationSaveData } from '$lib/types/presentation';

/**
 * Converts an image URL or data URL to base64 format
 */
async function imageToBase64(imageSource: string): Promise<string> {
    // If already a data URL, return as is
    if (imageSource.startsWith('data:')) {
        return imageSource;
    }

    try {
        const response = await fetch(imageSource);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.warn(`Failed to convert image to base64: ${imageSource}`, error);
        return imageSource; // Return original if conversion fails
    }
}

/**
 * Recursively processes an element and collects assets
 */
async function processElement(
    element: Element,
    assets: { [assetId: string]: string },
): Promise<Element> {
    const processedElement = { ...element } as any;

    // Handle image elements - store base64 in assets and set assetId
    if (element.type === 'image') {
        const imageElement = element as ImageElement;
        const base64 = await imageToBase64(imageElement.assetId);
        const assetId = crypto.randomUUID();
        assets[assetId] = base64;
        processedElement.assetId = assetId;
        console.log(`Processed image element, assigned assetId: ${assetId}`);
    }

    return processedElement;
}

/**
 * Recursively processes a slide and collects assets
 */
async function processSlide(
    slide: Slide,
    assets: { [assetId: string]: string },
): Promise<Slide> {
    const processedSlide = { ...slide };

    // Process slide background image if present
    if (slide.background.type === 'image') {
        const base64 = await imageToBase64(slide.background.value);
        const assetId = crypto.randomUUID();
        assets[assetId] = base64;
        processedSlide.background = {
            ...slide.background,
            value: assetId,
        };
        console.log(`Processed background image, assigned assetId: ${assetId}`);
    }

    // Process all elements in the slide
    processedSlide.elements = await Promise.all(
        slide.elements.map((el) => processElement(el, assets)),
    );

    return processedSlide;
}

/**
 * Exports the current presentation as JSON file with embedded base64 images in assets field
 */
export async function exportPresentationToJSON(presentation: Presentation): Promise<void> {
    try {
        const assets: { [assetId: string]: string } = {};

        // Process all slides and collect assets
        const processedSlides = await Promise.all(
            presentation.slides.map((slide) => processSlide(slide, assets)),
        );

        // Create the processed presentation object of type PresentationSaveData
        const processedPresentation: PresentationSaveData = {
            ...presentation,
            slides: processedSlides,
            assets,
        };

        // Convert to JSON string with nice formatting
        const jsonContent = JSON.stringify(processedPresentation, null, 2);

        // Create blob and download
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${presentation.title || 'presentation'}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting presentation to JSON:', error);
        throw error;
    }
}

/**
 * Imports a presentation from a JSON file and loads all assets
 */
export async function importPresentationFromJSON(file: File): Promise<Presentation> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const jsonContent = event.target?.result as string;
                const presentationData: PresentationSaveData = JSON.parse(jsonContent);

                // Reconstruct presentation with assets
                const presentation: Presentation = {
                    id: crypto.randomUUID(),
                    title: presentationData.title,
                    createdAt: presentationData.createdAt,
                    updatedAt: presentationData.updatedAt,
                    slides: presentationData.slides.map((slide) => ({
                        ...slide,
                        background: {
                            ...slide.background,
                            // If the background value is an assetId, resolve it from assets
                            value: slide.background.type === 'image'
                                ? (presentationData.assets[slide.background.value] || slide.background.value)
                                : slide.background.value,
                        },
                        elements: slide.elements.map((element) => {
                            if (element.type === 'image') {
                                const imageElement = element as ImageElement;
                                return {
                                    ...imageElement,
                                    // Resolve assetId to base64 from assets
                                    assetId: presentationData.assets[imageElement.assetId] || imageElement.assetId,
                                } as ImageElement;
                            }
                            return element;
                        }),
                    })),
                };

                console.log('Successfully imported presentation from JSON');
                resolve(presentation);
            } catch (error) {
                console.error('Error importing presentation from JSON:', error);
                reject(error);
            }
        };

        reader.onerror = () => {
            console.error('Error reading file');
            reject(new Error('Failed to read file'));
        };

        reader.readAsText(file);
    });
}
