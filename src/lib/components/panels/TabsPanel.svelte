<script lang="ts">
    import { createPresentationElement } from "$lib/types/presentation";
    import { editorStore } from "$lib/state.svelte.js";

    let hoverRow = $state(0);
    let hoverCol = $state(0);
</script>

<div class="p-6 space-y-4">
    <div>
        <span
            class="block text-sm font-semibold text-gray-700 mb-3"
            >Select Table Size</span
        >
        <div
            class="mb-4 text-sm text-purple-600 font-semibold text-center p-3 bg-purple-50 rounded-lg"
        >
            {hoverCol > 0
                ? `${hoverCol} columns × ${hoverRow} rows`
                : "Hover to select size"}
        </div>

        <div
            class="grid grid-cols-8 gap-2 outline-none"
            onmouseleave={() => {
                hoverRow = 0;
                hoverCol = 0;
            }}
            role="grid"
            tabindex="-1"
        >
            {#each Array(8) as _, r}
                {#each Array(8) as _, c}
                    <button
                        type="button"
                        class="w-6 h-6 border rounded transition-all duration-75 block p-0
                    {r + 1 <= hoverRow && c + 1 <= hoverCol
                            ? 'bg-purple-600 border-purple-700 shadow-md'
                            : 'bg-white border-gray-300 hover:border-purple-500 hover:bg-purple-50'}"
                        onmouseenter={() => {
                            hoverRow = r + 1;
                            hoverCol = c + 1;
                        }}
                        onclick={() => {
                            editorStore.updateSlide((s) =>
                                s.elements.push(
                                    createPresentationElement(
                                        "table",
                                        {
                                            table: new Array(
                                                hoverRow,
                                            ).fill(
                                                new Array(
                                                    hoverCol,
                                                ),
                                            ),
                                            width:
                                                70 * hoverCol,
                                            height:
                                                40 * hoverRow,
                                        },
                                    ),
                                ),
                            );
                        }}
                        aria-label="{r + 1}×{c + 1}"
                    ></button>
                {/each}
            {/each}
        </div>
    </div>
</div>
