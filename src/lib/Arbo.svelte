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
    import CustomNode from "./Node/CustomNode.svelte";
    import CustomEdgeMarker from "./Node/CustomEdgeMarker.svelte";
    import {
        type Presentation,
        type ButtonElement,
        createPresentationElement,
    } from "./types/presentation";

    const nodeTypes = {
        custom: CustomNode,
    };
    const edgeTypes = {
        customEdge: CustomEdgeMarker,
    };

    let { presentation = $bindable() }: { presentation: Presentation } =
        $props();

    let nodes: any[] = $derived(
        presentation.slides.map((slide, index) => ({
            id: slide.id,
            type: "custom",
            position: { x: index * 250, y: 0 },
            data: {
                label: `Slide ${index + 1}`,
                description: `${slide.elements.length} elements`,
            },
        })),
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
                        markerStart: {
                            type: MarkerType.ArrowClosed,
                        },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                        },
                    })),
            )
            .flat(),
    );

    $inspect(edges, "edges");
</script>

<div class=" w-screen h-screen">
    <SvelteFlow
        bind:nodes
        {edges}
        {nodeTypes}
        fitView
        defaultEdgeOptions={{
            markerStart: {
                type: MarkerType.ArrowClosed,
            },
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
</div>

<style>
</style>
