<script lang="ts">
    import { getImageURL } from "$lib/db/images";
    import { imageUrlMap } from "$lib/state";
    import type { ImageElement } from "$lib/types/presentation";
    import Base from "./Base.svelte";

    let { assetId, ...base }: ImageElement = $props();
    let src: string | null = $state(imageUrlMap.get(assetId) ?? null);

    if (src === null) getImageURL(assetId).then((s) => (src = s));
</script>

<Base {...base}>
    <img class="object-fill w-full h-full" {src} alt="Imported" />
</Base>
