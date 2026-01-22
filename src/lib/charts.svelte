<script lang="ts">
  // Définition de l'interface pour supprimer les erreurs de type (Image d744f7)
  interface Serie {
    label: string;
    valeurs: number[];
    couleur: string;
  }

  export let typeGraphique: string = "bar";
  export let tableau: Serie[] = [];
  export let etiquettes: string[] = [];
  
  // Dimensions virtuelles pour le ratio interne du SVG
  const w: number = 600; 
  const h: number = 400;
  const pX: number = 60; 
  const pY: number = 40; 

  // Calcul du maximum vertical sécurisé
  $: maxVal = typeGraphique === 'stacked' 
    ? Math.max(...etiquettes.map((_, j) => tableau.reduce((sum, s) => sum + (Number(s.valeurs[j]) || 0), 0)), 1)
    : Math.max(...tableau.flatMap(s => s.valeurs.map(v => Number(v) || 0)), 1);

  $: getY = (val: number) => (h - pY) - ((Number(val) || 0) / maxVal) * (h - pY * 2);
</script>

<div class="chart-container">
  <svg viewBox="0 0 {w} {h}" preserveAspectRatio="none">
    {#each [0, 0.25, 0.5, 0.75, 1] as rel}
      {@const valY = (h - pY) - rel * (h - pY * 2)}
      <line x1={pX} y1={valY} x2={w - 20} y2={valY} stroke="#eee" />
      <text x={pX - 10} y={valY + 4} text-anchor="end" font-size="14" fill="#aaa">
        {Math.round(maxVal * rel)}
      </text>
    {/each}

    {#if typeGraphique === 'bar'}
      {#each etiquettes as _, j}
        {@const groupW = (w - pX - 20) / etiquettes.length}
        {@const barW = (groupW * 0.7) / tableau.length}
        {#each tableau as serie, i}
          <rect 
            x={pX + (j * groupW) + (i * barW) + (groupW * 0.15)}
            y={getY(serie.valeurs[j])}
            width={Math.max(1, barW - 2)}
            height={Math.max(0, (h - pY) - getY(serie.valeurs[j]))}
            fill={serie.couleur} rx="2"
          />
        {/each}
      {/each}
    {:else}
      {#each etiquettes as _, j}
        {@const groupW = (w - pX - 20) / etiquettes.length}
        {@const barW = groupW * 0.5}
        {@const startX = pX + (j * groupW) + (groupW * 0.25)}
        {#each tableau as serie, i}
          {@const base = i === 0 ? 0 : tableau.slice(0, i).reduce((acc, s) => acc + (Number(s.valeurs[j]) || 0), 0)}
          {@const val = Number(serie.valeurs[j]) || 0}
          <rect 
            x={startX}
            y={getY(base + val)}
            width={barW}
            height={Math.max(0, getY(base) - getY(base + val))}
            fill={serie.couleur}
          />
        {/each}
      {/each}
    {/if}

    <line x1={pX} y1={h - pY} x2={w - 20} y2={h - pY} stroke="#333" stroke-width="2" />
    {#each etiquettes as etiq, j}
      <text x={pX + (j * (w - pX - 20) / etiquettes.length) + ((w - pX - 20) / etiquettes.length / 2)} y={h - pY + 25} text-anchor="middle" font-size="14" fill="#333">
        {etiq}
      </text>
    {/each}
  </svg>
</div>

<style>
  .chart-container { width: 100%; height: 100%; pointer-events: none; }
  svg { width: 100%; height: 100%; display: block; overflow: visible; }
</style>