<script>
    // Placeholder data for the sidebar items
    const sidebarItems = [
        { icon: '<i class="fa fa-picture-o" aria-hidden="true"></i>', label: 'Photo' },
        { icon: '<i class="fa fa-square" aria-hidden="true"></i>', label: 'Forms' },
        { icon: 'T', label: 'Text' },
        { icon: '<i class="fa fa-table" aria-hidden="true"></i>', label: 'Tabs' },
        { icon: '❓', label: 'Quizz' },
        { icon: '📂', label: 'Projects' },
    ];

import Quizz from '$lib/Quizz.svelte';
let openPannel = $state("")
let canvasElements = $state([]);
let zoom = $state(1);
let pan = $state({ x: 0, y: 0 });
let boardElement; // Reference to the board div

function handleDrop(event) {
    event.preventDefault();
    const dataString = event.dataTransfer.getData('application/json');
    if (!dataString) return;
    
    try {
        const { type, data } = JSON.parse(dataString);
        if (type !== 'quizz') return;

        const canvasRect = event.currentTarget.getBoundingClientRect();
        // Adjust coordinates based on zoom level
        const x = (event.clientX - canvasRect.left) / zoom;
        const y = (event.clientY - canvasRect.top) / zoom;
        
        canvasElements = [...canvasElements, { id: Date.now(), type, data, x, y }];
    } catch (e) {
        console.error("Error parsing dropped data", e);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
}

function handleWheel(event) {
    event.preventDefault();

    if (event.shiftKey) {
        // Shift + Wheel -> Pan Horizontally
        // Use deltaY if deltaX is 0 (standard mouse wheel)
        const delta = event.deltaX !== 0 ? event.deltaX : event.deltaY;
        pan.x -= delta; 
    } else if (event.ctrlKey) {
        // Ctrl + Wheel -> Pan Vertically
        pan.y -= event.deltaY;
    } else {
        // No modifier -> Zoom
        const rect = boardElement.getBoundingClientRect();
        const scaleFactor = 0.001;
        const delta = -event.deltaY * scaleFactor;
        const newZoom = Math.min(Math.max(zoom + delta, 0.2), 5); // Limit zoom 20% to 500%
        
        // Calculate mouse position relative to the board's center
        const scaleRatio = newZoom / zoom;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const mouseX = event.clientX - centerX;
        const mouseY = event.clientY - centerY;
        
        // Adjust pan to keep the mouse point stable
        pan.x -= mouseX * (scaleRatio - 1);
        pan.y -= mouseY * (scaleRatio - 1);
        
        zoom = newZoom;
    }
}

function zoomIn() {
    zoom = Math.min(zoom + 0.1, 5);
}

function zoomOut() {
    zoom = Math.max(zoom - 0.1, 0.2);
}

function resetView() {
    zoom = 1;
    pan = { x: 0, y: 0 };
}
</script>



<div class="flex h-screen w-full bg-gray-100 font-sans overflow-hidden">
    
    <!-- Left Sidebar (Navigation) -->
    <aside class="w-20 bg-gray-900 text-white flex flex-col items-center py-4 shrink-0">
        <!-- Burger Menu / Logo placeholder -->
        <div class="mb-6 p-2 cursor-pointer hover:bg-gray-800 rounded">
            <div class="w-6 h-0.5 bg-white mb-1"></div>
            <div class="w-6 h-0.5 bg-white mb-1"></div>
            <div class="w-6 h-0.5 bg-white"></div>
        </div>

        <!-- Nav Items -->
        <nav class="flex-1 w-full space-y-2">
            {#each sidebarItems as item, i}
                <button onclick={() => openPannel = item.label} class={`flex flex-col items-center justify-center w-full py-3 hover:bg-gray-800 transition-colors ${openPannel === item.label ? 'bg-gray-800 border-l-4 border-cyan-400' : ''}`}>
                    <span class="text-xl mb-1">{@html item.icon}</span>
                    <span class="text-xs font-medium">{item.label}</span>
                </button>
            {/each}
        </nav>
    </aside>
    {#if openPannel === "Quizz"}
        <div class="w-80 bg-white h-full shadow-xl overflow-y-auto shrink-0 z-10 border-r border-gray-200">
            <Quizz mode="edit" />
        </div>
    {/if}


    <!-- Main Workspace (Canvas Area) -->
    <main class="flex-1 flex flex-col min-w-0 bg-gray-100 relative">
        
        <!-- Top Bar -->
        <header class="h-14 bg-linear-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between px-4 shadow-sm shrink-0">
            <div class="flex items-center space-x-4">
                <span class="font-semibold px-2 py-1 hover:bg-white/10 rounded cursor-pointer">File</span>
                <span class="font-semibold px-2 py-1 hover:bg-white/10 rounded cursor-pointer">Resize</span>
                <div class="h-4 w-px bg-white/30"></div>
                <span class="text-sm opacity-90">Sans nom  1920x1080 </span>
            </div>
        </header>

        <!-- Canvas Container -->
        <div class="flex-1 relative overflow-hidden flex items-center justify-center bg-gray-200 w-full h-full" onwheel={handleWheel}>
            
            <!-- The White Board / Page -->
            <div 
                bind:this={boardElement}
                role="region" 
                aria-label="main" 
                class="bg-white w-200 h-112.5 shadow-xl relative group overflow-hidden origin-center will-change-transform" 
                style="transform: translate({pan.x}px, {pan.y}px) scale({zoom})"
                ondrop={handleDrop} 
                ondragover={handleDragOver} 
            >
                <!-- Dropped Elements -->
                {#each canvasElements as element (element.id)}
                    {#if element.type === 'quizz'}
                         <div 
                            style="position: absolute; left: {element.x}px; top: {element.y}px;"
                            class="w-96"
                         >
                            <Quizz 
                                mode="play"
                                question={element.data.question} 
                                options={element.data.options} 
                                correctAnswerIndex={element.data.correctAnswerIndex} 
                            />
                         </div>
                    {/if}
                {/each}
            </div>

            <!-- Footer / Zoom Controls -->
            <div class="absolute bottom-4 right-4 bg-white px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-4 text-gray-600 text-sm">
                <div class="h-4 w-px bg-gray-300"></div>
                <div class="flex items-center space-x-2">
                        <button class="hover:text-black py-1 px-2" onclick={zoomOut}>-</button>
                        <span class="w-12 text-center">{Math.round(zoom * 100)}%</span>
                        <button class="hover:text-black py-1 px-2" onclick={zoomIn}>+</button>
                </div>
                <div class="h-4 w-px bg-gray-300"></div>
                <button class="cursor-pointer hover:bg-gray-100 p-1 rounded" onclick={resetView}>⤢</button>
            </div>

        </div>
    </main>
</div>