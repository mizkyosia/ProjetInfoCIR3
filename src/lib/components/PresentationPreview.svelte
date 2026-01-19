<script lang="ts">
    import { getImageURL } from "$lib/db";
    import type { Presentation } from "$lib/types/presentation";

    const { presentation }: { presentation: Presentation } = $props();

    let src = $state("");
    getImageURL(presentation.id + "-snapshot").then(s => src = s ?? "default.png");
</script>

<div class="hover:border-2 border-b-cyan-400 border-0 border-r-4 w-sm">
    <img {src} alt="Snapshot de présentation">
    <h3>{presentation.title}</h3>
    <h4>{new Date(presentation.updatedAt).toDateString()}</h4>
</div>
