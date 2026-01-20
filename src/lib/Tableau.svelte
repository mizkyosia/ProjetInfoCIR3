<script lang="ts">
  import { tick } from 'svelte';

  export let x = 100, y = 100;
  export let initRows = 3;
  export let initCols = 3;
  export let onDelete: () => void = () => {};

  // --- ÉTAT ---
  let colWidths = Array(initCols).fill(100);
  let rowHeights = Array(initRows).fill(40);
  let tableContainer: HTMLElement;

  $: totalWidth = colWidths.reduce((a, b) => a + b, 0);

  // --- ACTION 1 : DRAG & DROP ---
  function draggable(node: HTMLElement) {
    let startX = 0, startY = 0;

    function handleMousedown(e: MouseEvent) {
      // On ignore le drag si on est sur le texte ou un bouton
      if (e.button === 2 || (e.target as HTMLElement).closest('[contenteditable], button')) return;
      
      e.preventDefault();
      startX = e.clientX - x;
      startY = e.clientY - y;

      window.addEventListener('mousemove', handleMousemove);
      window.addEventListener('mouseup', handleMouseup);
    }

    function handleMousemove(e: MouseEvent) {
      x = e.clientX - startX;
      y = e.clientY - startY;
    }

    function handleMouseup() {
      window.removeEventListener('mousemove', handleMousemove);
      window.removeEventListener('mouseup', handleMouseup);
    }

    node.addEventListener('mousedown', handleMousedown);

    return {
      destroy() { node.removeEventListener('mousedown', handleMousedown); }
    };
  }

  // --- ACTION 2 : COMPORTEMENT CELLULE (Tab, Entrée, Focus) ---
  function cellBehavior(node: HTMLElement, { r, c }: { r: number, c: number }) {
    
    // Empêche le drag du tableau quand on sélectionne du texte
    function handleMousedown(e: MouseEvent) {
      e.stopPropagation();
    }

    // Mise à jour de la hauteur de ligne quand on écrit (Auto-grow)
    function handleInput() {
      const currentHeight = node.getBoundingClientRect().height;
      // Si le texte est plus grand que la hauteur définie, on agrandit la ligne
      if (currentHeight > rowHeights[r]) {
        rowHeights[r] = currentHeight;
      }
    }

    // Gestion de la Tabulation
    async function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Tab') {
        const isLastRow = r === rowHeights.length - 1;
        const isLastCol = c === colWidths.length - 1;

        if (isLastRow && isLastCol && !e.shiftKey) {
          e.preventDefault();
          rowHeights = [...rowHeights, 40];
          await tick();
          const nextR = r + 1;
          const nextCell = tableContainer.querySelector(`[data-coord="${nextR}-0"]`) as HTMLElement;
          if (nextCell) nextCell.focus();
        }
      }
    }

    node.addEventListener('mousedown', handleMousedown);
    node.addEventListener('keydown', handleKeydown);
    node.addEventListener('input', handleInput);

    return {
      destroy() {
        node.removeEventListener('mousedown', handleMousedown);
        node.removeEventListener('keydown', handleKeydown);
        node.removeEventListener('input', handleInput);
      }
    };
  }

  // --- ACTION 3 : REDIMENSIONNEMENT ---
  function resizable(node: HTMLElement, params: { type: 'col' | 'row', index: number }) {
    let startVal = 0, startMouse = 0;

    function handleMousedown(e: MouseEvent) {
      e.stopPropagation();
      startMouse = params.type === 'col' ? e.clientX : e.clientY;
      startVal = params.type === 'col' ? colWidths[params.index] : rowHeights[params.index];
      
      window.addEventListener('mousemove', handleMousemove);
      window.addEventListener('mouseup', handleMouseup);
    }

    function handleMousemove(e: MouseEvent) {
      const delta = (params.type === 'col' ? e.clientX : e.clientY) - startMouse;
      const newVal = Math.max(20, startVal + delta);
      
      if (params.type === 'col') {
        colWidths[params.index] = newVal;
      } else {
        rowHeights[params.index] = newVal;
      }
    }

    function handleMouseup() {
      window.removeEventListener('mousemove', handleMousemove);
      window.removeEventListener('mouseup', handleMouseup);
    }

    node.addEventListener('mousedown', handleMousedown);
    return {
      destroy() { node.removeEventListener('mousedown', handleMousedown); }
    };
  }

  // --- MENU & UTILITAIRES ---
  let showMenu = false, menuX = 0, menuY = 0;

  function openMenu(e: MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    showMenu = true; menuX = e.clientX; menuY = e.clientY;
  }
  
  function handleWindowClick() { showMenu = false; }
  function handleContainerKey(e: KeyboardEvent) { if (e.key === 'Escape') showMenu = false; }

  function modify(action: 'addR' | 'delR' | 'addC' | 'delC') {
    if (action === 'addR') rowHeights = [...rowHeights, 40];
    if (action === 'delR' && rowHeights.length > 1) rowHeights = rowHeights.slice(0, -1);
    if (action === 'addC') colWidths = [...colWidths, 100];
    if (action === 'delC' && colWidths.length > 1) colWidths = colWidths.slice(0, -1);
    showMenu = false;
  }
