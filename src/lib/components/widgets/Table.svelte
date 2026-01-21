<script lang="ts">
    import type {
        BaseElement,
        ElementProps,
        TableElement,
    } from "$lib/types/presentation";
    import Base from "./Base.svelte";

    let { data = $bindable() }: ElementProps<TableElement> = $props();

    let width = 300;
    let height = 150;

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

    function modify(action: "addR" | "delR" | "addC" | "delC") {
        if (action === "addR") data.table.push(Array(data.table[0].length));
        if (action === "delR" && data.table.length > 1) data.table.pop();
        if (action === "addC") for (let l of data.table) l.push("");
        if (action === "delC" && data.table[0].length > 1)
            for (let l of data.table) l.pop();
        showMenu = false;
    }

    // Helper pour keydown sur le menu (navigation clavier simple)
    function handleMenuKey(e: KeyboardEvent) {
        if (e.key === "Escape") showMenu = false;
    }
</script>

<Base bind:data={data as BaseElement}>
    <div
        class="flex-1 w-full h-full overflow-hidden relative"
        oncontextmenu={handleContext}
        role="presentation"
    >
        <table
            class="w-full h-full border-collapse data.table-fixed pointer-events-none"
            style="
    backgound-color: {data.fillColor};
    border: {data.borderThickness}px {data.borderStyle} {data.borderColor};
    border-radius: {data.borderRadius};"
        >
            <tbody>
                {#each data.table as row, r (r)}
                    <tr style="height: {100 / data.table.length}%;">
                        {#each row as cell, c (c)}
                            <td
                                contenteditable="true"
                                bind:textContent={data.table[r][c]}
                                class="border border-gray-300 p-1 text-sm overflow-hidden focus:bg-blue-50 focus:outline-none pointer-events-auto"
                            ></td>
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    {#if showMenu}
        <div
            class="fixed bg-white border shadow-xl rounded z-[9999] w-40 text-sm py-1 outline-none"
            style="left: {menuX}px; top: {menuY}px;"
            role="menu"
            tabindex="-1"
            onkeydown={handleMenuKey}
        >
            <button
                class="w-full text-left px-3 py-1 hover:bg-gray-100 block"
                onclick={() => modify("addR")}>+ Ligne</button
            >
            <button
                class="w-full text-left px-3 py-1 hover:bg-gray-100 block"
                onclick={() => modify("delR")}>- Ligne</button
            >
            <hr class="my-1" />
            <button
                class="w-full text-left px-3 py-1 hover:bg-gray-100 block"
                onclick={() => modify("addC")}>+ Colonne</button
            >
            <button
                class="w-full text-left px-3 py-1 hover:bg-gray-100 block"
                onclick={() => modify("delC")}>- Colonne</button
            >
            <hr class="my-1" />
            <button
                class="w-full text-left px-3 py-1 text-red-600 hover:bg-red-50 block"
                onclick={() => console.log("delete")}>Supprimer</button
            >
        </div>
    {/if}
</Base>
