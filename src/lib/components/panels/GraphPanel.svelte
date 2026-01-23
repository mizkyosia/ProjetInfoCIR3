<script lang="ts">
    import { createPresentationElement } from "$lib/types/presentation";
    import { editorStore } from "$lib/state.svelte.js";

    let graphForm = $state({
        chartType: "bar" as "bar" | "line" | "pie",
        title: "",
        columnLabels: ["Q1", "Q2", "Q3", "Q4"],
        rows: [
            { label: "Series 1", values: [10, 20, 15, 25], color: "#6366f1" },
            { label: "Series 2", values: [15, 18, 22, 20], color: "#ec4899" },
        ],
    });

    function addGraphRow() {
        graphForm.rows.push({
            label: `Series ${graphForm.rows.length + 1}`,
            values: Array(graphForm.columnLabels.length).fill(0),
            color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        });
    }

    function removeGraphRow(index: number) {
        graphForm.rows.splice(index, 1);
    }

    function addGraphColumn() {
        graphForm.columnLabels.push(`Col${graphForm.columnLabels.length + 1}`);
        graphForm.rows.forEach((row) => {
            row.values.push(0);
        });
    }

    function removeGraphColumn(index: number) {
        graphForm.columnLabels.splice(index, 1);
        graphForm.rows.forEach((row) => {
            row.values.splice(index, 1);
        });
    }

    function submitGraph() {
        if (graphForm.rows.length === 0) {
            alert("Please add at least one data series");
            return;
        }

        const chartData = graphForm.rows.map((row) => ({
            label: row.label,
            valeurs: row.values,
            couleur: row.color,
        }));

        console.log("Graph submitted:", {
            chartType: graphForm.chartType,
            title: graphForm.title,
            xAxisLabels: graphForm.columnLabels,
            series: chartData,
        });

        editorStore.updateSlide((s) =>
            s.elements.push(
                createPresentationElement("chart", {
                    chartType: graphForm.chartType,
                    title: graphForm.title || undefined,
                    xAxisLabels: graphForm.columnLabels,
                    data: chartData,
                }),
            ),
        );

        // Reset form
        graphForm = {
            chartType: "bar",
            title: "",
            columnLabels: ["Q1", "Q2", "Q3", "Q4"],
            rows: [
                { label: "Series 1", values: [10, 20, 15, 25], color: "#6366f1" },
                { label: "Series 2", values: [15, 18, 22, 20], color: "#ec4899" },
            ],
        };
    }
</script>

<div class="p-6 space-y-4 overflow-y-auto max-h-full">
    <!-- Chart type -->
    <div>
        <label
            class="block text-sm font-semibold text-gray-700 mb-2"
            >Chart Type</label
        >
        <select
            bind:value={graphForm.chartType}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="pie">Pie Chart</option>
        </select>
    </div>

    <!-- Title -->
    <div>
        <label
            class="block text-sm font-semibold text-gray-700 mb-2"
            >Chart Title (optional)</label
        >
        <input
            type="text"
            bind:value={graphForm.title}
            placeholder="e.g., Sales by Quarter"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
    </div>

    <!-- Data table -->
    <div class="border-t pt-4">
        <div class="flex items-center justify-between mb-3">
            <span
                class="block text-sm font-semibold text-gray-700"
                >Data Table</span
            >
            <button
                onclick={addGraphColumn}
                class="text-xs px-2 py-1 text-purple-600 hover:bg-purple-50 rounded transition-colors border border-purple-300"
                title="Add column"
            >
                <i class="fa fa-plus" aria-hidden="true"></i>
            </button>
        </div>

        <div class="overflow-x-auto">
            <table
                class="w-full text-xs border-collapse border border-gray-300"
            >
                <thead>
                    <tr class="bg-gray-50">
                        <th
                            class="border border-gray-300 px-2 py-1 text-left"
                        >
                            Series
                        </th>
                        {#each graphForm.columnLabels as label, colIndex}
                            <th class="border border-gray-300 px-2 py-1 relative group">
                                <input
                                    type="text"
                                    bind:value={graphForm.columnLabels[colIndex]}
                                    class="w-12 px-1 py-0 border-0 bg-gray-50 text-center font-semibold"
                                />
                                {#if graphForm.columnLabels.length > 1}
                                    <button
                                        onclick={() => removeGraphColumn(colIndex)}
                                        class="absolute -top-2 -right-2 hidden group-hover:flex items-center justify-center w-4 h-4 bg-red-500 text-white rounded-full text-xs"
                                        title="Remove column"
                                    >
                                        ×
                                    </button>
                                {/if}
                            </th>
                        {/each}
                        <th class="border border-gray-300 px-2 py-1 w-8"></th>
                    </tr>
                </thead>
                <tbody>
                    {#each graphForm.rows as row, rowIndex}
                        <tr>
                            <td class="border border-gray-300 px-2 py-1">
                                <div class="flex gap-1 items-center">
                                    <input
                                        type="color"
                                        bind:value={row.color}
                                        class="w-6 h-6 border-0 cursor-pointer rounded"
                                    />
                                    <input
                                        type="text"
                                        bind:value={row.label}
                                        class="flex-1 px-1 py-0 border border-gray-300 rounded text-xs"
                                    />
                                </div>
                            </td>
                            {#each row.values as value, colIndex}
                                <td
                                    class="border border-gray-300 px-2 py-1"
                                >
                                    <input
                                        type="number"
                                        bind:value={row.values[colIndex]}
                                        class="w-full px-1 py-0 border-0 text-center text-xs"
                                    />
                                </td>
                            {/each}
                            <td class="border border-gray-300 px-2 py-1">
                                {#if graphForm.rows.length > 1}
                                    <button
                                        onclick={() => removeGraphRow(rowIndex)}
                                        class="text-red-600 hover:text-red-800"
                                        title="Remove row"
                                    >
                                        <i
                                            class="fa fa-trash text-xs"
                                            aria-hidden="true"
                                        ></i>
                                    </button>
                                {/if}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <button
            onclick={addGraphRow}
            class="mt-2 w-full px-3 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-purple-500 hover:text-purple-600 transition-colors text-sm font-medium"
        >
            <i class="fa fa-plus" aria-hidden="true"></i> Add Series
        </button>
    </div>

    <!-- Submit button -->
    <button
        onclick={submitGraph}
        class="w-full px-4 py-2 bg-linear-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
    >
        <i class="fa fa-check" aria-hidden="true"></i> Add Chart to
        Slide
    </button>
</div>
