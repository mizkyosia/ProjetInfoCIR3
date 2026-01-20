<script lang="ts">
    import { presentation } from '$lib/maheb/presentationStore';
    import DraggableButton from '$lib/maheb/DraggableButton.svelte';
    import SlideEditor from '$lib/maheb/SlideEditor.svelte';
    import { fly } from 'svelte/transition';
    
    // État
    let currentSlide: number = 1;
    let history: number[] = [1];
    let showEditor: boolean = false;
    let editingButton: string | null = null;
    
    // Inputs formulaires
    let newSlideLabel: string = '';
    let newSlideId: number = 1;
    let newButtonLabel: string = '';
    let newButtonColor: string = 'blue';
    let newButtonDestination: number = 2;
    let selectedSlideForButton: number = 1;
    
    const colorMap: Record<string, string> = {
        red: 'bg-red-500 hover:bg-red-600',
        green: 'bg-green-500 hover:bg-green-600',
        blue: 'bg-blue-500 hover:bg-blue-600',
        purple: 'bg-purple-500 hover:bg-purple-600',
        magenta: 'bg-pink-500 hover:bg-pink-600',
        orange: 'bg-orange-500 hover:bg-orange-600',
        yellow: 'bg-yellow-500 hover:bg-yellow-600',
        cyan: 'bg-cyan-500 hover:bg-cyan-600'
    };
    
    // Navigation
    const goToSlide = (slideNumber: number | string): void => {
        const id = typeof slideNumber === 'string' ? parseInt(slideNumber) : slideNumber;
        const slide = $presentation.slides.find(s => s.id === id);
        if (slide) {
            history.push(id);
            currentSlide = id;
        }
    };
    
    const goBack = (): void => {
        if (history.length > 1) {
            history.pop();
            currentSlide = history[history.length - 1];
        }
    };

    // Fonctions avec types TypeScript corrigés
    const addNewSlide = (): void => {
        if (newSlideLabel.trim() && newSlideId) {
            presentation.addSlideWithId(newSlideId, newSlideLabel);
            newSlideLabel = '';
            newSlideId = 1;
        }
    };

    const deleteSlide = (id: number | string): void => {
        const numericId = typeof id === 'string' ? parseInt(id) : id;
        if (confirm(`Supprimer la slide ${numericId} ?`)) {
            presentation.deleteSlide(numericId);
            if (currentSlide === numericId) {
                currentSlide = 1;
                history = [1];
            }
        }
    };

    const addNewButton = (): void => {
        presentation.addButton(selectedSlideForButton, newButtonLabel, newButtonColor, newButtonDestination);
        newButtonLabel = '';
    };

    const handleDeleteButton = (sId: number | string, bId: string): void => {
        const id = typeof sId === 'string' ? parseInt(sId) : sId;
        presentation.deleteButton(id, bId);
    };

    const handleEditButton = (sId: number | string | null, bId: string | null, data: any): void => {
        if (bId === null) {
            editingButton = null;
        } else if (sId !== null) {
            editingButton = bId;
            const id = typeof sId === 'string' ? parseInt(sId) : sId;
            presentation.updateButton(id, bId, data);
        }
    };

    const handleUpdateButton = (sId: number | string, bId: string, data: any): void => {
        const id = typeof sId === 'string' ? parseInt(sId) : sId;
        presentation.updateButton(id, bId, data);
    };
</script>

<div class="flex h-screen w-full bg-[#f3f4f6] overflow-hidden">
    <aside class="w-20 bg-gray-900 flex flex-col items-center py-6 flex-shrink-0 z-20">
        <button on:click={goBack} class="mb-6 p-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all shadow-lg">↶</button>
        <button on:click={() => showEditor = !showEditor} class="p-3 {showEditor ? 'bg-cyan-500' : 'bg-gray-800'} text-white rounded-xl transition-all shadow-lg">⚙️</button>
    </aside>

    {#if showEditor}
        <aside transition:fly={{ x: -300, duration: 300 }} class="w-80 bg-gray-800 text-white overflow-y-auto flex-shrink-0 border-r border-gray-700 z-10">
            <div class="p-4 space-y-6">
                <h2 class="text-lg font-bold">Configuration</h2>
                
                <form on:submit|preventDefault={addNewSlide} class="p-4 bg-gray-700 rounded-lg space-y-2">
                    <h3 class="font-bold text-sm">Ajouter une slide</h3>
                    <input type="number" bind:value={newSlideId} class="w-full p-2 rounded bg-gray-600 text-sm" placeholder="ID" />
                    <input type="text" bind:value={newSlideLabel} class="w-full p-2 rounded bg-gray-600 text-sm" placeholder="Label" />
                    <button type="submit" class="w-full p-2 bg-green-600 rounded text-sm font-medium hover:bg-green-700">Ajouter</button>
                </form>

                <div>
                    <h3 class="font-bold text-sm mb-3">Slides ({$presentation.slides.length})</h3>
                    {#each $presentation.slides as slide (slide.id)}
                        <SlideEditor 
                            {slide} 
                            {editingButton} 
                            onNavigate={goToSlide} 
                            onDeleteSlide={deleteSlide} 
                            onDeleteButton={handleDeleteButton} 
                            onEditButton={handleEditButton} 
                        />
                    {/each}
                </div>
            </div>
        </aside>
    {/if}

    <main class="flex-1 flex flex-col min-w-0 relative">
        <div class="flex-1 flex items-center justify-center p-8 overflow-hidden">
            <div class="w-full max-w-5xl bg-white rounded-lg shadow-2xl relative overflow-hidden" style="aspect-ratio: 16/9;">
                {#each $presentation.slides as slide (slide.id)}
                    {#if currentSlide === slide.id}
                        <div class="w-full h-full flex flex-col items-center justify-center p-12 relative">
                            <p class="text-2xl font-medium text-gray-300">{slide.label}</p>
                            <div class="absolute inset-0">
                                {#each slide.buttons as button (button.id)}
                                    <DraggableButton 
                                        {button} 
                                        slideId={slide.id} 
                                        colorClass={colorMap[button.color] || 'bg-gray-500'} 
                                        onNavigate={goToSlide} 
                                        onUpdate={handleUpdateButton} 
                                    />
                                {/each}
                            </div>
                        </div>
                    {/if}
                {/each}
            </div>
        </div>

        <footer class="h-32 bg-white border-t border-gray-200 flex items-center px-6 gap-4 overflow-x-auto no-scrollbar">
            {#each $presentation.slides as slide (slide.id)}
                <button on:click={() => goToSlide(slide.id)} class="flex-shrink-0 group relative focus:outline-none">
                    <span class="absolute -top-1 left-0 text-[10px] font-bold {currentSlide === slide.id ? 'text-[#8b3dff]' : 'text-gray-400'}">
                        {slide.id}
                    </span>
                    <div class="w-36 aspect-video rounded-lg border-2 transition-all duration-200 bg-gray-50 flex items-center justify-center 
                        {currentSlide === slide.id ? 'border-[#8b3dff] ring-2 ring-[#8b3dff]/20' : 'border-gray-200 hover:border-gray-300'}">
                        <span class="text-[10px] font-semibold text-gray-500 truncate px-2">{slide.label}</span>
                    </div>
                </button>
            {/each}
        </footer>
    </main>
</div>

<style>
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>