<script lang="ts">
  import Charts from '../../lib/Charts.svelte';
  import { fade, slide } from 'svelte/transition';

  interface Serie { label: string; valeurs: number[]; couleur: string; }
  interface GraphObject {
    id: number; type: string; x: number; y: number; w: number; h: number;
    etiquettes: string[]; tableau: Serie[];
  }

  let graphiques: GraphObject[] = [];
  let selectedId: number | null = null;
  let showMenu = false;

  let isDragging = false;
  let isResizing = false;
  let startX: number, startY: number, startW: number, startH: number, startPosX: number, startPosY: number;

  $: activeGraph = graphiques.find(g => g.id === selectedId) || null;

  function ajouterGraphique(type: string) {
    const newId = Date.now();
    graphiques = [...graphiques, {
      id: newId, type, x: 150, y: 150, w: 450, h: 300,
      etiquettes: ["Jan", "Fév", "Mar"],
      tableau: [
        { label: "Série 1", valeurs: [30, 20, 45], couleur: "#4FD1C5" },
        { label: "Série 2", valeurs: [15, 30, 25], couleur: "#F6AD55" }
      ]
    }];
    selectedId = newId;
    showMenu = false;
  }

  function handleMouseDown(e: MouseEvent, id: number, mode: 'move' | 'resize') {
    selectedId = id;
    const g = graphiques.find(graph => graph.id === id);
    if (!g) return;
    startX = e.clientX; startY = e.clientY;
    startW = g.w; startH = g.h;
    startPosX = g.x; startPosY = g.y;
    if (mode === 'resize') isResizing = true; else isDragging = true;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  function handleMouseMove(e: MouseEvent) {
    if (selectedId === null) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    graphiques = graphiques.map(g => {
      if (g.id === selectedId) {
        if (isDragging) return { ...g, x: startPosX + dx, y: startPosY + dy };
        if (isResizing) return { ...g, w: Math.max(200, startW + dx), h: Math.max(150, startH + dy) };
      }
      return g;
    });
  }

  function handleMouseUp() {
    isDragging = isResizing = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }

  function addSerie() {
    if (!activeGraph) return;
    activeGraph.tableau = [...activeGraph.tableau, { label: "Série", valeurs: Array(activeGraph.etiquettes.length).fill(0), couleur: "#FC8181" }];
    graphiques = [...graphiques];
  }

  function delSerie(idx: number) {
    if (!activeGraph || activeGraph.tableau.length <= 1) return;
    activeGraph.tableau = activeGraph.tableau.filter((_, i) => i !== idx);
    graphiques = [...graphiques];
  }

  function addLabel() {
    if (!activeGraph) return;
    activeGraph.etiquettes = [...activeGraph.etiquettes, "Nouveau"];
    activeGraph.tableau = activeGraph.tableau.map(s => ({ ...s, valeurs: [...s.valeurs, 0] }));
    graphiques = [...graphiques];
  }

  function delLabel(idx: number) {
    if (!activeGraph || activeGraph.etiquettes.length <= 1) return;
    activeGraph.etiquettes = activeGraph.etiquettes.filter((_, i) => i !== idx);
    activeGraph.tableau = activeGraph.tableau.map(s => ({ ...s, valeurs: s.valeurs.filter((_, i) => i !== idx) }));
    graphiques = [...graphiques];
  }
</script>

<div class="canva-shell">
  <aside class="side-nav">
    <button class="nav-btn" on:click={() => showMenu = !showMenu} class:active={showMenu}>
      <span class="icon">📊</span><span class="label">Graphiques</span>
    </button>

    {#if showMenu}
      <div class="menu-flyout" transition:fade>
        <div class="menu-section">Graphiques à barres</div>
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="grid">
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div class="opt-card" on:click={() => ajouterGraphique('bar')}>
            <div class="vignette bar-preview"></div>
            <p>Bâtons</p>
          </div>
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div class="opt-card" on:click={() => ajouterGraphique('stacked')}>
            <div class="vignette stacked-preview"></div>
            <p>Empilés</p>
          </div>
        </div>
      </div>
    {/if}

    {#if activeGraph}
      <div class="editor-drawer" transition:slide={{axis: 'x'}}>
        <div class="ed-header">
           <h3>Données</h3>
           <button class="btn-del" on:click={() => {graphiques = graphiques.filter(g => g.id !== selectedId); selectedId = null;}}>Supprimer</button>
        </div>
        <div class="table-area">
          <table>
            <thead>
              <tr>
                <th class="sticky">Label</th>
                {#each activeGraph.tableau as s, i}
                  <th>
                    <div class="th-cell">
                      <input bind:value={s.label} class="serie-name-input" placeholder="Série..." />
                      <div class="color-row">
                        <input type="color" bind:value={s.couleur} />
                        <button class="small-x" on:click={() => delSerie(i)}>×</button>
                      </div>
                    </div>
                  </th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each activeGraph.etiquettes as _, j}
                <tr>
                  <td class="sticky">
                    <div class="td-label">
                      <button class="small-x" on:click={() => delLabel(j)}>×</button>
                      <input bind:value={activeGraph.etiquettes[j]} />
                    </div>
                  </td>
                  {#each activeGraph.tableau as serie}
                    <td><input type="number" bind:value={serie.valeurs[j]} class="n-in" /></td>
                  {/each}
                </tr>
              <!-- svelte-ignore block_empty -->
              {#each activeGraph.tableau as serie}
              {/each}
              {/each}
            </tbody>
          </table>
        </div>
        <div class="ed-footer">
          <button on:click={addLabel}>+ Label X</button>
          <button on:click={addSerie} class="primary">+ Série Y</button>
        </div>
      </div>
    {/if}
  </aside>

  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <main class="whiteboard" on:mousedown|self={() => selectedId = null}>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    {#each graphiques as g (g.id)}
      <div 
        class="element" 
        class:selected={selectedId === g.id}
        style="width: {g.w}px; height: {g.h}px; left: {g.x}px; top: {g.y}px;"
        on:mousedown|stopPropagation={(e) => handleMouseDown(e, g.id, 'move')}
      >
        <Charts typeGraphique={g.type} tableau={g.tableau} etiquettes={g.etiquettes} />
        
        <div class="chart-legend">
            {#each g.tableau as s}
              <div class="legend-item">
                <span class="dot" style="background: {s.couleur}"></span>
                {s.label}
              </div>
            {/each}
        </div>

        {#if selectedId === g.id}
          <div class="resizer" on:mousedown|stopPropagation={(e) => handleMouseDown(e, g.id, 'resize')}></div>
        {/if}
      </div>
    {/each}
  </main>
</div>

<style>
  :global(body) { margin: 0; padding: 0; background: #f4f5f7; font-family: sans-serif; overflow: hidden; }
  .canva-shell { display: flex; height: 100vh; }
  
  .side-nav { width: 72px; background: #fff; border-right: 1px solid #ddd; z-index: 100; position: relative; }
  .nav-btn { width: 100%; border: none; background: none; padding: 20px 0; cursor: pointer; color: #666; transition: 0.2s; }
  .nav-btn.active { color: #8B5CF6; background: #f8f7ff; }
  .icon { display: block; font-size: 24px; margin-bottom: 4px; }
  .label { font-size: 10px; font-weight: bold; }

  .menu-flyout { position: absolute; left: 72px; top: 0; width: 240px; height: 100%; background: #fff; border-right: 1px solid #ddd; padding: 20px; box-shadow: 10px 0 20px rgba(0,0,0,0.05); }
  .menu-section { font-weight: bold; margin-bottom: 15px; font-size: 14px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .opt-card { cursor: pointer; text-align: center; border-radius: 8px; padding: 5px; transition: 0.2s; }
  .opt-card:hover { background: #f4f5f7; }
  .vignette { height: 60px; background: #eee; border-radius: 4px; margin-bottom: 5px; border: 1px solid transparent; }
  .opt-card:hover .vignette { border-color: #8B5CF6; }
  .bar-preview { background: linear-gradient(to top, #4FD1C5 40%, transparent 40%) 20% 100% / 8px 100% no-repeat, linear-gradient(to top, #4FD1C5 70%, transparent 70%) 50% 100% / 8px 100% no-repeat, linear-gradient(to top, #4FD1C5 50%, transparent 50%) 80% 100% / 8px 100% no-repeat; }
  .stacked-preview { background: linear-gradient(to top, #4FD1C5 40%, #F6AD55 40%, #F6AD55 80%, transparent 80%) 50% 100% / 15px 100% no-repeat; }

  .editor-drawer { position: absolute; left: 72px; top: 0; width: 400px; height: 100%; background: #fff; box-shadow: 5px 0 20px rgba(0,0,0,0.1); padding: 20px; display: flex; flex-direction: column; z-index: 90; }
  .ed-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
  .btn-del { border: none; color: #ef4444; background: none; cursor: pointer; font-size: 12px; }
  .table-area { flex: 1; overflow: auto; border: 1px solid #edf2f7; border-radius: 4px; }
  table { width: 100%; border-collapse: collapse; }
  td, th { border: 1px solid #edf2f7; padding: 6px; }
  .sticky { position: sticky; left: 0; background: #f8fafc; z-index: 2; font-size: 12px; }
  
  .th-cell { display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .serie-name-input { font-weight: bold; font-size: 11px; background: #f0f0f0; border-radius: 4px; margin-bottom: 2px; }
  .color-row { display: flex; align-items: center; gap: 4px; }

  .td-label { display: flex; align-items: center; justify-content: center; gap: 4px; }
  .small-x { background: #fee2e2; color: #ef4444; border: none; border-radius: 50%; width: 16px; height: 16px; cursor: pointer; font-size: 10px; padding: 0; }
  input { border: none; width: 100%; text-align: center; font-size: 12px; outline: none; }
  .n-in { background: #f9fafb; border: 1px solid #e2e8f0; border-radius: 3px; width: 50px; padding: 2px; }
  
  .ed-footer { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; }
  .ed-footer button { padding: 10px; cursor: pointer; border: 1px solid #d1d5db; background: #fff; border-radius: 8px; font-weight: bold; }
  .ed-footer button.primary { background: #8B5CF6; color: white; border: none; }

  .whiteboard { flex: 1; position: relative; background: #f0f2f5; overflow: hidden; }
  .element { position: absolute; background: #fff; padding: 30px; padding-bottom: 50px; border: 2px solid transparent; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); cursor: grab; }
  .element.selected { border-color: #8B5CF6; cursor: default; z-index: 10; }
  .resizer { position: absolute; bottom: 0; right: 0; width: 16px; height: 16px; background: #8B5CF6; cursor: nwse-resize; border-radius: 4px 0 0 0; }

  .chart-legend { display: flex; justify-content: center; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
  .legend-item { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #444; }
  .dot { width: 8px; height: 8px; border-radius: 50%; }
</style>