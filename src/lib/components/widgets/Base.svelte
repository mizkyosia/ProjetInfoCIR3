<script module lang="ts">
    export let selectedElement: (() => string) | undefined;
</script>

<script lang="ts">
    import type { BaseElement } from "$lib/types/presentation";

    let {
        data = $bindable(),
        children,
    }: { data: BaseElement; children?: Snippet } = $props();

    import { type Snippet } from "svelte";

    let el: HTMLDivElement,
        startX = 0,
        startY = 0;
    let mode: "move" | "resize" | "rotate" | null = null;

    let selected = $state(false),
        centerX = $state(0),
        centerY = $state(0);

    function startMove(e: PointerEvent) {
        e.stopPropagation();
        mode = "move";
        startX = e.clientX;
        startY = e.clientY;

        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
    }

    function startResize(e: PointerEvent) {
        e.stopPropagation();
        mode = "resize";
        startX = e.clientX;
        startY = e.clientY;

        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
    }

    function startRotate(e: PointerEvent) {
        e.stopPropagation();
        mode = "rotate";

        let rect = el.getBoundingClientRect();

        centerX = rect.x + rect.width / 2;
        centerY = rect.y + rect.height / 2;

        console.log(centerX, centerY);

        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
    }

    function onPointerMove(e: PointerEvent) {
        if (!mode) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (mode === "move") {
            data.x += dx;
            data.y += dy;
            startX = e.clientX;
            startY = e.clientY;
        }

        if (mode === "resize") {
            data.width = Math.max(20, data.width + dx);
            data.height = Math.max(20, data.height + dy);
            startX = e.clientX;
            startY = e.clientY;
        }

        if (mode === "rotate") {
            data.rotation =
                Math.atan2(e.clientY - centerY, e.clientX - centerX) +
                Math.PI / 2;
        }
    }

    function onPointerUp() {
        mode = null;
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
    }
</script>

<div
    bind:this={el}
    class="element absolute touch-none select-none box-border origin-center"
    style="
    transform:
      translate({data.x}px, {data.y}px)
      rotate({data.rotation}rad);
    width: {data.width}px;
    height: {data.height}px;
  "
    onpointerdown={(e) => {
        e.stopPropagation();
        if (selectedElement != undefined) selectedElement();

        selectedElement = () => {
            selected = false;
            selectedElement = undefined;
            return data.id;
        };
        selected = true;
    }}
>
    <!-- actual content (NOT draggable) -->
    <div class="w-full h-full pointer-events-auto z-10 relative box-border">
        {@render children?.()}
    </div>

    {#if selected}
        <!-- border drag area -->
        <div
            class="border absolute -inset-2 z-0"
            onpointerdown={startMove}
        ></div>

        <!-- resize handle -->
        <div
            class="absolute h-3 w-3 border-2 border-blue-500 rounded-full bg-white -bottom-4 -right-4 cursor-nwse-resize"
            onpointerdown={startResize}
        ></div>

        <!-- rotate handle -->
        <div
            class="absolute h-3 w-3 border-2 border-blue-500 rounded-full bg-white -top-7 left-[50%] -translate-x-[50%] cursor-grab"
            onpointerdown={startRotate}
        ></div>
    {/if}
</div>

<style>
    /* invisible border used for dragging */
    .border {
        position: absolute;
        inset: -6px;
        border: 2px solid #4f46e5;
        pointer-events: auto;
        cursor: grab;
        background: transparent;
    }
</style>
