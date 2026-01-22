<script lang="ts">
    import Image from "$lib/components/widgets/Image.svelte";
    import Shape from "$lib/components/widgets/Shape.svelte";
    import Table from "$lib/components/widgets/Table.svelte";
    import Quizz from "$lib/components/widgets/Quizz.svelte";
    import { editorStore } from "$lib/state.svelte.js";
    import { savePresentation } from "$lib/db/presentations.svelte.js";
    import Button from "$lib/components/widgets/Button.svelte";
    import Editor from "$lib/components/Editor.svelte";

    const { data } = $props();

    editorStore.currentSlide =
        editorStore.presentation.slides.find((s) => s.id === data.slide) ??
        null;

    savePresentation(editorStore.presentation);
</script>

<!-- Dropped Elements -->
{#if editorStore.currentSlide !== null}
    {#each editorStore.currentSlide.elements as element, i (element.id)}
        {#if editorStore.currentSlide.elements[i].type === "image"}
            <Image bind:data={editorStore.currentSlide.elements[i]} />
        {:else if editorStore.currentSlide.elements[i].type === "shape"}
            <Shape
                bind:data={editorStore.currentSlide.elements[i]}
                mode="canvas"
            />
        {:else if editorStore.currentSlide.elements[i].type === "table"}
            <Table bind:data={editorStore.currentSlide.elements[i]} />
        {:else if editorStore.currentSlide.elements[i].type === "quizz"}
            <Quizz
                mode="view"
                bind:data={editorStore.currentSlide.elements[i]}
            />
        {:else if editorStore.currentSlide.elements[i].type === "button"}
            <Button bind:data={editorStore.currentSlide.elements[i]} />
        {/if}
    {/each}
{/if}
