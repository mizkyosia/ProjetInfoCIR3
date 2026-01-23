<script lang="ts">
    import { createPresentationElement } from "$lib/types/presentation";
    import { editorStore } from "$lib/state.svelte.js";

    let textForm = $state({
        text: "",
    });

    function submitText() {
        if (!textForm.text.trim()) {
            alert("Please enter some text");
            return;
        }

        console.log("Text submitted:", {
            text: textForm.text,
        });

        editorStore.updateSlide((s) =>
            s.elements.push(
                createPresentationElement("text", {
                    text: textForm.text,
                }),
            ),
        );

        // Reset form
        textForm = {
            text: "",
        };
    }
</script>

<div class="p-6 space-y-4">
    <!-- Text input -->
    <div>
        <span
            class="block text-sm font-semibold text-gray-700 mb-2"
            >Text Content</span
        >
        <textarea
            bind:value={textForm.text}
            placeholder="Enter your text here..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows="8"
        ></textarea>
    </div>

    <!-- Submit button -->
    <button
        onclick={submitText}
        class="cursor-pointer w-full px-4 py-2 bg-linear-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
    >
        <i class="fa fa-plus" aria-hidden="true"></i> Add Text to
        Slide
    </button>
</div>
