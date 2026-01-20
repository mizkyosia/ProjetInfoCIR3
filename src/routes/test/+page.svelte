<script lang="ts">
  import Tableau from '$lib/Tableau.svelte';

  let isPickerOpen = false;
  let hoverRow = 0, hoverCol = 0;

  interface TableItem { id: number; rows: number; cols: number; }
  let tables: TableItem[] = [];

  function createTable(r: number, c: number) {
    tables = [...tables, { id: Date.now(), rows: r, cols: c }];
    isPickerOpen = false;
    hoverRow = 0; hoverCol = 0;
  }

  function removeTable(id: number) {
    tables = tables.filter(t => t.id !== id);
  }

  // Gestion clavier
  function handleKey(e: KeyboardEvent) { if(e.key === 'Escape') isPickerOpen = false; }
  
  // Fonction pour mettre à jour la sélection (utilisée par souris ET clavier)
  function updateHover(r: number, c: number) {
    hoverRow = r; hoverCol = c;
  }
</script>

<main class="w-full h-screen bg-gray-100 relative overflow-hidden font-sans" on:click={() => isPickerOpen = false} role="none">
  
  <div class="fixed top-5 left-5 z-[100]" on:click|stopPropagation role="none">
    <button type="button"
      class="p-2 bg-white text-gray-700 border border-gray-300 rounded shadow hover:bg-gray-50 active:scale-95 transition"
      on:click={() => isPickerOpen = !isPickerOpen}
      title="Insérer un tableau" aria-label="Insérer un tableau"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
      </svg>
    </button>

    {#if isPickerOpen}
      <div class="absolute top-full left-0 mt-2 bg-white border shadow-xl p-3 rounded w-max z-50 outline-none" 
           role="dialog" aria-modal="true" tabindex="-1" on:keydown={handleKey}>
        <div class="mb-2 text-xs font-bold text-center text-gray-500">
          {hoverCol > 0 ? `${hoverCol} x ${hoverRow}` : 'Sélectionner'}
        </div>
        
        <div class="grid grid-cols-10 gap-1 outline-none" on:mouseleave={() => {hoverRow=0; hoverCol=0;}} role="grid" tabindex="-1">
          {#each Array(10) as _, r}
            {#each Array(10) as _, c}
              <button type="button"
                class="w-5 h-5 border block p-0 transition-colors
                { (r+1 <= hoverRow && c+1 <= hoverCol) ? 'bg-orange-500 border-orange-600' : 'bg-white border-gray-200' }"
                on:mouseenter={() => updateHover(r + 1, c + 1)}
                on:focus={() => updateHover(r + 1, c + 1)}
                on:click={() => createTable(r + 1, c + 1)}
                aria-label="Tableau de {r+1} lignes sur {c+1} colonnes"
              ></button>
            {/each}
          {/each}
        </div>
      </div>
    {/if}
  </div>

  {#each tables as tbl, i (tbl.id)}
    <Tableau 
      initRows={tbl.rows} 
      initCols={tbl.cols} 
      x={150 + (i * 20)} 
      y={150 + (i * 20)}
      onDelete={() => removeTable(tbl.id)}
    />
  {/each}

</main>