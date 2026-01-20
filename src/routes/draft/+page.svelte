<script lang="ts">
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

<div class="flex h-screen w-full bg-gray-100">
    <!-- Left Sidebar: Back Button & Editor Toggle -->
    <aside class="w-20 bg-gray-900 flex flex-col items-center justify-between py-4 flex-shrink-0">
        <button 
            on:click={goBack}
            class="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
            title="Revenir en arrière"
        >
            ↶
        </button>
        
        <button 
            on:click={() => showEditor = !showEditor}
            class="px-4 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm font-medium"
            title="Editeur"
        >
            ⚙️
        </button>
    </aside>

    <!-- Editor Panel (optional right sidebar) -->
    {#if showEditor}
        <aside class="w-80 bg-gray-800 text-white overflow-y-auto flex-shrink-0 border-l border-gray-700">
            <div class="p-4">
                <h2 class="text-lg font-bold mb-4">Editeur d'arborescence</h2>
                
                <!-- Add Slide Section -->
                <div class="mb-6 p-4 bg-gray-700 rounded-lg">
                    <h3 class="font-bold mb-3 text-sm">Ajouter une slide</h3>
                    <label class="text-xs mb-2 block" for="slide-id">ID de la slide</label>
                    <input 
                        id="slide-id"
                        type="number" 
                        placeholder="ID"
                        value={newSlideId}
                        on:change={(e) => newSlideId = parseInt((e.target as HTMLInputElement).value)}
                        class="w-full px-3 py-2 rounded bg-gray-600 text-white text-sm mb-2"
                    />
                    <label class="text-xs mb-2 block" for="slide-label">Label de la slide</label>
                    <input 
                        id="slide-label"
                        type="text" 
                        placeholder="Label de la slide"
                        bind:value={newSlideLabel}
                        class="w-full px-3 py-2 rounded bg-gray-600 text-white text-sm mb-2"
                    />
                    <button 
                        on:click={addNewSlide}
                        class="w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium"
                    >
                        + Ajouter slide
                    </button>
                </div>
                
                <!-- Slides List -->
                <div class="mb-6">
                    <h3 class="font-bold mb-3 text-sm">Slides ({$presentation.slides.length})</h3>
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
                
                <!-- Add Button Section -->
                <div class="p-4 bg-gray-700 rounded-lg">
                    <h3 class="font-bold mb-3 text-sm">Ajouter un bouton</h3>
                    
                    <label class="text-xs mb-2 block" for="slide-select">Slide à modifier</label>
                    <select 
                        id="slide-select"
                        value={selectedSlideForButton}
                        on:change={(e) => selectedSlideForButton = parseInt((e.target as HTMLSelectElement).value)}
                        class="w-full px-3 py-2 rounded bg-gray-600 text-white text-sm mb-3"
                    >
                        {#each $presentation.slides as slide}
                            <option value={slide.id}>Slide {slide.id}</option>
                        {/each}
                    </select>
                    
                    <label class="text-xs mb-2 block" for="button-label">Label du bouton</label>
                    <input 
                        id="button-label"
                        type="text" 
                        placeholder="Ex: Bouton rouge"
                        bind:value={newButtonLabel}
                        class="w-full px-3 py-2 rounded bg-gray-600 text-white text-sm mb-3"
                    />
                    
                    <label class="text-xs mb-2 block" for="button-color">Couleur</label>
                    <select 
                        id="button-color"
                        bind:value={newButtonColor}
                        class="w-full px-3 py-2 rounded bg-gray-600 text-white text-sm mb-3"
                    >
                        <option value="red">Rouge</option>
                        <option value="green">Vert</option>
                        <option value="blue">Bleu</option>
                        <option value="purple">Violet</option>
                        <option value="magenta">Magenta</option>
                        <option value="orange">Orange</option>
                        <option value="yellow">Jaune</option>
                        <option value="cyan">Cyan</option>
                    </select>
                    
                    <label class="text-xs mb-2 block" for="button-destination">Slide destination</label>
                    <input 
                        id="button-destination"
                        type="number" 
                        value={newButtonDestination}
                        on:change={(e) => newButtonDestination = parseInt((e.target as HTMLInputElement).value)}
                        class="w-full px-3 py-2 rounded bg-gray-600 text-white text-sm mb-3"
                    />
                    
                    <button 
                        on:click={addNewButton}
                        class="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
                    >
                        + Ajouter bouton
                    </button>
                </div>
            </div>
        </aside>
    {/if}

    <!-- Main Slide Area -->
    <main class="flex-1 flex items-center justify-center p-8">
        <!-- Slide Container (PowerPoint style) -->
        <div class="w-full max-w-4xl bg-white rounded-lg shadow-2xl" style="aspect-ratio: 16/9;">
            {#each $presentation.slides as slide (slide.id)}
                {#if currentSlide === slide.id}
                    <div class="w-full h-full flex flex-col items-center justify-center p-12 relative">
                        <div class="text-center text-gray-400">
                            <p class="text-lg">{slide.label}</p>
                        </div>
                        
                        <!-- Dynamic Navigation Buttons -->
                        {#if slide.buttons.length > 0}
                            <div class="absolute inset-0">
                                {#each slide.buttons as button (button.id)}
                                    <DraggableButton 
                                        {button}
                                        slideId={slide.id}
                                        colorClass={colorMap[button.color] || 'bg-gray-500 hover:bg-gray-600'}
                                        onNavigate={goToSlide}
                                        onUpdate={(slideId: number, buttonId: string, updates: Record<string, any>) => presentation.updateButton(slideId, buttonId, updates)}
                                    />
                                {/each}
                            </div>
                        {/if}
                    </div>
                {/if}
            {/each}
        </div>
    </main>
</div>
