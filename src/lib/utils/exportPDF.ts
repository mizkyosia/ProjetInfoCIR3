import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import type { Presentation } from '$lib/types/presentation';

export interface ExportOptions {
    quality?: 'low' | 'medium' | 'high';
    onProgress?: (current: number, total: number) => void;
}

/**
 * Waits for images to load in an element
 */
async function waitForImages(element: HTMLElement, timeout: number = 10000): Promise<void> {
    const images = element.querySelectorAll('img');
    const promises: Promise<void>[] = [];

    for (const img of images) {
        promises.push(
            new Promise<void>((resolve) => {
                if ((img as HTMLImageElement).complete) {
                    resolve();
                } else {
                    const timer = setTimeout(() => resolve(), timeout);
                    img.onload = () => {
                        clearTimeout(timer);
                        resolve();
                    };
                    img.onerror = () => {
                        clearTimeout(timer);
                        resolve();
                    };
                }
            }),
        );
    }

    await Promise.all(promises);
}

/**
 * Interface for extracted links from a slide
 */
interface ExtractedLink {
    href: string;
    text: string;
    element: HTMLElement;
}

/**
 * Extracts all links from a slide element
 */
function extractLinksFromSlide(slideElement: HTMLElement): ExtractedLink[] {
    const links: ExtractedLink[] = [];
    const anchors = slideElement.querySelectorAll('a');

    for (const anchor of anchors) {
        const href = anchor.getAttribute('href');
        if (href) {
            links.push({
                href,
                text: anchor.textContent || 'Link',
                element: anchor as HTMLElement,
            });
        }
    }

    return links;
}

/**
 * Calculates the bounding box of an element relative to its slide container
 */
function getElementBoundingBox(
    element: HTMLElement,
    slideContainer: HTMLElement,
): { x: number; y: number; width: number; height: number } | null {
    const rect = element.getBoundingClientRect();
    const containerRect = slideContainer.getBoundingClientRect();

    // Check if element is within the slide container
    if (
        rect.left < containerRect.left ||
        rect.top < containerRect.top ||
        rect.right > containerRect.right ||
        rect.bottom > containerRect.bottom
    ) {
        // Element is outside the slide, don't create a link
        return null;
    }

    return {
        x: rect.left - containerRect.left,
        y: rect.top - containerRect.top,
        width: rect.width,
        height: rect.height,
    };
}

/**
 * Renders a single slide container to canvas
 */
export async function renderSlideToCanvas(
    slideElement: HTMLElement,
    slideWidth: number,
    slideHeight: number,
    scale: number = 2,
): Promise<HTMLCanvasElement> {
    // Clone and prepare the slide
    const container = document.createElement('div');
    container.style.width = `${slideWidth}px`;
    container.style.height = `${slideHeight}px`;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.backgroundColor = '#ffffff';
    container.style.overflow = 'hidden';

    // Clone the slide content
    const clonedSlide = slideElement.cloneNode(true) as HTMLElement;
    clonedSlide.style.width = '100%';
    clonedSlide.style.height = '100%';
    clonedSlide.style.margin = '0';
    clonedSlide.style.padding = '0';

    container.appendChild(clonedSlide);
    document.body.appendChild(container);

    try {
        // Wait for images to load
        await waitForImages(container);

        // Render to canvas
        const canvas = await html2canvas(container, {
            scale,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#ffffff',
            imageTimeout: 5000,
            width: slideWidth,
            height: slideHeight,
        });

        return canvas;
    } finally {
        document.body.removeChild(container);
    }
}

/**
 * Exports entire presentation to PDF
 * Uses export-slides-container to render all slides
 */
