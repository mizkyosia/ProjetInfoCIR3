<script lang="ts">
    // ... (Garde tes imports et ta logique JS/TS identique) ...
    import { presentation } from '$lib/maheb/presentationStore';
    import DraggableButton from '$lib/maheb/DraggableButton.svelte';
    import SlideEditor from '$lib/maheb/SlideEditor.svelte';
   
    let currentSlide: number = 1;
    let history: number[] = [1];
    let showEditor: boolean = false;
    let newSlideLabel: string = '';
    let newSlideId: number = 1;
    let newButtonLabel: string = '';
    let newButtonColor: string = 'blue';
    let newButtonDestination: number = 2;
    let selectedSlideForButton: number = 1;
    let editingButton: string | null = null;
   
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
 
    // Fonctions identiques...
    function goToSlide(slideNumber: number): void {
        const slide = $presentation.slides.find(s => s.id === slideNumber);
        if (slide) {
            history.push(slideNumber);
            currentSlide = slideNumber;
        }
    }
    function goBack(): void {
        if (history.length > 1) {
            history.pop();
            currentSlide = history[history.length - 1];
        }
    }
    function addNewSlide(): void {
        if (newSlideLabel.trim() && newSlideId) {
            presentation.addSlideWithId(newSlideId, newSlideLabel);
            newSlideLabel = '';
            newSlideId = 1;
        }
    }
    function addNewButton(): void {
        presentation.addButton(selectedSlideForButton, newButtonLabel, newButtonColor, newButtonDestination);
        newButtonLabel = '';
        newButtonColor = 'blue';
    }
    function deleteSlide(slideId: number): void {
        if (confirm(`Supprimer la slide ${slideId} ?`)) {
            presentation.deleteSlide(slideId);
            if (currentSlide === slideId) {
                currentSlide = 1;
                history = [1];
            }
        }
    }
    function updateButtonWrapper(slideId: number | null, buttonId: string | null, updates: Record<string, any>): void {
        if (buttonId === null) {
            editingButton = null;
        } else {
            editingButton = buttonId;
            if (slideId && Object.keys(updates).length > 0) {
                presentation.updateButton(slideId, buttonId, updates);
            }
        }
    }
</script>
 
