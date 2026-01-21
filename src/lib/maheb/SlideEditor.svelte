<script lang="ts">
    import ButtonInput from './ButtonInput.svelte';

    export let slide: any;
    export let onNavigate: (id: number | string) => void;
    export let onDeleteSlide: (id: number | string) => void;
    export let onDeleteButton: (slideId: number | string, buttonId: string) => void;
    export let onEditButton: (slideId: number | string | null, buttonId: string | null, data: any) => void;
    export let editingButton: string | null;
    
    let isExpanded = true;
    
    const closeEditPanel = () => onEditButton(null, null, {});
    const handleEditClick = (id: string) => onEditButton(slide.id, id, {});
    const handleDeleteClick = (e: Event, id: string) => {
        e.stopPropagation();
        onDeleteButton(slide.id, id);
    };
    const handleDeleteSlide = (e: Event) => {
        e.stopPropagation();
        onDeleteSlide(slide.id);
    };
</script>

<div class="mb-3 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
    <div class="flex justify-between items-center mb-2">
        <button
            on:click={() => onNavigate(slide.id)}
            class="text-left flex-1 text-sm font-medium hover:underline"
        >
            ID: {slide.id} - {slide.label}
        </button>
        <button 
            on:click={handleDeleteSlide}
            class="text-red-400 hover:text-red-300 text-xs ml-2"
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
                        on:click={(e) => handleDeleteClick(e, button.id)}
                        class="text-red-400 hover:text-red-300"
                    >
                        ✕
                    </button>
                </div>
                {#if editingButton === button.id}
                    <div class="bg-gray-500 p-2 rounded text-xs space-y-1">
                        <div class="grid grid-cols-2 gap-1">
                            <ButtonInput 
                                label="X"
                                id="input-x-{button.id}"
                                value={button.x || 0}
                                onChange={(val) => onEditButton(slide.id, button.id, { x: val })}
                            />
                            <ButtonInput 
                                label="Y"
                                id="input-y-{button.id}"
                                value={button.y || 0}
                                onChange={(val) => onEditButton(slide.id, button.id, { y: val })}
                            />
                        </div>
                        <div class="grid grid-cols-2 gap-1">
                            <ButtonInput 
                                label="Largeur"
                                id="input-width-{button.id}"
                                value={button.width || 100}
                                onChange={(val) => onEditButton(slide.id, button.id, { width: val })}
                            />
                            <ButtonInput 
                                label="Hauteur"
                                id="input-height-{button.id}"
                                value={button.height || 40}
                                onChange={(val) => onEditButton(slide.id, button.id, { height: val })}
                            />
                        </div>
                        <button 
                            on:click={(e) => {
                                e.stopPropagation();
                                closeEditPanel();
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
                            handleEditClick(button.id);
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