export async function exportPresentationToPDF(
    presentation: Presentation,
    options: ExportOptions = {},
): Promise<void> {
    const { quality = 'high', onProgress } = options;
    const scale = quality === 'high' ? 2 : quality === 'medium' ? 1.5 : 1;

    const slides = presentation.slides;
    const totalSlides = slides.length;

    if (totalSlides === 0) {
        throw new Error('No slides to export');
    }

    // Get or create export container
    let exportContainer = document.getElementById('export-slides-container');
    const containerWasHidden = exportContainer?.style.display === 'none';

    if (!exportContainer) {
        throw new Error('Export slides container not found. Make sure ExportSlideRenderer is mounted.');
    }

    // Temporarily show the container for rendering
    exportContainer.style.display = 'block';

    try {
        // Give the DOM time to render
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Create PDF
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
        });

        // Get all slide elements
        const slideElements = exportContainer.querySelectorAll('[data-slide-id]');

        if (slideElements.length === 0) {
            throw new Error('No slides found in export container');
        }

        // Process each slide
        for (let slideIndex = 0; slideIndex < Math.min(slideElements.length, totalSlides); slideIndex++) {
            const slideEl = slideElements[slideIndex] as HTMLElement;
            const slide = slides[slideIndex];

            try {
                // Extract links from the slide
                const links = extractLinksFromSlide(slideEl);

                // Render slide to canvas
                const canvas = await renderSlideToCanvas(slideEl, slide.width, slide.height, scale);

                console.log(`Exported slide ${slideIndex + 1} to canvas`);

                // Determine orientation based on slide dimensions
                const orientation = slide.width > slide.height ? 'landscape' : 'portrait';

                // Add page to PDF with slide's actual dimensions
                if (slideIndex > 0) {
                    pdf.addPage([slide.width, slide.height], orientation);
                } else {
                    pdf.internal.pageSize.width = slide.width;
                    pdf.internal.pageSize.height = slide.height;
                }

                // Add slide destination/anchor with slide ID
                pdf.setPage(slideIndex + 1);

                // Convert canvas to image data
                const imgData = canvas.toDataURL('image/png');

                // Add image to the page at full size
                pdf.addImage(imgData, 'PNG', 0, 0, slide.width, slide.height);

                // Add clickable link annotations to the PDF
                for (const link of links) {
                    const bbox = getElementBoundingBox(link.element, slideEl);
                    if (bbox) {
                        // Link coordinates match the slide dimensions directly
                        const linkX = bbox.x;
                        const linkY = bbox.y;
                        const linkWidth = bbox.width;
                        const linkHeight = bbox.height;

                        // Determine link destination
                        if (link.href.startsWith('#')) {
                            // Internal anchor link - reference slide by ID
                            const slideIdRef = link.href.substring(1);
                            const targetSlide = slides.find((s) => s.id === slideIdRef);
                            if (targetSlide) {
                                const targetPageNum = slides.indexOf(targetSlide) + 1;
                                pdf.link(linkX, linkY, linkWidth, linkHeight, { pageNumber: targetPageNum });
                            }
                        } else if (link.href.startsWith('http') || link.href.startsWith('mailto:')) {
                            // External link
                            pdf.link(linkX, linkY, linkWidth, linkHeight, link.href);
                        } else {
                            // Try to find slide by ID (without hash)
                            const targetSlide = slides.find((s) => s.id === link.href);
                            if (targetSlide) {
                                const targetPageNum = slides.indexOf(targetSlide) + 1;
                                pdf.link(linkX, linkY, linkWidth, linkHeight, { pageNumber: targetPageNum });
                            }
                        }
                    }
                }

                onProgress?.(slideIndex + 1, totalSlides);
            } catch (error) {
                console.error(`Error exporting slide ${slideIndex + 1}:`, error);
                onProgress?.(slideIndex + 1, totalSlides);
            }
        }

        // Save the PDF
        pdf.save(`${presentation.title || 'presentation'}.pdf`);
    } finally {
        // Hide container again if it was hidden before
        if (containerWasHidden && exportContainer) {
            exportContainer.style.display = 'none';
        }
    }
}
