<script lang="ts">
    import { isPresentationMode, togglePresentation, currentSlide, nextSlide, prevSlide } from '$lib/photo.svelte';
    import { fade } from 'svelte/transition';

    
    let whitePageElement: HTMLElement;

  
    let totalPages = 1; 

    // pour gerer le clavier en plein ecran 
    function handleKeyDown(e: KeyboardEvent) {
        if (!$isPresentationMode) return;
        if (e.key === 'ArrowRight') nextSlide(totalPages);
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'Escape') isPresentationMode.set(false);
    }
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="h-screen w-full flex flex-col overflow-hidden bg-[#ebecef] font-sans">
    
    <nav class="h-14 bg-[#8b3dff] flex items-center justify-between px-4 text-white shadow-md z-50">
        <div class="flex items-center gap-6">
            <div class="flex flex-col leading-none">
                <span class="text-xs opacity-70">File</span>
                <span class="font-bold text-sm">Resize</span>
            </div>
            <span class="text-sm opacity-80 border-l border-white/20 pl-4">Sans nom 1920x1080</span>
        </div>

        <div class="flex items-center gap-3">
            <button 
                on:click={() => togglePresentation(whitePageElement)}
                class="flex items-center gap-2 px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-all text-sm font-semibold border border-white/10"
            >
                <span class="text-lg">▶</span> Présenter
            </button>

            <div class="flex items-center gap-2 ml-2">
                <div class="flex -space-x-2">
                    <div class="w-7 h-7 rounded-full bg-orange-400 border-2 border-[#8b3dff]"></div>
                    <div class="w-7 h-7 rounded-full bg-green-400 border-2 border-[#8b3dff]"></div>
                </div>
                <button class="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full">+</button>
                <button class="bg-white text-[#8b3dff] px-5 py-1.5 rounded-md font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
                    Share
                </button>
            </div>
        </div>
    </nav>

    <div class="flex flex-1 overflow-hidden">
        <aside class="w-20 bg-[#18191b] flex flex-col items-center py-4 gap-6 text-[10px] text-white/60">
            <div class="flex flex-col items-center gap-1 cursor-pointer hover:text-white">
                <span class="text-xl">🎨</span> Design
            </div>
            <div class="flex flex-col items-center gap-1 cursor-pointer hover:text-white">
                <span class="text-xl">🧩</span> Elements
            </div>
            <div class="flex flex-col items-center gap-1 cursor-pointer hover:text-white">
                <span class="text-xl">T</span> Text
            </div>
        </aside>

        <main class="flex-1 flex items-center justify-center p-10 relative">
            
            <div 
                bind:this={whitePageElement} 
                class="relative shadow-2xl transition-all duration-500 {$isPresentationMode ? 'w-full h-full bg-black flex items-center justify-center' : ''}"
            >
                <div class="bg-white w-[800px] h-[450px] flex items-center justify-center relative overflow-hidden">
                    <div class="text-center">
                        <h1 class="text-4xl font-bold text-slate-800">Contenu du Projet</h1>
                        <p class="text-slate-400 mt-2 italic">Reflet dynamique du travail en cours</p>
                    </div>
                </div>

                {#if $isPresentationMode}
                    <div 
                        transition:fade
                        class="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/60 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full text-white shadow-2xl"
                    >
                        <button on:click={prevSlide} class="hover:text-purple-400">←</button>
                        <span class="text-xs font-bold tracking-widest uppercase">{$currentSlide + 1} / {totalPages}</span>
                        <button on:click={() => nextSlide(totalPages)} class="hover:text-purple-400">→</button>
                        <div class="w-[1px] h-4 bg-white/20 mx-2"></div>
                        <button 
                            on:click={() => togglePresentation(whitePageElement)}
                            class="text-[10px] font-black text-red-400 hover:text-red-300 uppercase tracking-tighter"
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
    
    
    :global(:fullscreen) .bg-white {
        width: 80vw !important;
        height: 45vw !important;
        max-width: 1920px;
        max-height: 1080px;
    }
</style>