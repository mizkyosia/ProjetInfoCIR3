<script lang="ts">
  import Quizz from "$lib/Quizz.svelte";
  import Forms from "$lib/Forms.svelte";

  export let data: {
    canvasElements: any[];
    zoom?: number;
    pan?: { x: number; y: number };
  };

  const zoom = data.zoom ?? 1;
  const pan = data.pan ?? { x: 0, y: 0 };
</script>



<div class="flex items-center justify-center min-h-screen bg-gray-200 p-10">
  <div
    id="presentation"
    class="bg-white w-200 h-112.5 shadow-xl relative overflow-hidden origin-center"
    style="transform: translate({pan.x}px, {pan.y}px) scale({zoom})"
  >
    {#each data.canvasElements as element (element.id)}
      {#if element.type === "quizz"}
        <div
          class="w-96"
          style="position:absolute; left:{element.x}px; top:{element.y}px;"
        >
          <Quizz mode="play" data={element.data} />
        </div>

      {:else if element.type === "shape"}
        <div
          style="position:absolute; left:{element.x}px; top:{element.y}px; width:{element.data.width}px; height:{element.data.height}px;"
        >
          <Forms mode="canvas" bind:data={element.data} />
        </div>
      {/if}
    {/each}
  </div>
</div>
