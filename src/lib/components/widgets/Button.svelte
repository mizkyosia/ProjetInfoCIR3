<script lang="ts">
    import { editorStore } from "$lib/state.svelte";
    import type { ButtonElement, ElementProps } from "$lib/types/presentation";
    import type { Snippet } from "svelte";
    import Select from "../Select.svelte";
    import Base from "./Base.svelte";
    import Icon from "@iconify/svelte";

    let { data = $bindable() }: ElementProps<ButtonElement> = $props();
</script>

<Base bind:data>
    {#snippet editor()}
        <a class="flex items-center gap-2" href="#{data.slideId}">
            <Icon icon="mdi:link" class="w-6 h-6" />
            <Select
                bind:value={data.slideId}
                options={editorStore.presentation.slides.map((s, i) => {
                    return {
                        value: s.id,
                        render: slideNumber as Snippet,
                        args: s.name,
                    };
                })}
            />
        </a>
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
        <a
            href="#{data.slideId}"
            class="w-full h-full block cursor-pointer"
            style="
            border-color: {data.borderColor};
            border-width: {data.borderThickness}px;
            border-style: {data.borderStyle};
            border-radius: {data.borderRadius}px;
            background-color: {data.fillColor};"
            aria-label="Link to other slide"
        ></a>
    {/if}
</Base>

{#snippet slideNumber(name: string)}
    <span class="md">{name}</span>
{/snippet}
