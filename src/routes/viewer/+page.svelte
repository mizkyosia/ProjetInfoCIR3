<script lang="ts">
  import { onMount } from "svelte";
  import EditorViewer from "$lib/EditorViewer.svelte";

  let data: any = null;

  onMount(() => {
    const id = location.hash.replace("#", "");
    if (!id) return;

    const raw = localStorage.getItem("pres:" + id);
    if (!raw) return;

    data = JSON.parse(raw);
  });
</script>

{#if data}
  <EditorViewer {data} />
{:else}
  <div style="padding:20px">Aucune présentation trouvée.</div>
{/if}
