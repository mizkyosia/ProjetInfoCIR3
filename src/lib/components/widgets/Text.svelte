<script lang="ts">
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
    import type { ElementProps, TextElement } from "../../types/presentation";
    import Base from "./Base.svelte";
    import Select from "../Select.svelte";
    import Icon from "@iconify/svelte";
    import { editorStore } from "$lib/state.svelte";

    let { data = $bindable() }: ElementProps<TextElement> = $props();

    function exec(cmd: string, arg?: string) {
        document.execCommand(cmd, false, arg);
        updateFormat();
    }

    let format = $state({
        bold: false,
        italic: false,
        underline: false,
        color: "#000000",
        font: "Arial",
        size: 11,
    });
    let editorDiv: HTMLDivElement;

    function updateFormat() {
        format.bold = document.queryCommandState("bold");
        format.italic = document.queryCommandState("italic");
        format.underline = document.queryCommandState("underline");
        format.font = document.queryCommandValue("fontName");
        format.color = document.queryCommandValue("foreColor");
        format.size = parseInt(document.queryCommandValue("fontSize"));
        if (isNaN(format.size)) format.size = 11;
    }

    function onSelectionChange() {
        if (!editorDiv.contains(document.activeElement)) return;
        updateFormat();
    }

    onMount(() => {
        document.addEventListener("selectionchange", onSelectionChange);
    });

    onDestroy(() => {
        document.removeEventListener("selectionchange", onSelectionChange);
    });
</script>

<Base bind:data>
    {#snippet editor()}
        <Select
            options={[
                { value: "Arial", render: fontTitle, args: "Arial" },
                { value: "Helvetica", render: fontTitle, args: "Helvetica" },
            ]}
            bind:value={
                () => format.font,
                (v) => {
                    exec("fontName", v);
                }
            }
            placeholder={"Font"}
        />
        <div class="flex items-center gap-1">
            <Icon icon="radix-icons:font-size" />
            <input
                type="number"
                min="1"
                step="1"
                bind:value={
                    () => format.size, (v) => exec("fontSize", v.toString())
                }
                class="
        w-14 rounded bg-neutral-800 p-1
        text-white outline-none
        border border-neutral-700 text-xs"
            />
        </div>
        <button
            onclick={() => exec("bold")}
            class="text-lg px-1 hover:bg-neutral-600 {format.bold
                ? 'bg-neutral-600'
                : ''} transition-colors rounded-lg cursor-pointer aspect-square h-8 -m-2 font-bold"
            >B</button
        >
        <button
            onclick={() => exec("italic")}
            class="text-lg px-1 hover:bg-neutral-600 {format.italic
                ? 'bg-neutral-600'
                : ''} transition-colors rounded-lg cursor-pointer aspect-square h-8 -m-2 italic"
            >I</button
        >
        <button
            onclick={() => exec("underline")}
            class="text-lg px-1 hover:bg-neutral-600 {format.underline
                ? 'bg-neutral-600'
                : ''} transition-colors rounded-lg cursor-pointer aspect-square h-8 -m-2 underline"
            >U</button
        >
        <div class="flex items-center gap-1">
            <input
                type="color"
                bind:value={
                    () => format.color,
                    (v) => {
                        exec("foreColor", v);
                    }
                }
                class="h-6 w-6 cursor-pointer rounded border border-neutral-700 bg-transparent text-xs"
            />
        </div>
    {/snippet}

    {#if editorStore.exporting}
        <div
            class="whitespace-pre-wrap wrap-break-word w-full h-full outline-none"
        >
            {@html data.text}
        </div>
    {:else}
        <div
            class="whitespace-pre-wrap wrap-break-word w-full h-full outline-none"
            aria-label="Editable text zone"
            onselectionchange={onSelectionChange}
            role="textbox"
            contenteditable
            bind:innerHTML={data.text}
            bind:this={editorDiv}
            tabindex="0"
        ></div>
    {/if}
</Base>

{#snippet fontTitle(font: string)}
    <span style="font-family: {font};">{font}</span>
{/snippet}
