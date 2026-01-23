<script lang="ts">
    import { createPresentationElement } from "$lib/types/presentation";
    import { editorStore } from "$lib/state.svelte.js";

    let quizzForm = $state({
        question: "",
        answers: ["", ""],
        correctAnswerIndex: 0,
    });

    function addAnswer() {
        quizzForm.answers.push("");
    }

    function removeAnswer(index: number) {
        if (quizzForm.answers.length > 2) {
            quizzForm.answers.splice(index, 1);
            if (quizzForm.correctAnswerIndex >= quizzForm.answers.length) {
                quizzForm.correctAnswerIndex = quizzForm.answers.length - 1;
            }
        }
    }

    function submitQuizz() {
        const filledAnswers = quizzForm.answers.filter((a) => a.trim());
        if (!quizzForm.question.trim() || filledAnswers.length < 2) {
            alert("Please enter a question and at least 2 answers");
            return;
        }

        console.log("Quiz submitted:", {
            question: quizzForm.question,
            options: filledAnswers,
            correctAnswerIndex: quizzForm.correctAnswerIndex,
        });

        editorStore.updateSlide((s) =>
            s.elements.push(
                createPresentationElement("quizz", {
                    question: quizzForm.question,
                    options: filledAnswers,
                    correctAnswerIndex: quizzForm.correctAnswerIndex,
                }),
            ),
        );

        // Reset form
        quizzForm = {
            question: "",
            answers: ["", ""],
            correctAnswerIndex: 0,
        };
    }
</script>

<div class="p-6 space-y-4">
    <!-- Question input -->
    <div>
        <span
            class="block text-sm font-semibold text-gray-700 mb-2"
            >Question</span
        >
        <textarea
            bind:value={quizzForm.question}
            placeholder="Enter your question"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows="3"
        ></textarea>
    </div>

    <!-- Answers section -->
    <div>
        <span
            class="block text-sm font-semibold text-gray-700 mb-3"
            >Answers</span
        >
        <div class="space-y-2">
            {#each quizzForm.answers as answer, index}
                <div class="flex gap-2 items-center">
                    <div class="flex-1">
                        <input
                            type="text"
                            bind:value={
                                quizzForm.answers[index]
                            }
                            placeholder={`Answer ${index + 1}`}
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <!-- Correct answer radio -->
                    <label
                        class="flex items-center gap-2 cursor-pointer"
                    >
                        <input
                            type="radio"
                            name="correctAnswer"
                            value={index}
                            bind:group={
                                quizzForm.correctAnswerIndex
                            }
                            class="w-4 h-4 accent-purple-600"
                        />
                        <span class="text-xs text-gray-600"
                            >Correct</span
                        >
                    </label>

                    <!-- Remove button -->
                    {#if quizzForm.answers.length > 2}
                        <button
                            onclick={() => removeAnswer(index)}
                            class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove answer"
                        >
                            <i
                                class="fa fa-trash"
                                aria-hidden="true"
                            ></i>
                        </button>
                    {/if}
                </div>
            {/each}
        </div>

        <!-- Add answer button -->
        <button
            onclick={addAnswer}
            class="mt-3 w-full px-3 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-purple-500 hover:text-purple-600 transition-colors text-sm font-medium"
        >
            <i class="fa fa-plus" aria-hidden="true"></i> Add Answer
        </button>
    </div>

    <!-- Submit button -->
    <button
        onclick={submitQuizz}
        class="w-full px-4 py-2 bg-linear-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
    >
        <i class="fa fa-check" aria-hidden="true"></i> Add Quiz to
        Slide
    </button>
</div>
