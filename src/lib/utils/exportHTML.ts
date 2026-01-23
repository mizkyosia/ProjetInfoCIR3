import { editorStore } from '$lib/state.svelte';
import type { Presentation } from '$lib/types/presentation';

/**
 * Processes quiz elements in a cloned slide to make them interactive
 */
function processQuizzesInSlide(slideElement: HTMLElement): void {
    // Find all quiz elements (they have a specific pattern)
    const quizElements = slideElement.querySelectorAll('[class*="overflow-hidden"][class*="p-4"]');
    
    quizElements.forEach((quizEl, quizIndex) => {
        const buttons = quizEl.querySelectorAll('button');
        
        // Check if this looks like a quiz element (has buttons as options)
        if (buttons.length > 0) {
            // Try to extract quiz data from the HTML
            const h3 = quizEl.querySelector('h3');
            if (h3 && h3.textContent) {
                // This looks like it could be a quiz
                // We need to find the correct answer by looking at button data or structure
                // For now, we'll add data attributes and let the rendered component set them up
                
                // Look for a hidden element or data that stores the quiz config
                const parent = quizEl.closest('[data-widget]');
                if (parent) {
                    const quizId = 'quiz-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                    quizEl.setAttribute('data-quiz-id', quizId);
                    // We'll set the correct answer after getting it from the slide data
                }
            }
        }
    });
}

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

        // Collect slides HTML and prepare slide names
        const slidesHTML: string[] = [];
        const slideNames: Array<{ id: string; name: string }> = [];

        for (let slideIndex = 0; slideIndex < Math.min(slideElements.length, totalSlides); slideIndex++) {
            const slideEl = slideElements[slideIndex] as HTMLElement;
            const slide = slides[slideIndex];

            // Clone the slide
            const clonedSlide = slideEl.cloneNode(true) as HTMLElement;

            // Process quiz elements
            let quizIndex = 0;
            for (const quizzElement of slide.elements) {
                if (quizzElement.type === 'quizz') {
                    // Find the quiz in the cloned slide by looking for the matching position
                    const quizContainers = Array.from(
                        clonedSlide.querySelectorAll('[class*="overflow-hidden"][class*="p-4"][style*="border"]')
                    ) as HTMLElement[];
                    
                    // Find quizzes by looking for h3 with question text
                    const quizzes = quizContainers.filter(container => {
                        const h3 = container.querySelector('h3');
                        return h3 && h3.textContent === quizzElement.question;
                    });

                    if (quizzes.length > 0) {
                        const quizContainer = quizzes[0];
                        const quizId = 'quiz-' + slideIndex + '-' + quizIndex;
                        quizContainer.setAttribute('data-quiz-id', quizId);
                        quizContainer.setAttribute('data-correct-answer', quizzElement.correctAnswerIndex.toString());
                        
                        // Transform buttons to quiz options
                        const buttons = Array.from(quizContainer.querySelectorAll('button[onclick]')) as HTMLButtonElement[];
                        buttons.forEach((btn, btnIndex) => {
                            // Change button to quiz option
                            btn.className = 'quiz-option';
                            btn.onclick = null;
                            btn.disabled = false;
                        });

                        // Add submit and reset buttons container
                        const flexContainer = quizContainer.querySelector('.flex.flex-col');
                        if (flexContainer) {
                            // Create button container
                            const buttonContainer = document.createElement('div');
                            buttonContainer.style.display = 'flex';
                            buttonContainer.style.alignItems = 'center';
                            buttonContainer.style.marginTop = '12px';
                            
                            const submitBtn = document.createElement('button');
                            submitBtn.className = 'quiz-submit-button';
                            submitBtn.textContent = 'Submit Answer';
                            
                            const resetBtn = document.createElement('button');
                            resetBtn.className = 'quiz-reset-button';
                            resetBtn.textContent = 'Reset';
                            resetBtn.style.display = 'none';
                            
                            buttonContainer.appendChild(submitBtn);
                            buttonContainer.appendChild(resetBtn);
                            
                            flexContainer.appendChild(buttonContainer);
                            
                            // Add feedback container
                            const feedbackDiv = document.createElement('div');
                            feedbackDiv.className = 'quiz-feedback';
                            flexContainer.appendChild(feedbackDiv);
                        }
                        
                        quizIndex++;
                    }
                }
            }

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

            // Store slide name
            slideNames.push({
                id: slide.id,
                name: slide.name || `Slide ${slideIndex + 1}`,
            });
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
            background-color: #000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 0;
            margin: 0;
            width: 100%;
            height: 100vh;
            overflow: hidden;
        }

        #presentation-container {
            background: white;
            width: 100%;
            height: calc(100vh - 60px);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        #slides-wrapper {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            width: 100%;
            height: 100%;
        }

        .slide-container {
            display: none;
            position: absolute;
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
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
            height: 60px;
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

        /* Quiz styles */
        .quiz-option {
            padding: 12px;
            border: 2px solid #d4d4d8;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            background-color: white;
            font-size: 14px;
        }

        .quiz-option:hover:not(:disabled) {
            border-color: #999;
            background-color: #f5f5f5;
        }

        .quiz-option.selected {
            border-color: #3b82f6;
            background-color: #dbeafe;
            font-weight: bold;
        }

        .quiz-option.correct {
            border-color: #22c55e;
            background-color: #dcfce7;
            color: #166534;
        }

        .quiz-option.incorrect {
            border-color: #ef4444;
            background-color: #fee2e2;
            color: #991b1b;
        }

        .quiz-option:disabled {
            cursor: not-allowed;
        }

        .quiz-submit-button {
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
            margin-top: 12px;
        }

        .quiz-submit-button:hover:not(:disabled) {
            background: #0056b3;
        }

        .quiz-submit-button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }

        .quiz-reset-button {
            padding: 8px 16px;
            background: #6b7280;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
            margin-left: 8px;
        }

        .quiz-reset-button:hover {
            background: #4b5563;
        }

        .quiz-feedback {
            margin-top: 12px;
            padding: 12px;
            border-radius: 4px;
            font-size: 14px;
            display: none;
        }

        .quiz-feedback.show {
            display: block;
        }

        .quiz-feedback.correct {
            background-color: #dcfce7;
            color: #166534;
            border: 1px solid #22c55e;
        }

        .quiz-feedback.incorrect {
            background-color: #fee2e2;
            color: #991b1b;
            border: 1px solid #ef4444;
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
            <button class="slide-nav-button" id="prev-slide">← Back</button>
            <span class="slide-counter" id="slide-name"></span>
        </div>
    </div>

    <script>
        const slides = document.querySelectorAll('.slide-container');
        const slideNames = ${JSON.stringify(slideNames)};
        const totalSlides = slides.length;
        let currentSlideIndex = 0;
        let navigationHistory = [0]; // Keep track of visited slides
        const slidesWrapper = document.getElementById('slides-wrapper');

        // Quiz state management
        const quizStates = {};

        function initializeQuizzes() {
            const quizzes = document.querySelectorAll('[data-quiz-id]');
            quizzes.forEach(quiz => {
                const quizId = quiz.getAttribute('data-quiz-id');
                const correctAnswerIndex = parseInt(quiz.getAttribute('data-correct-answer'), 10);
                quizStates[quizId] = {
                    selectedIndex: null,
                    submitted: false,
                    correctAnswerIndex: correctAnswerIndex
                };
                setupQuizListeners(quiz, quizId);
            });
        }

        function setupQuizListeners(quizContainer, quizId) {
            console.log('Setting up quiz listeners for', quizId);
            const options = quizContainer.querySelectorAll('.quiz-option');
            const submitButton = quizContainer.querySelector('.quiz-submit-button');
            const resetButton = quizContainer.querySelector('.quiz-reset-button');
            const feedback = quizContainer.querySelector('.quiz-feedback');

            console.log('Options found:', options.length);

            options.forEach((option, index) => {
                console.log('Setting up option', index, 'for quiz', quizId);
                option.addEventListener('click', () => {
                    if (!quizStates[quizId].submitted) {
                        selectQuizOption(quizContainer, quizId, index);
                    }
                });
            });

            console.log('Submit button:', submitButton);
            console.log('Reset button:', resetButton);

            submitButton?.addEventListener('click', () => {
            console.log('Submitting answer for quiz', quizId);
                submitQuizAnswer(quizContainer, quizId);
            });

            resetButton?.addEventListener('click', () => {
                resetQuiz(quizContainer, quizId);
            });
        }

        function selectQuizOption(quizContainer, quizId, index) {
            console.log('Selected option', index, 'for quiz', quizId);
            const state = quizStates[quizId];
            state.selectedIndex = index;

            const options = quizContainer.querySelectorAll('.quiz-option');
            options.forEach((option, i) => {
                if (i === index) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            });
        }

        function submitQuizAnswer(quizContainer, quizId) {
            const state = quizStates[quizId];
            if (state.selectedIndex === null) return;

            console.log('Submitted answer for quiz', quizId, 'Selected:', state.selectedIndex, 'Correct:', state.correctAnswerIndex);

            state.submitted = true;

            const options = quizContainer.querySelectorAll('.quiz-option');
            const submitButton = quizContainer.querySelector('.quiz-submit-button');
            const resetButton = quizContainer.querySelector('.quiz-reset-button');
            const feedback = quizContainer.querySelector('.quiz-feedback');

            // Disable all options after submission
            options.forEach(option => option.disabled = true);

            // Update visual feedback
            options.forEach((option, index) => {
                option.classList.remove('selected');
                if (index === state.correctAnswerIndex) {
                    option.classList.add('correct');
                } else if (index === state.selectedIndex) {
                    option.classList.add('incorrect');
                }
            });

            // Show feedback message
            if (feedback) {
                feedback.classList.add('show');
                if (state.selectedIndex === state.correctAnswerIndex) {
                    feedback.classList.remove('incorrect');
                    feedback.classList.add('correct');
                    feedback.textContent = '✓ Correct!';
                } else {
                    feedback.classList.remove('correct');
                    feedback.classList.add('incorrect');
                    feedback.textContent = '✗ Incorrect. The correct answer is: ' + options[state.correctAnswerIndex].textContent;
                }
            }

            // Hide submit button and show reset button
            if (submitButton) submitButton.style.display = 'none';
            if (resetButton) resetButton.style.display = 'inline-block';
        }

        function resetQuiz(quizContainer, quizId) {
            const state = quizStates[quizId];
            state.selectedIndex = null;
            state.submitted = false;

            const options = quizContainer.querySelectorAll('.quiz-option');
            const submitButton = quizContainer.querySelector('.quiz-submit-button');
            const resetButton = quizContainer.querySelector('.quiz-reset-button');
            const feedback = quizContainer.querySelector('.quiz-feedback');

            // Re-enable all options
            options.forEach(option => {
                option.disabled = false;
                option.classList.remove('selected', 'correct', 'incorrect');
            });

            // Hide feedback
            if (feedback) {
                feedback.classList.remove('show');
            }

            // Show submit button and hide reset button
            if (submitButton) submitButton.style.display = 'inline-block';
            if (resetButton) resetButton.style.display = 'none';
        }

        function scaleSlide(slideElement) {
            // Get wrapper dimensions
            const wrapperWidth = slidesWrapper.clientWidth;
            const wrapperHeight = slidesWrapper.clientHeight;

            // Get slide dimensions
            const slideWidth = slideElement.offsetWidth;
            const slideHeight = slideElement.offsetHeight;

            // Calculate scale to fit in wrapper while maintaining aspect ratio
            const scaleX = wrapperWidth / slideWidth;
            const scaleY = wrapperHeight / slideHeight;
            const scale = Math.min(scaleX, scaleY); // Scale up/down to fit exactly

            slideElement.style.transform = 'scale(' + scale + ')';
        }

        function showSlide(index) {
            if (index < 0 || index >= totalSlides) return;

            // Hide all slides
            slides.forEach((slide) => slide.classList.remove('active'));

            // Show the current slide
            const currentSlide = slides[index];
            currentSlide.classList.add('active');
            currentSlideIndex = index;

            // Scale the slide to fit viewport
            scaleSlide(currentSlide);

            // Update slide name
            const slideId = currentSlide.getAttribute('data-slide-id');
            const slideName = slideNames.find(s => s.id === slideId)?.name || 'Unknown Slide';
            document.getElementById('slide-name').textContent = slideName;

            // Update button state
            document.getElementById('prev-slide').disabled = navigationHistory.length <= 1;

            // Update URL fragment
            if (slideId) {
                window.history.replaceState(null, '', '#' + slideId);
            }

            // Initialize quizzes on the current slide
            initializeQuizzes();
        }

        function navigateToSlideById(slideId) {
            const slideIndex = Array.from(slides).findIndex(
                (slide) => slide.getAttribute('data-slide-id') === slideId
            );
            if (slideIndex !== -1 && slideIndex !== currentSlideIndex) {
                // Add to history when navigating via links
                navigationHistory.push(slideIndex);
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

        // Handle back button
        document.getElementById('prev-slide').addEventListener('click', () => {
            if (navigationHistory.length > 1) {
                navigationHistory.pop(); // Remove current slide
                showSlide(navigationHistory[navigationHistory.length - 1]);
            }
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && navigationHistory.length > 1) {
                navigationHistory.pop();
                showSlide(navigationHistory[navigationHistory.length - 1]);
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

        // Handle window resize for responsive scaling
        window.addEventListener('resize', () => {
            const activeSlide = document.querySelector('.slide-container.active');
            if (activeSlide) {
                scaleSlide(activeSlide);
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
