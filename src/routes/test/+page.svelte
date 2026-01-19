<script>
    import Toolbar from "$lib/Toolbar.svelte";

    // Texte de test pour vérifier les boutons
    let text = `
Ceci est un texte de test.

Essayez de mettre ce mot en gras : IMPORTANT
Essayez de mettre celui-ci en italique : italique
Et celui-là en souligné : souligné

Changez la police pour voir la différence entre :
- Arial
- Times New Roman
- Courier New
- Comic Sans MS

Testez aussi la taille du texte :
8px, 12px, 20px, 32px, 48px

Testez les alignements :
Texte aligné à gauche
Texte centré
Texte aligné à droite
Texte justifié : Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.

Testez la couleur :
Rouge, bleu, vert, noir, gris.

Fin du test.
`;
</script>

<div class="p-10 space-y-6">
    <h1 class="text-3xl font-bold">Page de test – Barre d’outils texte</h1>

    <!-- Ta barre d’outils -->
    <Toolbar />

    <!-- Zone d’édition -->
    <div class="mt-6">
        <h2 class="text-xl font-semibold mb-2">Zone d’édition</h2>
        <textarea
            bind:value={text}
            class="w-full h-64 border border-gray-300 rounded p-3 focus:outline-none focus:border-indigo-500"
        ></textarea>
    </div>

    <!-- Aperçu -->
    <div class="mt-6">
        <h2 class="text-xl font-semibold mb-2">Aperçu du texte</h2>
        <div class="border border-gray-300 rounded p-4 bg-gray-50 whitespace-pre-wrap">
            {text}
        </div>
    </div>
</div>