<script>
    export let slide;
    export let onNavigate;
    export let onDeleteSlide;
    export let onDeleteButton;
    export let onEditButton;
    export let editingButton;
    
    let isExpanded = true;
</script>

<div 
    class="mb-3 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors" 
    on:click={() => onNavigate(slide.id)}
>
    <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium">ID: {slide.id} - {slide.label}</span>
        <button 
            on:click={(e) => {
                e.stopPropagation();
                onDeleteSlide(slide.id);
            }}
            class="text-red-400 hover:text-red-300 text-xs"
        >
            ✕
        </button>
    </div>
    
    <!-- Buttons in this slide -->
    <div class="ml-2 mb-2">
        {#each slide.buttons as button (button.id)}
            <div class="text-xs bg-gray-600 p-2 rounded mb-1">
                <div class="flex justify-between items-center mb-1">
                    <span>{button.label} → Slide {button.destinationSlide}</span>
                    <button 
                        on:click={(e) => {
                            e.stopPropagation();
                            onDeleteButton(slide.id, button.id);
                        }}
                        class="text-red-400 hover:text-red-300"
                    >
                        ✕
                    </button>
                </div>
                {#if editingButton === button.id}
                    <div class="bg-gray-500 p-2 rounded text-xs space-y-1">
                        <div class="grid grid-cols-2 gap-1">
                            <div>
                                <label class="block text-gray-300">X</label>
                                <input 
                                    type="number" 
                                    value={button.x || 0}
                                    on:change={(e) => onEditButton(slide.id, button.id, { x: parseInt(e.target.value) })}
                                    class="w-full px-1 py-1 bg-gray-700 text-white rounded text-xs"
                                />
                            </div>
                            <div>
                                <label class="block text-gray-300">Y</label>
                                <input 
                                    type="number" 
                                    value={button.y || 0}
                                    on:change={(e) => onEditButton(slide.id, button.id, { y: parseInt(e.target.value) })}
                                    class="w-full px-1 py-1 bg-gray-700 text-white rounded text-xs"
                                />
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-1">
                            <div>
                                <label class="block text-gray-300">Largeur</label>
                                <input 
                                    type="number" 
                                    value={button.width || 100}
                                    on:change={(e) => onEditButton(slide.id, button.id, { width: parseInt(e.target.value) })}
                                    class="w-full px-1 py-1 bg-gray-700 text-white rounded text-xs"
                                />
                            </div>
                            <div>
                                <label class="block text-gray-300">Hauteur</label>
                                <input 
                                    type="number" 
                                    value={button.height || 40}
                                    on:change={(e) => onEditButton(slide.id, button.id, { height: parseInt(e.target.value) })}
                                    class="w-full px-1 py-1 bg-gray-700 text-white rounded text-xs"
                                />
                            </div>
                        </div>
                        <button 
                            on:click={(e) => {
                                e.stopPropagation();
                                onEditButton(null, null, {});
                            }}
                            class="w-full px-1 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                        >
                            Fermer
                        </button>
                    </div>
                {:else}
                    <button 
                        on:click={(e) => {
                            e.stopPropagation();
                            onEditButton(slide.id, button.id, {});
                        }}
                        class="text-blue-400 hover:text-blue-300 text-xs"
                    >
                        ✎ Éditer position/taille
                    </button>
                {/if}
            </div>
        {/each}
    </div>
</div>