<div class="flex flex-col lg:flex-row h-screen w-full bg-gray-100 overflow-hidden">
    
    <aside class="w-full lg:w-20 bg-gray-900 flex lg:flex-col items-center justify-between p-2 lg:py-4 flex-shrink-0 z-50">
        <button
            on:click={goBack}
            class="p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            title="Retour"
        >
            ↶ <span class="lg:hidden ml-2">Retour</span>
        </button>
       
        <button
            on:click={() => showEditor = !showEditor}
            class="p-3 {showEditor ? 'bg-cyan-600' : 'bg-cyan-500'} text-white rounded-lg hover:bg-cyan-400 transition-colors text-sm"
        >
            ⚙️ <span class="lg:hidden ml-2">Editeur</span>
        </button>
    </aside>
 
    {#if showEditor}
        <aside class="
            fixed inset-0 lg:relative lg:inset-auto
            w-full lg:w-80 bg-gray-800 text-white
            overflow-y-auto z-40 border-l border-gray-700
            transition-all duration-300
        ">
            <div class="p-4">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-lg font-bold">Editeur</h2>
                    <button on:click={() => showEditor = false} class="lg:hidden text-gray-400">✕ Fermer</button>
                </div>
               
                <div class="mb-6 p-4 bg-gray-700 rounded-lg">
                    <h3 class="font-bold mb-3 text-xs uppercase tracking-wider text-gray-400">Ajouter une slide</h3>
                    <input
                        type="number"
                        placeholder="ID"
                        value={newSlideId}
                        on:change={(e) => newSlideId = parseInt((e.target as HTMLInputElement).value)}
                        class="w-full px-3 py-2 rounded bg-gray-600 text-white text-sm mb-2"
                    />
                    <input
                        type="text"
                        placeholder="Label"
                        bind:value={newSlideLabel}
                        class="w-full px-3 py-2 rounded bg-gray-600 text-white text-sm mb-3"
                    />
                    <button on:click={addNewSlide} class="w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors">
                        + Ajouter slide
                    </button>
                </div>
               
                <div class="mb-6">
                    <h3 class="font-bold mb-3 text-xs uppercase tracking-wider text-gray-400">Slides ({$presentation.slides.length})</h3>
                    <div class="space-y-2">
                        {#each $presentation.slides as slide (slide.id)}
                            <SlideEditor
                                {slide}
                                {editingButton}
                                onNavigate={goToSlide}
                                onDeleteSlide={deleteSlide}
                                onDeleteButton={(slideId, buttonId) => presentation.deleteButton(slideId, buttonId)}
                                onEditButton={updateButtonWrapper}
                            />
                        {/each}
                    </div>
                </div>
               
                <div class="p-4 bg-gray-700 rounded-lg">
                    <h3 class="font-bold mb-3 text-xs uppercase tracking-wider text-gray-400">Ajouter un bouton</h3>
                    <select
                        value={selectedSlideForButton}
                        on:change={(e) => selectedSlideForButton = parseInt((e.target as HTMLSelectElement).value)}
                        class="w-full px-3 py-2 rounded bg-gray-600 text-white text-sm mb-2"
                    >
                        {#each $presentation.slides as slide}
                            <option value={slide.id}>Slide {slide.id}</option>
                        {/each}
                    </select>
                    <input
                        type="text"
                        placeholder="Label du bouton"
                        bind:value={newButtonLabel}
                        class="w-full px-3 py-2 rounded bg-gray-600 text-white text-sm mb-2"
                    />
                    <select bind:value={newButtonColor} class="w-full px-3 py-2 rounded bg-gray-600 text-white text-sm mb-2">
                        {#each Object.keys(colorMap) as color}
                            <option value={color}>{color}</option>
                        {/each}
                    </select>
                    <input
                        type="number"
                        placeholder="Vers slide n°"
                        value={newButtonDestination}
                        on:change={(e) => newButtonDestination = parseInt((e.target as HTMLInputElement).value)}
                        class="w-full px-3 py-2 rounded bg-gray-600 text-white text-sm mb-3"
                    />
                    <button on:click={addNewButton} class="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors">
                        + Ajouter bouton
                    </button>
                </div>
            </div>
        </aside>
    {/if}
 
    <main class="flex-1 flex flex-col min-w-0 relative overflow-hidden">
 
        <div class="flex-1 flex items-center justify-center p-4 lg:p-12 overflow-hidden">
            <div class="w-full max-w-5xl bg-white rounded-lg shadow-2xl relative overflow-hidden" style="aspect-ratio: 16/9;">
                {#each $presentation.slides as slide (slide.id)}
                    {#if currentSlide === slide.id}
                        <div class="w-full h-full flex flex-col items-center justify-center relative">
                            <div class="text-center text-gray-400 p-4">
                                <p class="text-base lg:text-lg italic">{slide.label}</p>
                            </div>
                           
                            {#if slide.buttons.length > 0}
                                <div class="absolute inset-0">
                                    {#each slide.buttons as button (button.id)}
                                        <DraggableButton
                                            {button}
                                            slideId={slide.id}
                                            colorClass={colorMap[button.color] || 'bg-gray-500 hover:bg-gray-600'}
                                            onNavigate={goToSlide}
                                            onUpdate={(slideId, buttonId, updates) => presentation.updateButton(slideId, buttonId, updates)}
                                        />
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    {/if}
                {/each}
            </div>
        </div>
 
        <footer class="h-24 lg:h-32 bg-white border-t border-gray-200 flex items-center px-4 gap-4 overflow-x-auto no-scrollbar">
            {#each $presentation.slides as slide (slide.id)}
                <button
                    on:click={() => goToSlide(slide.id)}
                    class="flex-shrink-0 group relative focus:outline-none"
                >
                    <span class="absolute -top-1 left-0 text-[10px] font-bold {currentSlide === slide.id ? 'text-cyan-500' : 'text-gray-400'}">
                        {slide.id}
                    </span>
                    <div class="w-24 lg:w-36 aspect-video rounded border-2 transition-all bg-gray-50 flex items-center justify-center
                        {currentSlide === slide.id ? 'border-cyan-500 ring-2 ring-cyan-500/10' : 'border-gray-200 hover:border-gray-300'}">
                        <span class="text-[9px] lg:text-[10px] font-semibold text-gray-500 truncate px-2">{slide.label}</span>
                    </div>
                </button>
            {/each}
        </footer>
    </main>
</div>
 
<style>
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { scrollbar-width: none; }
    
    /* Empêcher le scroll du body quand l'éditeur est ouvert sur mobile */
    :global(body) {
        overflow: hidden;
    }
</style>