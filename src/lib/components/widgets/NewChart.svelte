<script lang="ts">
    import type { ElementProps, ChartElement } from "$lib/types/presentation";
    import Base from "./Base.svelte";

    let { data = $bindable() }: ElementProps<ChartElement> = $props();
</script>

<Base bind:data>
    <div
        class="w-full h-full flex flex-col items-center justify-center bg-white overflow-hidden p-4"
    >
        {#if data.title}
            <h2 class="text-lg font-bold text-gray-800 mb-2">{data.title}</h2>
        {/if}
        <div class="flex-1 w-full flex items-center justify-center">
            {#if data.chartType === "bar"}
                {@const maxValue = Math.max(...data.data.flatMap((s) => s.valeurs))}

                <svg class="w-full h-full" viewBox="0 0 400 300">
                    <!-- Bar chart with axes -->

                    <!-- Y-axis -->
                    <line
                        x1="30"
                        y1="20"
                        x2="30"
                        y2="250"
                        stroke="black"
                        stroke-width="1"
                    />
                    <!-- X-axis -->
                    <line
                        x1="30"
                        y1="250"
                        x2="390"
                        y2="250"
                        stroke="black"
                        stroke-width="1"
                    />

                    <!-- Y-axis labels -->
                    {#each [0, 0.25, 0.5, 0.75, 1] as ratio}
                        {@const value = Math.round(maxValue * ratio)}
                        {@const y = 250 - ratio * 230}
                        <text
                            x="10"
                            y={y + 4}
                            font-size="10"
                            text-anchor="end"
                            fill="black">{value}</text
                        >
                        <line
                            x1="25"
                            y1={y}
                            x2="30"
                            y2={y}
                            stroke="black"
                            stroke-width="1"
                        />
                    {/each}

                    <!-- X-axis labels -->
                    {#each data.data[0]?.valeurs || [] as _, i}
                        {@const x =
                            (i /
                                Math.max(
                                    1,
                                    (data.data[0]?.valeurs.length ?? 1) - 1,
                                )) *
                                360 +
                            30}
                        {@const label = data.xAxisLabels?.[i] || (i + 1).toString()}
                        <text
                            {x}
                            y="265"
                            font-size="10"
                            text-anchor="middle"
                            fill="black">{label}</text
                        >
                        <line
                            x1={x}
                            y1="248"
                            x2={x}
                            y2="250"
                            stroke="black"
                            stroke-width="1"
                        />
                    {/each}

                    <!-- Bars -->
                    {#each data.data as serie, i}
                        {#each serie.valeurs as valeur, j}
                            {@const barWidth = 20}
                            {@const barHeight = (valeur / maxValue) * 230}
                            {@const numSeries = data.data.length}
                            {@const x =
                                (j /
                                    Math.max(
                                        1,
                                        (data.data[0]?.valeurs.length ?? 1) - 1,
                                    )) *
                                    320 +
                                50 +
                                (i - (numSeries - 1) / 2) * (barWidth + 2)}
                            {@const y = 250 - barHeight}
                            <rect
                                {x}
                                {y}
                                width={barWidth}
                                height={barHeight}
                                fill={serie.couleur}
                                opacity="0.8"
                            />
                        {/each}
                    {/each}
                </svg>
            {:else if data.chartType === "line"}
                {@const maxValue = Math.max(...data.data.flatMap((s) => s.valeurs))}

                <svg class="w-full h-full" viewBox="0 0 400 300">
                    <!-- Line chart with axes -->

                    <!-- Y-axis -->
                    <line
                        x1="30"
                        y1="20"
                        x2="30"
                        y2="250"
                        stroke="black"
                        stroke-width="1"
                    />
                    <!-- X-axis -->
                    <line
                        x1="30"
                        y1="250"
                        x2="390"
                        y2="250"
                        stroke="black"
                        stroke-width="1"
                    />

                    <!-- Y-axis labels -->
                    {#each [0, 0.25, 0.5, 0.75, 1] as ratio}
                        {@const value = Math.round(maxValue * ratio)}
                        {@const y = 250 - ratio * 230}
                        <text
                            x="10"
                            y={y + 4}
                            font-size="10"
                            text-anchor="end"
                            fill="black">{value}</text
                        >
                        <line
                            x1="25"
                            y1={y}
                            x2="30"
                            y2={y}
                            stroke="black"
                            stroke-width="1"
                        />
                    {/each}

                    <!-- X-axis labels -->
                    {#each data.data[0]?.valeurs || [] as _, i}
                        {@const x =
                            (i /
                                Math.max(
                                    1,
                                    (data.data[0]?.valeurs.length ?? 1) - 1,
                                )) *
                                360 +
                            30}
                        {@const label = data.xAxisLabels?.[i] || (i + 1).toString()}
                        <text
                            {x}
                            y="265"
                            font-size="10"
                            text-anchor="middle"
                            fill="black">{label}</text
                        >
                        <line
                            x1={x}
                            y1="248"
                            x2={x}
                            y2="250"
                            stroke="black"
                            stroke-width="1"
                        />
                    {/each}

                    <!-- Lines and points -->
                    {#each data.data as serie}
                        {@const points = serie.valeurs
                            .map((v, i) => {
                                const x =
                                    (i / (serie.valeurs.length - 1 || 1)) * 360 +
                                    30;
                                const y = 250 - (v / maxValue) * 230;
                                return `${x},${y}`;
                            })
                            .join(" ")}
                        <polyline
                            {points}
                            fill="none"
                            stroke={serie.couleur}
                            stroke-width="2"
                        />
                        <!-- Data points -->
                        {#each serie.valeurs as v, i}
                            {@const x =
                                (i / (serie.valeurs.length - 1 || 1)) * 360 + 30}
                            {@const y = 250 - (v / maxValue) * 230}
                            <circle
                                cx={x}
                                cy={y}
                                r="3"
                                fill={serie.couleur}
                                stroke="white"
                                stroke-width="1"
                            />
                        {/each}
                    {/each}
                </svg>
            {:else if data.chartType === "pie"}
                <svg class="w-full h-full" viewBox="0 0 400 300">
                    <!-- Pie chart -->
                    {#each data.data as serie, serieIndex}
                        {@const total = data.data.reduce(
                            (sum, s) => sum + s.valeurs.reduce((a, b) => a + b, 0),
                            0,
                        )}
                        {@const serieTotal = serie.valeurs.reduce(
                            (a, b) => a + b,
                            0,
                        )}
                        {@const percentage = (serieTotal / total) * 100}
                        {@const cumulativePercentage = data.data
                            .slice(0, serieIndex)
                            .reduce(
                                (sum, s) =>
                                    sum +
                                    (s.valeurs.reduce((a, b) => a + b, 0) / total) *
                                        100,
                                0,
                            )}
                        {@const startAngle =
                            (cumulativePercentage / 100) * 2 * Math.PI}
                        {@const endAngle =
                            startAngle + (percentage / 100) * 2 * Math.PI}
                        {@const cx = 200}
                        {@const cy = 150}
                        {@const r = 80}
                        {@const x1 = cx + r * Math.cos(startAngle)}
                        {@const y1 = cy + r * Math.sin(startAngle)}
                        {@const x2 = cx + r * Math.cos(endAngle)}
                        {@const y2 = cy + r * Math.sin(endAngle)}
                        {@const largeArc = percentage > 50 ? 1 : 0}
                        <path
                            d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            fill={serie.couleur}
                            opacity="0.8"
                        />
                    {/each}
                </svg>
            {/if}
        </div>
    </div>
</Base>

<style>
    div {
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
