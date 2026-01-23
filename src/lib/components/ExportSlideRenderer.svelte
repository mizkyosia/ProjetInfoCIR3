<script lang="ts">
    import Image from "./widgets/Image.svelte";
    import Shape from "./widgets/Shape.svelte";
    import Table from "./widgets/Table.svelte";
    import Quizz from "./widgets/Quizz.svelte";
    import Button from "./widgets/Button.svelte";
    import Text from "./widgets/Text.svelte";
    import NewChart from "./widgets/NewChart.svelte";

    let { presentation, visible = false } = $props();
</script>

<!-- Hidden container for rendering all slides -->
<div
    id="export-slides-container"
    style="display: {visible
        ? 'block'
        : 'none'}; position: absolute; left: -9999px; top: -9999px;"
>
    {#each presentation.slides as slide (slide.id)}
        <div
            data-slide-id={slide.id}
            style="width: {slide.width}px; height: {slide.height}px; background-color: {slide
                .background.type === 'color'
                ? slide.background.value
                : 'white'}; page-break-after: always; position: relative; overflow: hidden;"
        >
            {#if slide.background.type === "image"}
                <img
                    src={slide.background.value}
                    alt="Slide background"
                    style="position: absolute; width: 100%; height: 100%; object-fit: cover; z-index: 0;"
                />
            {/if}

            {#each slide.elements as element, idx (element.id)}
                {#if element.type === "image"}
                    <Image data={element} />
                {:else if element.type === "shape"}
                    <Shape data={element} mode="canvas" />
                {:else if element.type === "table"}
                    <Table data={element} />
                {:else if element.type === "quizz"}
                    <Quizz mode="view" data={element} />
                {:else if element.type === "button"}
                    <Button data={element} />
                {:else if element.type === "text"}
                    <Text data={element} />
                {:else if element.type === "chart"}
                    <NewChart data={element} />
                {/if}
            {/each}
        </div>
    {/each}
</div>

<style>
    :global(#export-slides-container) {
        all: initial;
    }
</style>
