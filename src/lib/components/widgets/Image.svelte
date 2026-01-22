<script lang="ts">
    import { getImageURL } from "$lib/db/images";
    import { imageUrlMap } from "$lib/state.svelte";
    import type {
        BaseElement,
        ElementProps,
        ImageElement,
    } from "$lib/types/presentation";
    import Base from "./Base.svelte";

    let { data = $bindable() }: ElementProps<ImageElement> = $props();

    let src: string | null = $state(imageUrlMap.get(data.assetId) ?? null);

    if (src === null) getImageURL(data.assetId).then((s) => (src = s));
</script>

<Base bind:data>
    <img
        class="object-fill w-full h-full"
        {src}
        alt="Imported"
        style="
            border-color: {data.borderColor};
            border-width: {data.borderThickness}px;
            border-style: {data.borderStyle};
            border-radius: {data.borderRadius}px;
            background-color: {data.fillColor};"
    />
</Base>
