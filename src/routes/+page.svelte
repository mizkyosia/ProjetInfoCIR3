<script lang="ts">
    import { isPresentationMode, togglePresentation, currentSlide, nextSlide, prevSlide } from '$lib/photo.svelte';
    import { fade, fly, scale } from 'svelte/transition';
    
    let currentPage: 'landing' | 'editor' = 'landing';
    let editorContainer: HTMLElement;

    // Structure de données flexibles.
    let pages = [
        { id: 1, title: "Concept Initial", content: "Focus sur l'expérience utilisateur.", color: "bg-white" },
        { id: 2, title: "Design System", content: "Utilisation de Tailwind CSS et Svelte.", color: "bg-white" }
    ];

    const addPage = () => {
        pages = [...pages, { 
            id: Date.now(), 
            title: "Nouvelle Page", 
            content: "Éditez ce contenu...", 
            color: "bg-white" 
        }];
    };

    function handleKeyDown(e: KeyboardEvent) {
        if (!$isPresentationMode) return;
        if (e.key === 'ArrowRight') nextSlide(pages.length);
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'Escape') togglePresentation(editorContainer);
    }
</script>

<svelte:window on:keydown={handleKeyDown} />

{#if currentPage === 'landing'}
    <div out:fade class="h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white">
        <div class="relative">
            <div class="absolute -inset-1 rounded-lg bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 opacity-75 blur"></div>
            <h1 class="relative text-8xl font-black tracking-tighter mb-8 bg-white bg-clip-text text-transparent">DesignFlow</h1>
        </div>
        <button 
            on:click={() => currentPage = 'editor'} 
            class="group relative px-8 py-4 font-bold text-white transition-all duration-300"
        >
            <div class="absolute inset-0 bg-purple-600 rounded-xl group-hover:scale-105 group-hover:bg-purple-500 transition-all"></div>
            <span class="relative">Start Designing →</span>
        </button>
    </div>

{:else}
    <div bind:this={editorContainer} class="h-screen w-full flex flex-col bg-[#f1f5f9] overflow-hidden">
        
        {#if $isPresentationMode}
            <div class="h-full w-full bg-[#0f172a] flex items-center justify-center relative overflow-hidden" in:fade>
                
                {#key $currentSlide}
                    <div 
                        in:fly={{ x: 100, duration: 500 }} 
                        out:fly={{ x: -100, duration: 500 }}
                        class="w-[85%] aspect-video {pages[$currentSlide].color} rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col p-20"
                    >
                        <h2 class="text-6xl font-black text-slate-900 mb-8 border-b-4 border-purple-500 pb-4 inline-block">
                            {pages[$currentSlide].title}
                        </h2>
                        <p class="text-3xl text-slate-600 leading-relaxed">
                            {pages[$currentSlide].content}
                        </p>
                    </div>
                {/key}

                <div class="absolute bottom-8 flex items-center gap-6 bg-white/10 backdrop-blur-xl px-8 py-4 rounded-2xl border border-white/20 text-white shadow-2xl">
                    <button on:click={prevSlide} class="hover:text-purple-400 transition-colors text-2xl">←</button>
                    <div class="flex flex-col items-center">
                        <span class="text-xs uppercase tracking-widest opacity-50">Slide</span>
                        <span class="font-bold">{$currentSlide + 1} / {pages.length}</span>
                    </div>
                    <button on:click={() => nextSlide(pages.length)} class="hover:text-purple-400 transition-colors text-2xl">→</button>
                    <div class="w-[1px] h-8 bg-white/20 mx-2"></div>
                    <button on:click={() => togglePresentation(editorContainer)} class="bg-red-500/80 hover:bg-red-500 px-4 py-2 rounded-lg text-xs font-bold transition-all">QUITTER</button>
                </div>
            </div>

        {:else}
            <nav class="bg-white/80 backdrop-blur-md p-4 flex justify-between items-center border-b border-slate-200 z-10">
                <button on:click={() => currentPage = 'landing'} class="text-slate-400 hover:text-purple-600 transition-colors font-medium">← Back to Home</button>
                
                <div class="flex gap-3">
                    <button on:click={addPage} class="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">+ Add Page</button>
                    <button 
                        on:click={() => togglePresentation(editorContainer)} 
                        class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-purple-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <span>Present Project</span>
                        <span class="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase">{pages.length}</span>
                    </button>
                </div>
            </nav>

            <main class="flex-1 overflow-y-auto p-12 space-y-12 flex flex-col items-center bg-[#f8fafc]">
                {#each pages as page, i}
                    <div class="group relative" in:scale={{duration: 300}}>
                        <span class="absolute -left-12 top-0 text-slate-300 font-black text-4xl">0{i + 1}</span>
                        <div class="w-[800px] aspect-video {page.color} rounded-sm shadow-xl border border-slate-200 flex flex-col p-12 hover:shadow-2xl hover:border-purple-300 transition-all">
                            <input bind:value={page.title} class="text-4xl font-black text-slate-800 outline-none bg-transparent mb-6" placeholder="Titre de la slide..." />
                            <textarea bind:value={page.content} class="flex-1 w-full outline-none resize-none bg-transparent text-xl text-slate-500" placeholder="Commencez à écrire..."></textarea>
                        </div>
                    </div>
                {/each}
            </main>
        {/if}
    </div>
{/if}