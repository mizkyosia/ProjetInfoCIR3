<script lang="ts">
    import {
        SvelteFlow,
        Background,
        Controls,
        MarkerType,
        type Connection,
        type Edge,
    } from "@xyflow/svelte";
    import "@xyflow/svelte/dist/style.css";
    import CustomNode from "$lib/Node/CustomNode.svelte";
    import CustomEdgeMarker from "$lib/Node/CustomEdgeMarker.svelte";
    import {
        type Presentation,
        createPresentationElement,
    } from "$lib/types/presentation";
    import { getSlideThumbnailURL } from "$lib/db/thumbnails.js";

    const nodeTypes = {
        custom: CustomNode,
    };
    const edgeTypes = {
        customEdge: CustomEdgeMarker,
    };

    let { data } = $props();
    let presentation = $derived(data.presentation);

    let nodes: Promise<any[]> = $derived(
        Promise.all(
            presentation.slides.map(async (slide, index) => ({
                id: slide.id,
                type: "custom",
                position: { x: index * 300, y: 0 },
                data: {
                    title: slide.name,
                    elementCount: slide.elements.length,
                    thumbnail: await getSlideThumbnailURL(slide.id),
                    slideId: slide.id,
                },
            })),
        ),
    );

    let edges: Edge[] = $derived(
        presentation.slides
            .map((s) =>
                s.elements
                    .filter((e) => e.type === "button")
                    .map((e) => ({
                        id: `${s.id}-${e.slideId}`,
                        source: s.id,
                        target: e.slideId,
                        type: "customEdge",
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                        },
                    })),
            )
            .flat(),
    );

    $inspect(edges, "edges");
</script>

<div class="w-screen h-screen">
    {#await nodes then completeNodes}
        <SvelteFlow
            nodes={completeNodes}
            {edges}
            {nodeTypes}
            fitView
            defaultEdgeOptions={{
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                },
            }}
            onconnect={(event: Connection) => {
                // Handle new connections if needed
                const sourceSlide = presentation.slides.find(
                    (s) => s.id === event.source,
                );
                const targetSlide = presentation.slides.find(
                    (s) => s.id === event.target,
                );

                if (sourceSlide && targetSlide) {
                    const buttonElement = createPresentationElement("button", {
                        slideId: targetSlide.id,
                    });
                    sourceSlide.elements.push(buttonElement);
                    presentation = presentation;
                }
            }}
        >
            <CustomEdgeMarker />
            <Background />
            <Controls />
        </SvelteFlow>
    {/await}
</div>

<style>
</style>
