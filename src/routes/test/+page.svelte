<script>
    import Toolbar from '$lib/Toolbar.svelte';

    // On crée une variable qui contient le texte de test
    let testData = $state({
        html: "<h2>Bienvenue dans le test !</h2><p>Essaie de mettre ce texte en <b>gras</b> ou en <i>italique</i>.</p>"
    });

    let showPreview = $state(false);
</script>

<div class="min-h-screen bg-gray-200 p-8">
    <div class="max-w-4xl mx-auto space-y-6">
        
        <div class="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
            <h1 class="text-xl font-bold text-indigo-600">🧪 Labo de Test : Toolbar.svelte</h1>
            <button 
                onclick={() => showPreview = !showPreview}
                class="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition"
            >
                {showPreview ? 'Modifier' : 'Voir le rendu final'}
            </button>
        </div>

        <div class="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-indigo-100">
            {#if !showPreview}
                <Toolbar bind:data={testData} />
            {:else}
                <div class="p-8 prose max-w-none">
                    {@html testData.html}
                </div>
            {/if}
        </div>

        <div class="bg-gray-800 text-green-400 p-4 rounded-lg font-mono text-xs overflow-auto h-40">
            <p class="text-gray-400 mb-2">// Code HTML généré par ton Toolbar.svelte :</p>
            {testData.html}
        </div>

    </div>
</div>

<style>
    /* Petit correctif pour que les listes s'affichent bien pendant le test */
    :global(.prose ul) { list-style-type: disc; padding-left: 1.5rem; }
    :global(.prose ol) { list-style-type: decimal; padding-left: 1.5rem; }
</style>