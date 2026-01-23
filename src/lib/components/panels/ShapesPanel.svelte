<script lang="ts">
    import Shape from "$lib/components/widgets/Shape.svelte";
    import { createPresentationElement } from "$lib/types/presentation";
    import { editorStore } from "$lib/state.svelte.js";
</script>

<Shape
    mode="sidebar"
    onSelect={(t) => {
        editorStore.updateSlide((s) =>
            s.elements.push(
                createPresentationElement("shape", {
                    shapeType: t,
                    fillColor: "#aaaaff",
                    borderColor: "#8888ff",
                    borderThickness: 2,
                }),
            ),
        );
    }}
    data={createPresentationElement("shape")}
/>
