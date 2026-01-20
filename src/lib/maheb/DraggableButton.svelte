<script>
    import { draggable } from '$lib/maheb/draggable';
    
    export let button;
    export let slideId;
    export let onNavigate;
    export let onUpdate;
    export let colorClass;
    
    let hasDragged = false;
    
    function handleMouseDown() {
        hasDragged = false;
    }
    
    function handleMove(x, y) {
        hasDragged = true;
        onUpdate(slideId, button.id, { x, y });
    }
    
    function handleResize(width, height) {
        hasDragged = true;
        onUpdate(slideId, button.id, { width, height });
    }
    
    function handleClick(e) {
        if (hasDragged) {
            e.preventDefault();
            e.stopPropagation();
            hasDragged = false;
            return;
        }
        onNavigate(button.destinationSlide);
    }
</script>

<div
    use:draggable={{ onMove: handleMove, onResize: handleResize }}
    on:mousedown={handleMouseDown}
    class="absolute text-white rounded-lg transition-colors text-sm font-medium {colorClass} cursor-move group"
    style="
        left: {(button.x || 0)}px;
        top: {(button.y || 0)}px;
        width: {(button.width || 100)}px;
        height: {(button.height || 40)}px;
        user-select: none;
    "
>
    <button 
        on:click={handleClick}
        class="w-full h-full rounded-lg flex items-center justify-center"
    >
        {button.label}
    </button>
    
    <!-- Resize handle -->
    <div 
        class="resize-handle absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-bl cursor-se-resize opacity-0 group-hover:opacity-100"
        style="pointer-events: auto;"
    ></div>
</div>
