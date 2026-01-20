<script lang="ts">
    import { draggable } from '$lib/maheb/draggable';
    
    export let button: any;
    export let slideId: string | number;
    export let onNavigate: (id: string | number) => void;
    export let onUpdate: (slideId: string | number, buttonId: string, data: any) => void;
    export let colorClass: string;
    
    let hasDragged = false;
    
    const handleMouseDown = () => {
        hasDragged = false;
    };
    
    const handleMove = (x: number, y: number) => {
        hasDragged = true;
        onUpdate(slideId, button.id, { x, y });
    };
    
    const handleResize = (width: number, height: number) => {
        hasDragged = true;
        onUpdate(slideId, button.id, { width, height });
    };
    
    const handleClick = (e: MouseEvent) => {
        if (hasDragged) {
            e.preventDefault();
            e.stopPropagation();
            hasDragged = false;
            return;
        }
        onNavigate(button.destinationSlide);
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            handleClick(e as any);
        }
    };
</script>

<div
    use:draggable={{ onMove: handleMove, onResize: handleResize }}
    on:mousedown={handleMouseDown}
    role="button"
    tabindex="0"
    on:keydown={handleKeyDown}
    class="absolute text-white rounded-lg transition-colors text-sm font-medium {colorClass} cursor-move group"
    style="left: {button.x || 0}px; top: {button.y || 0}px; width: {button.width || 100}px; height: {button.height || 40}px; user-select: none;"
>
    <button 
        on:click={handleClick}
        class="w-full h-full rounded-lg flex items-center justify-center"
    >
        {button.label}
    </button>
    
    <!-- Resize handle -->
    <div class="resize-handle absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-bl cursor-se-resize opacity-0 group-hover:opacity-100"></div>
</div>
