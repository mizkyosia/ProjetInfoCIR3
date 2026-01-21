<script lang="ts">
    import { selectedElementStore } from "$lib/state.svelte";
</script>

{#if selectedElementStore.element !== null}
    <div
        class="
    absolute -translate-x-1/2
    flex items-center gap-3
    px-3 py-2
    bg-neutral-900/90 backdrop-blur
    rounded-lg shadow-lg
    text-xs text-white
    z-[1000]
  "
        style="left: {selectedElementStore.element.x +
            selectedElementStore.element.width /
                2}px; top: {selectedElementStore.element.y -
            selectedElementStore.element.height / 2 + 10}px;"
        onpointerdown={(e) => e.stopPropagation()}
    >
        <!-- Fill color -->
        <div class="flex items-center gap-1">
            <span class="opacity-70">Fill</span>
            <input
                type="color"
                bind:value={selectedElementStore.element.fillColor}
                class="h-6 w-6 cursor-pointer rounded border border-neutral-700 bg-transparent"
            />
        </div>

        <!-- Border color -->
        <div class="flex items-center gap-1">
            <span class="opacity-70">Border</span>
            <input
                type="color"
                bind:value={selectedElementStore.element.borderColor}
                class="h-6 w-6 cursor-pointer rounded border border-neutral-700 bg-transparent"
            />
        </div>

        <!-- Border thickness -->
        <div class="flex items-center gap-1">
            <span class="opacity-70">Thickness</span>
            <input
                type="number"
                min="0"
                bind:value={selectedElementStore.element.borderThickness}
                class="
        w-14 rounded bg-neutral-800 px-1 py-0.5
        text-white outline-none
        border border-neutral-700
      "
            />
        </div>

        <!-- Border radius -->
        <div class="flex items-center gap-1">
            <span class="opacity-70">Radius</span>
            <input
                type="number"
                min="0"
                bind:value={selectedElementStore.element.borderRadius}
                class="
        w-14 rounded bg-neutral-800 px-1 py-0.5
        text-white outline-none
        border border-neutral-700
      "
            />
        </div>

        <!-- Border style -->
        <div class="flex items-center gap-1">
            <span class="opacity-70">Style</span>
            <select
                bind:value={selectedElementStore.element.borderStyle}
                class="
        rounded bg-neutral-800 px-1 py-0.5
        text-white outline-none
        border border-neutral-700
      "
            >
                <option value="solid">Solid</option>
                <option value="dotted">Dotted</option>
                <option value="dashed">Dashed</option>
            </select>
        </div>

        <!-- Opacity -->
        <div class="flex items-center gap-1">
            <span class="opacity-70">Opacity</span>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                bind:value={selectedElementStore.element.opacity}
                class="w-24 cursor-pointer"
            />
        </div>
    </div>
{/if}
