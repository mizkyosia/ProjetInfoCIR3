<script lang="ts">
    import { editorStore, selectedElementStore } from "$lib/state.svelte";
    import Icon from "@iconify/svelte";
    import Select from "./Select.svelte";
    import type { QuizzElement } from "$lib/types/presentation";
    import { selectedElement } from "./widgets/Base.svelte";

    let borderStyleSelect = $state();
</script>

{#if selectedElementStore.element !== null}
    <div
        class="
    absolute -translate-x-1/2
    top-2 left-1/2
    flex items-center gap-3
    px-3 py-2
    bg-neutral-900/90 backdrop-blur
    rounded-lg shadow-lg
    text-xs text-white
    flex-row
    z-[1000]
  "
        onpointerdown={(e) => e.stopPropagation()}
    >
        <!-- Fill color -->
        <div class="flex items-center gap-1">
            <input
                type="color"
                bind:value={selectedElementStore.element.fillColor}
                class="h-6 w-6 cursor-pointer rounded border border-neutral-700 bg-transparent text-xs"
            />
        </div>
        <hr
            class="h-6 w-0.5 rounded-2xl bg-neutral-500 opacity-70 border-none"
        />

        <!-- Border color -->
        <div class="flex items-center gap-1">
            <input
                type="color"
                bind:value={selectedElementStore.element.borderColor}
                class="h-6 w-6 cursor-pointer rounded border border-neutral-700 bg-transparent text-xs"
            />
        </div>

        <!-- Border thickness -->
        <div class="flex items-center gap-1">
            <Icon icon="bi:border-width" width="16" height="16" />
            <input
                type="number"
                min="0"
                bind:value={selectedElementStore.element.borderThickness}
                class="
        w-14 rounded bg-neutral-800 p-1
        text-white outline-none
        border border-neutral-700 text-xs
      "
            />
        </div>

        <!-- Border radius -->
        <div class="flex items-center gap-1">
            <Icon icon="tabler:border-radius" width="24" height="24" />
            <input
                type="number"
                min="0"
                bind:value={selectedElementStore.element.borderRadius}
                class="
        w-14 rounded bg-neutral-800 p-1
        text-white outline-none
        border border-neutral-700 text-xs
      "
            />
        </div>

        <!-- Border style -->
        <Select
            options={[
                { value: "solid", render: borderSolid },
                { value: "dashed", render: borderDashed },
                { value: "dotted", render: borderDotted },
            ]}
            bind:value={selectedElementStore.element.borderStyle}
        />

        <!-- Opacity -->
        <div class="flex items-center gap-1">
            <Icon icon="cil:opacity" class="text-lg" />
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                bind:value={selectedElementStore.element.opacity}
                class="w-24 cursor-pointer"
            />
        </div>

        <hr
            class="h-6 w-0.5 rounded-2xl bg-neutral-500 opacity-70 border-none"
        />

        <!-- Z-index controls -->
        <div class="flex items-center gap-1">
            <Icon icon="mdi:arrange-send-to-back" width="16" height="16" />
            <button
                onclick={() => {
                    if (
                        selectedElementStore.element === null ||
                        editorStore.currentSlide === null
                    )
                        return;
                    const currentIndex =
                        editorStore.currentSlide.elements.indexOf(
                            selectedElementStore.element,
                        );
                    if (
                        currentIndex <
                        editorStore.currentSlide.elements.length - 1
                    ) {
                        // Move forward (increase z-index)
                        const temp =
                            editorStore.currentSlide.elements[currentIndex];
                        editorStore.currentSlide.elements[currentIndex] =
                            editorStore.currentSlide.elements[currentIndex + 1];
                        editorStore.currentSlide.elements[currentIndex + 1] =
                            temp;
                    }
                }}
                title="Move backward"
                class="p-1 hover:bg-neutral-700 rounded transition-colors"
            >
                <Icon icon="mdi:arrow-up" width="14" height="14" />
            </button>
            <button
                onclick={() => {
                    if (
                        selectedElementStore.element === null ||
                        editorStore.currentSlide === null
                    )
                        return;
                    const currentIndex =
                        editorStore.currentSlide.elements.indexOf(
                            selectedElementStore.element,
                        );
                    if (currentIndex > 0) {
                        // Move backward (decrease z-index)
                        const temp =
                            editorStore.currentSlide.elements[currentIndex];
                        editorStore.currentSlide.elements[currentIndex] =
                            editorStore.currentSlide.elements[currentIndex - 1];
                        editorStore.currentSlide.elements[currentIndex - 1] =
                            temp;
                        editorStore.currentSlide.elements = [
                            ...editorStore.currentSlide.elements,
                        ];
                    }
                }}
                title="Move forward"
                class="p-1 hover:bg-neutral-700 rounded transition-colors"
            >
                <Icon icon="mdi:arrow-down" width="14" height="14" />
            </button>
        </div>

        <hr
            class="h-6 w-0.5 rounded-2xl bg-neutral-500 opacity-70 border-none"
        />

        {@render selectedElementStore?.snippet?.()}

        <Icon
            icon="mdi:trash-can-outline"
            class="text-xl cursor-pointer hover:text-red-500 transition-colors"
            onclick={() => {
                if (editorStore.currentSlide === null) return;
                console.log(
                    "Deleting element",
                    selectedElementStore.element?.id,
                );
                editorStore.currentSlide.elements =
                    editorStore.currentSlide.elements.filter(
                        (s) => s.id !== selectedElementStore.element?.id,
                    );
                selectedElementStore.element = null;
                selectedElementStore.snippet = null;
                selectedElement?.();
            }}
        />
    </div>
{/if}

{#snippet borderSolid()}
    <Icon icon="radix-icons:border-solid" width="15" height="15" />
{/snippet}

{#snippet borderDashed()}
    <Icon icon="radix-icons:border-dashed" width="15" height="15" />
{/snippet}

{#snippet borderDotted()}
    <Icon icon="radix-icons:border-dotted" width="15" height="15" />
{/snippet}
