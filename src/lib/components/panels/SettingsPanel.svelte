<script lang="ts">
    import { editorStore } from "$lib/state.svelte.js";
    import type { Presentation } from "$lib/types/presentation";

    let { presentation }: { presentation: Presentation } = $props();

    function deleteSlide() {
        if (!editorStore.currentSlide) return;
        if (presentation.slides.length === 1) {
            alert("Cannot delete the last slide in the presentation");
            return;
        }

        if (!confirm("Are you sure you want to delete this slide?")) {
            return;
        }

        const slideIndex = presentation.slides.findIndex(
            (s) => s.id === editorStore.currentSlide?.id,
        );
        if (slideIndex !== -1) {
            presentation.slides.splice(slideIndex, 1);
        }
    }

    function duplicateSlide() {
        if (!editorStore.currentSlide) return;

        const newSlideData = {
            ...editorStore.currentSlide,
            id: crypto.randomUUID(),
            elements: editorStore.currentSlide.elements.map((el) => ({
                ...el,
                id: crypto.randomUUID(),
            })),
        };

        const slideIndex = presentation.slides.findIndex(
            (s) => s.id === editorStore.currentSlide?.id,
        );
        if (slideIndex !== -1) {
            presentation.slides.splice(slideIndex + 1, 0, newSlideData);
        }
    }
</script>

{#if editorStore.currentSlide !== null}
    <div class="p-6 space-y-4">
        <!-- Slide name -->
        <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Slide Name</label
            >
            <input
                type="text"
                bind:value={editorStore.currentSlide.name}
                placeholder="Slide name"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p class="text-xs text-gray-500 mt-1">Slide ID (auto-generated)</p>
        </div>

        <!-- Background color -->
        <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Background Color</label
            >
            <div class="flex gap-2 items-center">
                <input
                    type="color"
                    bind:value={editorStore.currentSlide.background.value}
                    class="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                    type="text"
                    bind:value={editorStore.currentSlide.background.value}
                    placeholder="#000000"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-mono"
                />
            </div>
        </div>

        <!-- Background type note -->
        <div class="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p class="text-xs text-blue-700">
                <i class="fa fa-info-circle" aria-hidden="true"></i>
                Background is currently set to color mode
            </p>
        </div>

        <!-- Canvas resize toggle -->
        <div class="flex items-center space-x-3">
            <input
                type="checkbox"
                id="resizeToggle"
                bind:checked={editorStore.canResizeCanvas}
                class="w-4 h-4 rounded border border-gray-300 cursor-pointer"
            />
            <label for="resizeToggle" class="text-sm font-semibold text-gray-700 cursor-pointer"
                >Allow Canvas Resize</label
            >
        </div>

        <!-- Slide dimensions -->
        <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700"
                >Dimensions</label
            >
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <span class="text-xs text-gray-600">Width</span>
                    <input
                        type="number"
                        bind:value={editorStore.currentSlide.width}
                        min="200"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <div>
                    <span class="text-xs text-gray-600">Height</span>
                    <input
                        type="number"
                        bind:value={editorStore.currentSlide.height}
                        min="120"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
            </div>
        </div>

        <!-- Action buttons -->
        <div class="space-y-2 pt-2 border-t border-gray-200">
            <button
                onclick={duplicateSlide}
                class="w-full px-4 py-2 bg-linear-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
            >
                <i class="fa fa-copy" aria-hidden="true"></i> Duplicate Slide
            </button>
            <button
                onclick={deleteSlide}
                class="w-full px-4 py-2 bg-linear-to-r from-rose-500 to-red-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
            >
                <i class="fa fa-trash" aria-hidden="true"></i> Delete Slide
            </button>
        </div>
    </div>
{/if}
