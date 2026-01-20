<script lang="ts">
    import { presentation } from '$lib/maheb/presentationStore';
    import DraggableButton from '$lib/maheb/DraggableButton.svelte';
    import SlideEditor from '$lib/maheb/SlideEditor.svelte';
    
    // State management
    let currentSlide: number = 1;
    let history: number[] = [1];
    let showEditor: boolean = false;
    let editingButton: string | null = null;
    
    // Form inputs
    let newSlideLabel: string = '';
    let newSlideId: number = 1;
    let newButtonLabel: string = '';
    let newButtonColor: string = 'blue';
    let newButtonDestination: number = 2;
    let selectedSlideForButton: number = 1;
    
    // Color mapping
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
    
    // Slide management
    const addNewSlide = (): void => {
        if (newSlideLabel.trim() && newSlideId) {
            presentation.addSlideWithId(newSlideId, newSlideLabel);
            newSlideLabel = '';
            newSlideId = 1;
        }
    };
    
    const deleteSlide = (slideId: number | string): void => {
        const id = typeof slideId === 'string' ? parseInt(slideId) : slideId;
        if (confirm(`Supprimer la slide ${id} ?`)) {
            presentation.deleteSlide(id);
            if (currentSlide === id) {
                currentSlide = 1;
                history = [1];
            }
        }
    };
    
    // Button management
    const addNewButton = (): void => {
        presentation.addButton(selectedSlideForButton, newButtonLabel, newButtonColor, newButtonDestination);
        newButtonLabel = '';
        newButtonColor = 'blue';
    };
    
    const handleDeleteButton = (slideId: number | string, buttonId: string): void => {
        const id = typeof slideId === 'string' ? parseInt(slideId) : slideId;
        presentation.deleteButton(id, buttonId);
    };
    
    const handleEditButton = (slideId: number | string | null, buttonId: string | null, data: any): void => {
        if (buttonId === null) {
            editingButton = null;
        } else {
            editingButton = buttonId;
            if (slideId && Object.keys(data).length > 0) {
                const id = typeof slideId === 'string' ? parseInt(slideId) : slideId;
                presentation.updateButton(id, buttonId, data);
            }
        }
    };
    
    const handleUpdateButton = (slideId: number | string, buttonId: string, data: any): void => {
        const id = typeof slideId === 'string' ? parseInt(slideId) : slideId;
        presentation.updateButton(id, buttonId, data);
    };
</script>

<div class="flex h-screen w-full bg-gray-100">
    <!-- Left Sidebar -->
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

    <!-- Editor Panel -->
    {#if showEditor}
        <aside class="w-80 bg-gray-800 text-white overflow-y-auto flex-shrink-0 border-l border-gray-700">
            <div class="p-4 space-y-6">
                <h2 class="text-lg font-bold">Editeur d'arborescence</h2>
                
                <!-- Add Slide Form -->
                <form on:submit|preventDefault={addNewSlide} class="p-4 bg-gray-700 rounded-lg space-y-2">
                    <h3 class="font-bold text-sm">Ajouter une slide</h3>
                    <label class="text-xs block" for="slide-id">ID</label>
                    <input 
                        id="slide-id"
                        type="number" 
                        placeholder="ID"
                        bind:value={newSlideId}
                        class="w-full px-3 py-2 rounded bg-gray-600 text-white text-sm"
                    />
                    <label class="text-xs block mt-2" for="slide-label">Label</label>
                    <input 
                        id="slide-label"
                        type="text" 
                        placeholder="Label"
                        bind:value={newSlideLabel}
                        class="w-full px-3 py-2 rounded bg-gray-600 text-white text-sm"
                    />
                    <button 
                        type="submit"
                        class="w-full px-3 py-2 mt-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium"
                    >
                        + Ajouter slide
                    </button>
                </form>
                
                <!-- Slides List -->
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
                
                <!-- Add Button Form -->
                <form on:submit|preventDefault={addNewButton} class="p-4 bg-gray-700 rounded-lg space-y-2">
                    <h3 class="font-bold text-sm">Ajouter un bouton</h3>
                    
                    <label class="text-xs block" for="slide-select">Slide</label>
                    <select 
                        id="slide-select"
                        bind:value={selectedSlideForButton}
                        class="w-full px-3 py-2 rounded bg-gray-600 text-white text-sm"
                    >
                        {#each $presentation.slides as slide}
                            <option value={slide.id}>Slide {slide.id}</option>
                        {/each}
                    </select>
                    
                    <label class="text-xs block mt-2" for="button-label">Label</label>
                    <input 
                        id="button-label"
                        type="text" 
                        placeholder="Libellé du bouton"
                        bind:value={newButtonLabel}
                        class="w-full px-3 py-2 rounded bg-gray-600 text-white text-sm"
                    />
                    
                    <label class="text-xs block mt-2" for="button-color">Couleur</label>
                    <select 
                        id="button-color"
                        bind:value={newButtonColor}
                        class="w-full px-3 py-2 rounded bg-gray-600 text-white text-sm"
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
                    
                    <label class="text-xs block mt-2" for="button-destination">Destination</label>
                    <input 
                        id="button-destination"
                        type="number" 
                        bind:value={newButtonDestination}
                        class="w-full px-3 py-2 rounded bg-gray-600 text-white text-sm"
                    />
                    
                    <button 
                        type="submit"
                        class="w-full px-3 py-2 mt-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
                    >
                        + Ajouter bouton
                    </button>
                </form>
            </div>
        </aside>
    {/if}

    <!-- Main Slide Area -->
    <main class="flex-1 flex items-center justify-center p-8">
        <div class="w-full max-w-4xl bg-white rounded-lg shadow-2xl" style="aspect-ratio: 16/9;">
            {#each $presentation.slides as slide (slide.id)}
                {#if currentSlide === slide.id}
                    <div class="w-full h-full flex flex-col items-center justify-center p-12 relative">
                        <div class="text-center text-gray-400">
                            <p class="text-lg">{slide.label}</p>
                        </div>
                        
                        {#if slide.buttons.length > 0}
                            <div class="absolute inset-0">
                                {#each slide.buttons as button (button.id)}
                                    <DraggableButton 
                                        {button}
                                        slideId={slide.id}
                                        colorClass={colorMap[button.color] || 'bg-gray-500 hover:bg-gray-600'}
                                        onNavigate={goToSlide}
                                        onUpdate={handleUpdateButton}
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
