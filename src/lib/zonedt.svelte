<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let x: number;
  export let y: number;
  export let width: number;
  export let height: number;
  export let content: string;
  export let rotation: number = 0;

  let isEditing = false;
  let showBorder = true;
  let isSelected = false;
  let bgColor: string = "transparent";
  let container: HTMLElement;

  function startDragging(e: MouseEvent) {
    if (isEditing || (e.target as HTMLElement).closest('.word-toolbar')) return;
    const startX = e.clientX - x;
    const startY = e.clientY - y;
    const onMouseMove = (e: MouseEvent) => { x = e.clientX - startX; y = e.clientY - startY; };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  // --- LOGIQUE DE ROTATION FLUIDE ---
  function startRotating(e: MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    
    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // 1. Calculer l'angle initial de la souris par rapport au centre
    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    
    // 2. Mémoriser la rotation actuelle de la zone
    const initialRotation = rotation;

    const onMouseMove = (e: MouseEvent) => {
      // 3. Calculer le nouvel angle de la souris
      const currentAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
      
      // 4. Appliquer la différence pour une rotation sans saut
      rotation = initialRotation + (currentAngle - startAngle);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  function startResizing(e: MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    const sw = width; const sh = height; const sx = e.clientX; const sy = e.clientY;
    const onMouseMove = (e: MouseEvent) => { 
      width = Math.max(50, sw + (e.clientX - sx)); 
      height = Math.max(40, sh + (e.clientY - sy)); 
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }
</script>

<div 
  bind:this={container}
  class="wrapper" 
  style="left: {x}px; top: {y}px; width: {width}px; min-height: {height}px; background-color: {bgColor}; transform: rotate({rotation}deg);"
  class:selected={isSelected}
  class:hide-border={!showBorder}
  on:mousedown={startDragging} 
  on:mousedown|stopPropagation={() => isSelected = true}
>
  {#if isSelected}
    <div class="word-toolbar" on:mousedown|stopPropagation style="transform: rotate({-rotation}deg) translateY(-20px);">
      <button on:click|stopPropagation={() => showBorder = !showBorder}>
        {showBorder ? "Retirer Bordure" : "Afficher Bordure"}
      </button>

      <div class="color-picker-wrapper">
        <label for="bg">🎨 Fond:</label>
        <div class="input-group">
            <input type="color" bind:value={bgColor} on:click|stopPropagation />
            <button class="clear-color" title="Enlever la couleur" on:click|stopPropagation={() => bgColor = "transparent"}>
                ✖
            </button>
        </div>
      </div>

      <button class="delete-btn" on:click|stopPropagation={() => dispatch('delete')}>
        🗑️ Supprimer
      </button>

      <button class="ok-btn" on:click|stopPropagation={() => isSelected = false}>OK</button>
    </div>

    <div class="rotate-handle" on:mousedown={startRotating}>
      <span class="rotate-icon">⟳</span>
    </div>
  {/if}

  <div class="content-area">
    {#if isEditing}
      <textarea bind:value={content} on:blur={() => isEditing = false} on:mousedown|stopPropagation autofocus></textarea>
    {:else}
      <div class="display" on:dblclick|stopPropagation={() => isEditing = true}>
        {content || "Double-cliquez pour écrire"}
      </div>
    {/if}
  </div>

  {#if isSelected}
    <div class="corner-resizer" on:mousedown={startResizing}></div>
  {/if}
</div>

<style>
  /* Le CSS reste identique (Design conservé) */
  .wrapper { position: absolute; display: flex; flex-direction: column; cursor: move; border: 1px solid #7c3aed; box-sizing: border-box; }
  .hide-border { border: 1px solid transparent !important; }
  .hide-border:hover { border: 1px dashed #ccc !important; }
  .selected { outline: 2px solid #7c3aed; z-index: 100; }
  .word-toolbar { position: absolute; top: -55px; left: 0; display: flex; align-items: center; gap: 12px; background: white; padding: 6px 10px; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); z-index: 1000; }
  .word-toolbar button { padding: 4px 8px; font-size: 12px; cursor: pointer; border: 1px solid #ddd; background: #f9f9f9; border-radius: 3px; }
  .delete-btn { color: #ef4444 !important; border-color: #fecaca !important; }
  .delete-btn:hover { background: #fef2f2 !important; }
  .ok-btn { background: #7c3aed !important; color: white; border: none !important; }
  .color-picker-wrapper { display: flex; align-items: center; gap: 5px; font-size: 12px; }
  .input-group { display: flex; align-items: center; background: #eee; border-radius: 4px; padding: 2px; }
  input[type="color"] { border: none; width: 22px; height: 22px; cursor: pointer; background: none; }
  .clear-color { background: none !important; border: none !important; color: #666; font-size: 10px !important; padding: 0 5px !important; font-weight: bold; }
  .content-area { flex: 1; display: flex; }
  .display { padding: 10px; white-space: pre-wrap; word-wrap: break-word; width: 100%; }
  textarea { width: 100%; height: 100%; padding: 10px; border: none; outline: none; resize: none; background: transparent; display: block; }
  .corner-resizer { width: 12px; height: 12px; background: #7c3aed; position: absolute; bottom: -6px; right: -6px; cursor: nwse-resize; border-radius: 50%; border: 2px solid white; }
  .rotate-handle { position: absolute; bottom: -35px; left: 50%; transform: translateX(-50%); width: 26px; height: 26px; background: white; border: 1px solid #7c3aed; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: grab; }
</style>