<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let x = 100;
  export let y = 100;
  export let rows = 2;
  export let cols = 2;

  const dispatch = createEventDispatcher();

  let width = 300;
  let height = 150;
  const minW = 100;
  const minH = 50;

  // --- DRAG ---
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;

  function startDrag(e: MouseEvent) {
    if (isResizing) return;
    isDragging = true;
    dragStartX = e.clientX - x;
    dragStartY = e.clientY - y;
  }

  // --- RESIZE ---
  let isResizing = false;
  let initResizeX = 0;
  let initResizeY = 0;
  let initWidth = 0;
  let initHeight = 0;

  function startResize(e: MouseEvent) {
    e.stopPropagation();
    isResizing = true;
    initResizeX = e.clientX;
    initResizeY = e.clientY;
    initWidth = width;
    initHeight = height;
  }

  // --- GLOBAL MOVE ---
  function onWindowMove(e: MouseEvent) {
    if (isDragging) {
      x = e.clientX - dragStartX;
      y = e.clientY - dragStartY;
    }
    if (isResizing) {
      const deltaX = e.clientX - initResizeX;
      const deltaY = e.clientY - initResizeY;
      width = Math.max(minW, initWidth + deltaX);
      height = Math.max(minH, initHeight + deltaY);
    }
  }

  function onWindowUp() {
    isDragging = false;
    isResizing = false;
  }

  // --- MENU ---
  let showMenu = false;
  let menuX = 0; 
  let menuY = 0;

  function handleContext(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    showMenu = true;
    menuX = e.clientX; 
    menuY = e.clientY;
  }

  function modify(action: 'addR' | 'delR' | 'addC' | 'delC') {
    if (action === 'addR') rows++;
    if (action === 'delR' && rows > 1) rows--;
    if (action === 'addC') cols++;
    if (action === 'delC' && cols > 1) cols--;
    showMenu = false;
  }

  // Helper pour keydown sur le menu (navigation clavier simple)
  function handleMenuKey(e: KeyboardEvent) {
    if (e.key === 'Escape') showMenu = false;
  }
  
</script>

<svelte:window on:mousemove={onWindowMove} on:mouseup={onWindowUp} on:click={() => showMenu = false} />

<section 
  class="absolute bg-white shadow-lg border border-gray-400 select-none flex flex-col z-10"
  style="left: {x}px; top: {y}px; width: {width}px; height: {height}px;"
  role="figure"
  aria-label="Tableau interactif"
>
  
  <button 
    type="button"
    class="h-5 w-full bg-gray-100 border-b border-gray-300 cursor-move flex justify-center items-center shrink-0 hover:bg-gray-200 focus:bg-blue-100 outline-none appearance-none m-0 p-0 rounded-none"
    on:mousedown={startDrag}
    aria-label="Déplacer le tableau"
  >
    <div class="flex gap-1 opacity-30 pointer-events-none">
      <div class="w-1 h-1 bg-black rounded-full"></div>
      <div class="w-1 h-1 bg-black rounded-full"></div>
    </div>
  </button>

  <div 
    class="flex-1 w-full h-full overflow-hidden relative" 
    on:contextmenu={handleContext}
    role="presentation"
  >
    <table class="w-full h-full border-collapse table-fixed pointer-events-none">
      <tbody>
        {#each Array(rows) as _, r}
          <tr style="height: {100 / rows}%;">
            {#each Array(cols) as _, c}
              <td 
                contenteditable="true"
                class="border border-gray-300 p-1 text-sm overflow-hidden focus:bg-blue-50 focus:outline-none pointer-events-auto"
              ></td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <button 
    type="button"
    class="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-20 outline-none appearance-none bg-transparent border-0 p-0 m-0"
    on:mousedown={startResize}
    aria-label="Redimensionner"
  >
    <div class="absolute bottom-1 right-1 w-2 h-2 bg-blue-600 rounded-sm pointer-events-none"></div>
  </button>

  {#if showMenu}
    <div 
      class="fixed bg-white border shadow-xl rounded z-[9999] w-40 text-sm py-1 outline-none"
      style="left: {menuX}px; top: {menuY}px;"
      on:click|stopPropagation
      role="menu"
      tabindex="-1"
      on:keydown={handleMenuKey}
    >
      <button class="w-full text-left px-3 py-1 hover:bg-gray-100 block" on:click={() => modify('addR')}>+ Ligne</button>
      <button class="w-full text-left px-3 py-1 hover:bg-gray-100 block" on:click={() => modify('delR')}>- Ligne</button>
      <hr class="my-1">
      <button class="w-full text-left px-3 py-1 hover:bg-gray-100 block" on:click={() => modify('addC')}>+ Colonne</button>
      <button class="w-full text-left px-3 py-1 hover:bg-gray-100 block" on:click={() => modify('delC')}>- Colonne</button>
      <hr class="my-1">
      <button class="w-full text-left px-3 py-1 text-red-600 hover:bg-red-50 block" on:click={() => dispatch('delete')}>Supprimer</button>
    </div>
  {/if}
</section>