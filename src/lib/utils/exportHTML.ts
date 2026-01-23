import { editorStore } from '$lib/state.svelte';
import type { Presentation } from '$lib/types/presentation';

/**
 * Exports entire presentation to HTML
 * Creates an interactive HTML file with slide navigation
 */
export async function exportPresentationToHTML(presentation: Presentation): Promise<void> {
    editorStore.exporting = true;
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

        // Get all slide elements
        const slideElements = exportContainer.querySelectorAll('[data-slide-id]');

        if (slideElements.length === 0) {
            throw new Error('No slides found in export container');
        }

        // Collect slides HTML
        const slidesHTML: string[] = [];

        for (let slideIndex = 0; slideIndex < Math.min(slideElements.length, totalSlides); slideIndex++) {
            const slideEl = slideElements[slideIndex] as HTMLElement;
            const slide = slides[slideIndex];

            // Clone the slide
            const clonedSlide = slideEl.cloneNode(true) as HTMLElement;

            // Create a container for the slide
            const slideContainer = document.createElement('div');
            slideContainer.className = 'slide-container';
            slideContainer.setAttribute('data-slide-id', slide.id);
            slideContainer.style.width = `${slide.width}px`;
            slideContainer.style.height = `${slide.height}px`;
            slideContainer.style.overflow = 'hidden';

            slideContainer.appendChild(clonedSlide);

            // Get the HTML string
            slidesHTML.push(slideContainer.outerHTML);
        }

        // Get current styles from the page (including Tailwind classes)
        let styleSheets = '';
        
        // Extract all stylesheets including Tailwind
        for (const sheet of document.styleSheets) {
            try {
                const rules = Array.from(sheet.cssRules || []);
                styleSheets += rules.map((rule) => rule.cssText).join('\n');
            } catch (e) {
                // CORS or other issues with external stylesheets
                // Try alternative method using computed styles from actual elements
                console.warn('Could not access stylesheet:', sheet.href);
            }
        }

        // Create the HTML document
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${presentation.title || 'Presentation'}</title>
    <!-- Tailwind CSS for styling support -->
    <script src="https://cdn.tailwindcss.com"><\/script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: system-ui, -apple-system, sans-serif;
            background-color: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }

        #presentation-container {
            background: white;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
        }

        .slide-container {
            display: none;
            width: 100%;
            height: 100%;
            position: relative;
        }

        .slide-container.active {
            display: block;
        }

        .slide-navigation {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            background: #f9f9f9;
            border-top: 1px solid #e0e0e0;
            gap: 10px;
        }

        .slide-nav-button {
            padding: 8px 16px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
        }

        .slide-nav-button:hover {
            background: #0056b3;
        }

        .slide-nav-button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }

        .slide-counter {
            color: #666;
            font-size: 14px;
            font-weight: 500;
        }

        /* Embedded styles from the presentation */
        ${styleSheets}
    </style>
</head>
<body>
    <div id="presentation-container">
        <div id="slides-wrapper" style="position: relative; display: flex; align-items: center; justify-content: center;">
            ${slidesHTML.join('\n')}
        </div>
        <div class="slide-navigation">
            <button class="slide-nav-button" id="prev-slide">← Previous</button>
            <span class="slide-counter"><span id="current-slide">1</span> / <span id="total-slides">${totalSlides}</span></span>
            <button class="slide-nav-button" id="next-slide">Next →</button>
        </div>
    </div>

    <script>
        const slides = document.querySelectorAll('.slide-container');
        const totalSlides = slides.length;
        let currentSlideIndex = 0;

        function showSlide(index) {
            if (index < 0 || index >= totalSlides) return;

            // Hide all slides
            slides.forEach((slide) => slide.classList.remove('active'));

            // Show the current slide
            slides[index].classList.add('active');
            currentSlideIndex = index;

            // Update counter
            document.getElementById('current-slide').textContent = index + 1;

            // Update button states
            document.getElementById('prev-slide').disabled = index === 0;
            document.getElementById('next-slide').disabled = index === totalSlides - 1;

            // Update URL fragment
            const slideId = slides[index].getAttribute('data-slide-id');
            if (slideId) {
                window.history.replaceState(null, '', '#' + slideId);
            }
        }

        function navigateToSlideById(slideId) {
            const slideIndex = Array.from(slides).findIndex(
                (slide) => slide.getAttribute('data-slide-id') === slideId
            );
            if (slideIndex !== -1) {
                showSlide(slideIndex);
            }
        }

        // Handle hash changes
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.substring(1);
            if (hash) {
                navigateToSlideById(hash);
            } else {
                showSlide(0);
            }
        });

        // Handle navigation buttons
        document.getElementById('prev-slide').addEventListener('click', () => {
            showSlide(currentSlideIndex - 1);
        });

        document.getElementById('next-slide').addEventListener('click', () => {
            showSlide(currentSlideIndex + 1);
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                showSlide(currentSlideIndex - 1);
            } else if (e.key === 'ArrowRight') {
                showSlide(currentSlideIndex + 1);
            }
        });

        // Initialize on page load
        const initialHash = window.location.hash.substring(1);
        if (initialHash) {
            navigateToSlideById(initialHash);
        } else {
            showSlide(0);
        }

        // Handle link clicks to slides
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target.tagName === 'A') {
                const href = target.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const slideId = href.substring(1);
                    navigateToSlideById(slideId);
                    e.preventDefault();
                }
            }
        });
    </script>
</body>
</html>`;

        // Create blob and download
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${presentation.title || 'presentation'}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } finally {
        // Hide container again if it was hidden before
        if (containerWasHidden && exportContainer) {
            exportContainer.style.display = 'none';
        }
        editorStore.exporting = false;
    }
}
