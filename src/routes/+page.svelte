<script lang="ts">
    import { isPresentationMode, togglePresentation, currentSlide, nextSlide, prevSlide } from '$lib/photo.svelte';
    import { fly, fade, scale } from 'svelte/transition';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

    // Référence HTML vers le conteneur de ta page blanche
    let whitePageElement: HTMLElement;

    // Simulation : Tes collègues remplaceront ceci par leur liste de slides
    let pages = [{ id: 1, content: "Slide unique" }]; 
    $: totalPages = pages.length;

    // Barre de progression animée (Tweened)
    const progress = tweened(0, { duration: 400, easing: cubicOut });
    $: progress.set(($currentSlide + 1) / totalPages);

    // Raccourcis clavier en mode présentation
    function handleKeyDown(e: KeyboardEvent) {
        if (!$isPresentationMode) return;
        if (e.key === 'ArrowRight') nextSlide(totalPages);
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'Escape') isPresentationMode.set(false);
    }
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="h-screen w-full flex flex-col bg-[#ebecef] overflow-hidden font-sans">
    
    <nav class="h-14 bg-[#8b3dff] flex items-center justify-between px-4 text-white shadow-md z-50">
        <div class="flex items-center gap-6">
            <span class="font-bold text-sm">DesignFlow</span>
            <span class="text-xs opacity-60">Sans nom 1920x1080</span>
        </div>

        <div class="flex items-center gap-3">
            <button 
                on:click={() => togglePresentation(whitePageElement)}
                class="flex items-center gap-2 px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-all text-xs font-bold border border-white/10"
            >
                <span>▶</span> Présenter
            </button>

            <button class="bg-white text-[#8b3dff] px-5 py-1.5 rounded-md font-bold text-sm shadow-sm">
                Share
            </button>
        </div>
    </nav>

    <div class="flex flex-1 overflow-hidden">
        <aside class="w-16 bg-[#18191b] flex flex-col items-center py-6 gap-8 text-white/40">
            <span>🎨</span><span>🧩</span><span class="text-white">T</span>
        </aside>

        <main class="flex-1 flex items-center justify-center p-10 relative">
            
            <div 
                bind:this={whitePageElement} 
                class="relative shadow-2xl transition-all duration-500 {$isPresentationMode ? 'w-full h-full bg-black flex items-center justify-center' : ''}"
            >
                {#key $currentSlide}
                    <div 
                        in:scale={{duration: 400, start: 0.98}}
                        class="bg-white flex items-center justify-center relative overflow-hidden {$isPresentationMode ? 'w-[85vw] aspect-video' : 'w-[800px] h-[450px]'}"
                    >
                        <div class="text-center p-12">
                            <h1 class="text-4xl font-black text-slate-800">Contenu de la Page</h1>
                            <p class="text-slate-400 mt-2">estce que Simon est le goat ?: {$isPresentationMode}</p>
                        </div>

                        {#if $isPresentationMode}
                            <div 
                                class="absolute bottom-0 left-0 h-1 bg-[#8b3dff]" 
                                style="width: {$progress * 100}%"
                            ></div>
                        {/if}
                    </div>
                {/key}

                {#if $isPresentationMode}
                    <div transition:fade class="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/60 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full text-white shadow-2xl">
                        <button on:click={prevSlide}>←</button>
                        <span class="text-[10px] font-bold uppercase tracking-widest">{$currentSlide + 1} / {totalPages}</span>
                        <button on:click={() => nextSlide(totalPages)}>→</button>
                        <div class="w-[1px] h-4 bg-white/20 mx-2"></div>
                        <button 
                            on:click={() => togglePresentation(whitePageElement)}
                            class="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase"
                        >
                            Quitter
                        </button>
                    </div>
                {/if}
            </div>
        </main>
    </div>
</div>

<style>
    :global(body) {
        margin: 0;
        overflow: hidden;
    }

    /* Supprime les bordures en mode plein écran pour une immersion totale */
    :global(:fullscreen) {
        background-color: black !important;
    }
</style>