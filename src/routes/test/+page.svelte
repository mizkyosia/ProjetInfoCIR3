<script>
    import Toolbar from '$lib/Toolbar.svelte';
    let showPreview = $state(false);
    let data = $state({ html: "" });
</script>

<div class="min-h-screen bg-gray-200 p-8">
    <div class="max-w-4xl mx-auto space-y-6">

        <div class="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-indigo-100">
            {#if !showPreview}
                <Toolbar bind:data={data} />
            {:else}
                <div class="p-8 prose max-w-none">
                    {@html data.html}
                </div>
            {/if}
        </div>

    </div>
</div>

<style>
    /* Petit correctif pour que les listes s'affichent bien pendant le test */
    :global(.prose ul) { list-style-type: disc; padding-left: 1.5rem; }
    :global(.prose ol) { list-style-type: decimal; padding-left: 1.5rem; }
</style>
