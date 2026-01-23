<script lang="ts">
    import { createPresentationElement } from "$lib/types/presentation";
    import { editorStore } from "$lib/state.svelte.js";

    let { presentation } = $props();
</script>

<div class="p-6 space-y-4">
    <div>
        <span
            class="block text-sm font-semibold text-gray-700 mb-3"
            >Link to Slide</span
        >
        <p class="text-xs text-gray-500 mb-4">
            Click on a slide to create a button linking to it
        </p>
        <div class="space-y-2">
            {#each presentation.slides as slide, index}
                <button
                    onclick={() => {
                        editorStore.updateSlide((s) =>
                            s.elements.push(
                                createPresentationElement(
                                    "button",
                                    {
                                        slideId: slide.id,
                                        fillColor: "#aaaaff",
                                        borderColor: "#8888ff",
                                        borderThickness: 2,
                                    },
                                ),
                            ),
                        );
                    }}
                    class="cursor-pointer w-full px-4 py-3 text-left border border-gray-300 rounded-lg hover:bg-purple-50 hover:border-purple-500 transition-all duration-150 text-sm font-medium text-gray-700"
                >
                    <span class="font-semibold"
                        >{slide.name}</span
                    >
                    {#if slide.id === editorStore.currentSlide?.id}
                        <span class="text-purple-600 ml-2"
                            >(Current)</span
                        >
                    {/if}
                </button>
            {/each}
        </div>
    </div>
</div>
