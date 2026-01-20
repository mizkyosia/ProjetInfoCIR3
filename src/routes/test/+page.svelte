<script lang="ts">
  import ZoneDT from '$lib/zonedt.svelte';

  let zones: { id: string, x: number, y: number, width: number, height: number, content: string }[] = []; 
  let isTextMode = false; 
  let isDrawing = false; 
  let startX = 0;
  let startY = 0;
  let currentZone: any = null;

  function handleMouseDown(e: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    if (!isTextMode) return;
    if ((e.target as HTMLElement).closest('.wrapper')) return;

    isDrawing = true;
    const rect = e.currentTarget.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    currentZone = { x: startX, y: startY, width: 0, height: 0 };
  }

  function handleMouseMove(e: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    if (!isDrawing || !currentZone) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    currentZone.width = Math.abs(currentX - startX);
    currentZone.height = Math.abs(currentY - startY);
    currentZone.x = Math.min(currentX, startX);
    currentZone.y = Math.min(currentY, startY);
    currentZone = currentZone;
  }

  function handleMouseUp() {
    if (isDrawing && currentZone) {
      if (currentZone.width > 20 && currentZone.height > 20) {
        zones = [...zones, { 
            id: crypto.randomUUID(), 
            ...currentZone,
            content: "" 
        }];
      }
      isDrawing = false;
      currentZone = null;
      isTextMode = false;
    }
  }

  // FONCTION DE SUPPRESSION
  function supprimerZone(id: string) {
    zones = zones.filter(z => z.id !== id);
  }
</script>

<div class="container">
  <div class="toolbar">
    <button class="btn" class:active={isTextMode} on:click={() => isTextMode = !isTextMode}>
      {isTextMode ? "Annuler le tracé" : "➕ Créer une zone de texte"}
    </button>
  </div>

  <div class="canvas" class:crosshair={isTextMode} on:mousedown={handleMouseDown} on:mousemove={handleMouseMove} on:mouseup={handleMouseUp}>
    {#each zones as zone (zone.id)}
      <ZoneDT 
        bind:x={zone.x} 
        bind:y={zone.y} 
        bind:width={zone.width} 
        bind:height={zone.height} 
        bind:content={zone.content} 
        on:delete={() => supprimerZone(zone.id)} 
      />
    {/each}

    {#if isDrawing && currentZone}
      <div class="preview" style="left: {currentZone.x}px; top: {currentZone.y}px; width: {currentZone.width}px; height: {currentZone.height}px;"></div>
    {/if}
  </div>
</div>

<style>
  /* Le CSS reste identique à ton précédent message */
  .container { height: 100vh; display: flex; flex-direction: column; background: #eee; }
  .toolbar { padding: 20px; background: #222; display: flex; justify-content: center; z-index: 10; }
  .btn { padding: 12px 24px; font-weight: bold; cursor: pointer; border: none; border-radius: 8px; background: #7c3aed; color: white; transition: 0.3s; }
  .btn.active { background: #ef4444; }
  .canvas { flex: 1; position: relative; background: white; margin: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; user-select: none; }
  .crosshair { cursor: crosshair; }
  .preview { position: absolute; border: 2px dashed #7c3aed; background: rgba(124, 58, 237, 0.05); pointer-events: none; z-index: 50; }
</style>