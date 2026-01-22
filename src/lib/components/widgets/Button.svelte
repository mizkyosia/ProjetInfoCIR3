<script lang="ts">
    import { getImageURL } from "$lib/db/images";
    import { presentation } from "$lib/maheb/presentationStore";
    import { editorStore, imageUrlMap } from "$lib/state.svelte";
    import type {
        BaseElement,
        ButtonElement,
        ElementProps,
        ImageElement,
    } from "$lib/types/presentation";
    import Select from "../Select.svelte";
    import Base from "./Base.svelte";

    let { data = $bindable() }: ElementProps<ButtonElement> = $props();
    data.slideId = editorStore.currentSlide?.id ?? "";
</script>

<Base bind:data>
    {#snippet editor()}
        <Select
            value={editorStore.currentSlide?.id}
            options={editorStore.presentation.slides.map((s, i) => {
                return {
                    value: s.id,
                    render: slideNumber,
                    args: i,
                };
            })}
        />
    {/snippet}

    {#if editorStore.viewing}
        <a
            href="./{data.slideId}"
            class="w-full h-full block cursor-pointer"
            style="
            border-color: {data.borderColor};
            border-width: {data.borderThickness}px;
            border-style: {data.borderStyle};
            border-radius: {data.borderRadius}px;
            background-color: {data.fillColor};"
            aria-label="Link to other slide"
        >
        </a>
    {:else}
        <div
            class="w-full h-full block cursor-pointer"
            style="
            border-color: {data.borderColor};
            border-width: {data.borderThickness}px;
            border-style: {data.borderStyle};
            border-radius: {data.borderRadius}px;
            background-color: {data.fillColor};"
            aria-label="Link to other slide"
        ></div>
    {/if}
</Base>

{#snippet slideNumber(index: number)}
    <span class="md">Slide {index}</span>
{/snippet}
