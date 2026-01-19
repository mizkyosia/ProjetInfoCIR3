<script lang="ts">
  import Tableau from '$lib/tableau.svelte';

  // --- Gestion du sélecteur ---
  let isPickerOpen = false;
  let hoverRow = 0, hoverCol = 0;

  // --- Gestion des tableaux ---
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

  function handleKey(e: KeyboardEvent) { 
    if(e.key === 'Escape') isPickerOpen = false; 
  }
</script>

<main class="w-full h-screen bg-gray-50 relative overflow-hidden font-sans">
  
  <section class="fixed top-5 left-5 z-[100]">
    
    <button 
      type="button"
      class="p-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all active:scale-95"
      on:click|stopPropagation={() => isPickerOpen = !isPickerOpen}
      aria-label="Insérer un tableau"
      title="Insérer un tableau"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="text-gray-600">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="3" y1="15" x2="21" y2="15"></line>
        <line x1="9" y1="3" x2="9" y2="21"></line>
        <line x1="15" y1="3" x2="15" y2="21"></line>
      </svg>
    </button>

    {#if isPickerOpen}
      <div 
        class="absolute top-full left-0 mt-2 bg-white border border-gray-200 shadow-xl p-3 rounded-lg w-max outline-none z-50"
        on:click|stopPropagation role="dialog" aria-modal="true" tabindex="-1" on:keydown={handleKey}
      >
        <div class="mb-2 text-xs text-gray-500 font-semibold text-center uppercase tracking-wider">
          {hoverCol > 0 ? `${hoverCol} x ${hoverRow}` : 'Insérer un tableau'}
        </div>
        
        <div 
          class="grid grid-cols-10 gap-1 outline-none" 
          on:mouseleave={() => {hoverRow=0; hoverCol=0;}} 
          role="grid" 
          tabindex="-1"
        >
          {#each Array(10) as _, r}
            {#each Array(10) as _, c}
              <button
                type="button"
                class="w-5 h-5 border rounded-sm transition-colors duration-75 block p-0
                { (r+1 <= hoverRow && c+1 <= hoverCol) 
                  ? 'bg-orange-500 border-orange-600 shadow-sm' 
                  : 'bg-white border-gray-200 hover:border-blue-400' }"
                on:mouseenter={() => { hoverRow = r + 1; hoverCol = c + 1; }}
                on:click={() => createTable(r + 1, c + 1)}
                aria-label="{r+1}x{c+1}"
              ></button>
            {/each}
          {/each}
        </div>
      </div>
    {/if}
  </section>

  {#each tables as tbl, i (tbl.id)}
    <Tableau 
      rows={tbl.rows} 
      cols={tbl.cols} 
      x={100 + (i * 30)} 
      y={100 + (i * 30)}
      on:delete={() => removeTable(tbl.id)}
    />
  {/each}
  
</main>