</script>

<svelte:window on:click={handleWindowClick} />

<div 
  bind:this={tableContainer}
  use:draggable
  class="absolute bg-white shadow-xl select-none flex flex-col z-10 cursor-move ring-1 ring-gray-300 outline-none"
  style="left: {x}px; top: {y}px; width: {totalWidth}px;"
  role="group" 
  aria-label="Tableau interactif"
  on:contextmenu={openMenu}
>
  <div class="relative" role="presentation">
    <table class="border-collapse table-fixed w-full pointer-events-none">
      <colgroup>
        {#each colWidths as w} <col style="width: {w}px;"> {/each}
      </colgroup>
      <tbody>
        {#each rowHeights as h, r}
          <tr style="height: {h}px;">
            {#each colWidths as w, c}
              <td class="border border-gray-400 relative p-0 pointer-events-auto group align-top">
                
                <div 
                  contenteditable="true" 
                  use:cellBehavior={{ r, c }}
                  data-coord="{r}-{c}"
                  class="w-full min-h-full p-1 text-sm outline-none cursor-text whitespace-pre-wrap break-words bg-transparent" 
                  role="textbox" 
                  aria-label="Cellule"
                ></div>

                <button type="button" 
                  use:resizable={{ type: 'col', index: c }}
                  aria-label="Resize col" tabindex="-1"
                  class="absolute top-0 right-[-5px] w-[10px] h-full cursor-col-resize z-20 bg-transparent outline-none border-none"
                ></button>

                <button type="button" 
                  use:resizable={{ type: 'row', index: r }}
                  aria-label="Resize row" tabindex="-1"
                  class="absolute bottom-[-5px] left-0 w-full h-[10px] cursor-row-resize z-20 bg-transparent outline-none border-none"
                ></button>

              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if showMenu}
    <div class="fixed bg-white border shadow-xl rounded z-[9999] w-40 text-sm py-1 outline-none cursor-default" 
         style="left: {menuX}px; top: {menuY}px;" 
         role="menu"
         tabindex="-1"
         on:click|stopPropagation 
         on:mousedown|stopPropagation
         on:keydown={handleContainerKey}
    >
      <button type="button" class="w-full text-left px-3 py-1 hover:bg-gray-100 block" on:click={() => modify('addR')}>+ Ligne</button>
      <button type="button" class="w-full text-left px-3 py-1 hover:bg-gray-100 block" on:click={() => modify('delR')}>- Ligne</button>
      <hr class="my-1">
      <button type="button" class="w-full text-left px-3 py-1 hover:bg-gray-100 block" on:click={() => modify('addC')}>+ Colonne</button>
      <button type="button" class="w-full text-left px-3 py-1 hover:bg-gray-100 block" on:click={() => modify('delC')}>- Colonne</button>
      <hr class="my-1">
      <button type="button" class="w-full text-left px-3 py-1 text-red-600 hover:bg-red-50 block" on:click={onDelete}>Supprimer</button>
    </div>
  {/if}
</div>