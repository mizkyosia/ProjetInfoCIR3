<script lang="ts">
    import { editorStore } from "$lib/state.svelte";
    import type { ButtonElement, ElementProps } from "$lib/types/presentation";
    import type { Snippet } from "svelte";
    import Select from "../Select.svelte";
    import Base from "./Base.svelte";

    let { data = $bindable() }: ElementProps<ButtonElement> = $props();
</script>

<Base bind:data>
    {#snippet editor()}
        <Select
            bind:value={data.slideId}
            options={editorStore.presentation.slides.map((s, i) => {
                return {
                    value: s.id,
                    render: slideNumber as Snippet,
                    args: i + 1,
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
