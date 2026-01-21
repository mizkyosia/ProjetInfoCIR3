<script>
    // Placeholder data for the sidebar items
    const sidebarItems = [
        { icon: 'T', label: 'Text' },
        { icon: '<i class="fa fa-picture-o" aria-hidden="true"></i>', label: 'Photo' },
        { icon: '<i class="fa fa-square" aria-hidden="true"></i>', label: 'Forms' },
        { icon: '<i class="fa fa-table" aria-hidden="true"></i>', label: 'Tabs' },
        { icon: '<i class="fa fa-bar-chart" aria-hidden="true"></i>', label: 'Charts' },
        { icon: '❓', label: 'Quizz' },
        { icon: '📂', label: 'Projects' },
        { icon: `<img src="${treeStructureImg}" alt="Structure" class="w-6 h-6 object-contain" />`, label: 'Structure' },
        
    ];
import Quizz, { createQuizzFromData } from '$lib/Quizz.svelte';
import Forms, { createShape } from '$lib/Forms.svelte';
import Text from '$lib/Zonedt.svelte';
import Toolbar from '$lib/Toolbar.svelte';
import Fullscreen from '$lib/Fullscreen.svelte';
import Resize from '$lib/Resize.svelte';
import Arbo from '$lib/Arbo.svelte';
import Charts from '$lib/Charts1.svelte';
import treeStructureImg from '../../tree-structure.png';


let projectTitle = $state("Sans nom");
let projectResolution = $state("1920x1080");
 

let isSidebarOpen = $state(true);
let openPannel = $state("")
    /**
     * @type {any[] | null | undefined}
     */
let canvasElements = $state([]);
let zoom = $state(1);
let pan = $state({ x: 0, y: 0 });
    /**
     * @type {HTMLDivElement}
     */
let boardElement; // Reference to the board div
let fullscreenComponent;
let isFull = $state(false);

// ✅ Taille "réelle" de la white board (modifiable)
let boardWidth = $state(800);
let boardHeight = $state(450);
let boardColor = $state("#ffffff");
let showResizePopup = $state(false);

// Sidebar Resizing
let sidebarWidth = $state(320); // Default width (w-80)
let isResizingSidebar = $state(false);

function startResizeSidebar(event) {
    isResizingSidebar = true;
    event.preventDefault(); // Prevent text selection
}

function stopResizeSidebar() {
    isResizingSidebar = false;
}

function resizeSidebar(event) {
    if (!isResizingSidebar) return;
    
    // Sidebar width = mouse X position - Nav Bar width (w-20 = 80px)
    const newWidth = event.clientX - 80;
    
    // Constraints
    if (newWidth >= 200 && newWidth <= 800) {
        sidebarWidth = newWidth;
    }
}

let previousZoom = 1;
let previousPan = { x: 0, y: 0 };
let wasFull = false;

$effect(() => {
    if (isFull) {
        if (!wasFull) {
             // Just entered fullscreen: save state
            previousZoom = zoom;
            previousPan = { ...pan };
            wasFull = true;
        }

        // Simple "contain" logic for Presentation Mode
        const padding = 20;
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        
        const scaleX = (screenW - padding) / boardWidth;
        const scaleY = (screenH - padding) / boardHeight;
        // Don't upscale indefinitely if board is tiny? Or yes? Projector mode implies filling screen.
        // Let's cap at 5x.
        const fitScale = Math.min(scaleX, scaleY, 5);
        
        zoom = fitScale;
        pan = { x: 0, y: 0 };
    } else {
        if (wasFull) {
            // Just exited fullscreen: restore state
            zoom = previousZoom;
            pan = previousPan;
            wasFull = false;
        }
    }
});

// Drawing State
let drawingTool = $state(null); // 'rectangle' | 'circle' | etc.
let isDrawing = $state(false);
let startPoint = $state({ x: 0, y: 0 });
let currentShapeId = $state(null);

function handleSelectShape(type) {
    drawingTool = type;
    // Optional: cursor feedback
}

function handleMouseDown(event) {
    if (!drawingTool) return;
    if (event.button !== 0) return; // Only left click

    isDrawing = true;
    const rect = boardElement.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;
    startPoint = { x, y };

    // Create initial shape
    const newShapeData = createShape(drawingTool);

    const newId = Date.now();
    currentShapeId = newId;
    canvasElements = [...canvasElements, { id: newId, type: 'shape', data: newShapeData, x, y }];
}

function handleMouseMove(event) {
    if (!isDrawing || !currentShapeId) return;

    const rect = boardElement.getBoundingClientRect();
    const currentX = (event.clientX - rect.left) / zoom;
    const currentY = (event.clientY - rect.top) / zoom;

    const width = currentX - startPoint.x;
    const height = currentY - startPoint.y;

    // find and update the shape
    const index = canvasElements.findIndex(el => el.id === currentShapeId);
    if (index !== -1) {
        const el = canvasElements[index];
        // Normalize negative width/height (dragging left/up)
        const finalX = width < 0 ? currentX : startPoint.x;
        const finalY = height < 0 ? currentY : startPoint.y;
        const finalW = Math.abs(width);
        const finalH = Math.abs(height);

        canvasElements[index] = { ...el, x: finalX, y: finalY, data: { ...el.data, width: Math.max(10, finalW), height: Math.max(10, finalH) } };
    }
}

function handleMouseUp(event) {
    if (isDrawing) {
        isDrawing = false;
        currentShapeId = null;
        drawingTool = null; // Reset tool after drawing one shape, or keep it if continuous drawing desired
        openPannel = ""; // Close panel or keep open? User preference. Closing implies "tool used once".
    }
}

function handleDrop(event) {
    event.preventDefault();
    const dataString = event.dataTransfer.getData('application/json');
    if (!dataString) return;
    
    try {
        const { type, data } = JSON.parse(dataString);
        
        let finalData = data;
        // Validate/Normalize data based on type
        if (type === 'quizz') {
             finalData = createQuizzFromData(data);
        } else if (type !== 'quizz') {
             // Unknown type (Forms usage is different, handled by drawing)
             return;
        }

        const canvasRect = event.currentTarget.getBoundingClientRect();
        // Adjust coordinates based on zoom level
        const x = (event.clientX - canvasRect.left) / zoom;
        const y = (event.clientY - canvasRect.top) / zoom;
        
        canvasElements = [...canvasElements, { id: Date.now(), type, data: finalData, x, y }];
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

function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
    if (!isSidebarOpen) {
        openPannel = "";
    }
}
</script>

<svelte:window onmousemove={resizeSidebar} onmouseup={stopResizeSidebar} />

<div class="flex h-screen w-full bg-gray-100 font-sans overflow-hidden relative">
    
    <!-- Left Sidebar (Navigation) -->
    {#if isSidebarOpen}
        <aside class="w-20 bg-gray-900 text-white flex flex-col items-center py-4 shrink-0 pt-20">
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
    {/if}
    {#if openPannel === "Text"}
        <div class="w-250 bg-white h-full shadow-xl overflow-y-auto shrink-0 z-10 border-r border-gray-200">
            <Toolbar />
        </div>
    {:else if openPannel === "Quizz"}
        <div class="w-80 bg-white h-full shadow-xl overflow-y-auto shrink-0 z-10 border-r border-gray-200">
            <Quizz mode="edit" />
        </div>
    {:else if openPannel === "Forms"}
        <div class="w-80 bg-white h-full shadow-xl overflow-y-auto shrink-0 z-10 border-r border-gray-200">
            <Forms mode="sidebar" onSelect={handleSelectShape} />
        </div>
    {:else if openPannel === "Structure"}
        <div class="bg-white h-full shadow-xl overflow-y-auto shrink-0 z-10 border-r border-gray-200 relative" style="width: {sidebarWidth}px;">
            <Arbo />
            <div>
                class="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-blue-400 z-50 transition-colors"
                onmousedown={startResizeSidebar}
            </div>
        </div>
    {:else if openPannel === "Charts"}
        <div class="w-300 bg-white h-full shadow-xl overflow-y-auto shrink-0 z-10 border-r border-gray-200">
             <Charts />
        </div>
        
    {/if}
    
    <!-- Main Workspace (Canvas Area) -->
    <main class="flex-1 flex flex-col min-w-0 bg-gray-100 relative">
        
        <!-- Top Bar -->
        <header class="h-14 bg-linear-to-r from-red-600 to-indigo-600 text-white flex items-center justify-between px-4 shadow-sm shrink-0">
            <div class="flex items-center space-x-4">
                <!-- Burger Menu -->
                <button 
                    class="p-1 mr-1 cursor-pointer rounded hover:bg-white/10 flex flex-col justify-center"
                    onclick={toggleSidebar}
                    title="Toggle Menu"
                >
                    <div class="w-5 h-0.5 mb-1 bg-white/90"></div>
                    <div class="w-5 h-0.5 mb-1 bg-white/90"></div>
                    <div class="w-5 h-0.5 bg-white/90"></div>
                </button>

                <span class="font-semibold px-2 py-1 hover:bg-white/10 rounded cursor-pointer">File</span>
                
                <!-- Resize Button & Popup -->
                 <Resize 
                    bind:width={boardWidth} 
                    bind:height={boardHeight} 
                    bind:color={boardColor}
                    bind:visible={showResizePopup} 
                    type="menu" 
                 />

                <div class="h-4 w-px bg-white/30"></div>

                <div class="flex items-center text-sm opacity-90">
                    <input bind:value={projectTitle} class="bg-transparent border-none hover:bg-white/10 focus:bg-white/20 focus:outline-none rounded px-1 transition-colors w-auto" style="width: {projectTitle.length + 1}ch" />
                    <span class="ml-2">{projectResolution}</span>
                </div>
            </div>
            <button 
                class="bg-white/20 hover:bg-white/30 px-4 py-1 rounded-full text-sm font-medium transition-colors"
                onclick={() => fullscreenComponent?.fsToggle()}
            >
                <i class="fa fa-arrows-alt" aria-hidden="true"></i> Full screen
            </button>
        </header>

        <!-- Canvas Container -->
        <div class="flex-1 relative overflow-hidden flex items-center justify-center bg-gray-200 w-full h-full" onwheel={handleWheel}>
            
            <!-- The White Board / Page -->
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
             <Fullscreen bind:isFull={isFull} bind:this={fullscreenComponent}>
            <div 
                bind:this={boardElement}
                role="region" 
                aria-label="main" 
                class="bg-white shadow-xl relative group overflow-hidden origin-center will-change-transform cursor-crosshair fs"
                style="transform: translate({pan.x}px, {pan.y}px) scale({zoom}); width:{boardWidth}px; height:{boardHeight}px; background-color:{boardColor};"
                ondrop={handleDrop} 
                ondragover={handleDragOver}
                onmousedown={handleMouseDown}
                onmousemove={handleMouseMove}
                onmouseup={handleMouseUp}
            >
                <Resize 
                    bind:width={boardWidth} 
                    bind:height={boardHeight} 
                    bind:visible={showResizePopup}
                    type="handle"
                    zoom={zoom}
                />

                <!-- Dropped Elements -->
                {#each canvasElements as element (element.id)}
                
                    {#if element.type === 'quizz'}
                         <div 
                            style="position: absolute; left: {element.x}px; top: {element.y}px;"
                            class="w-96"
                         >
                            <Quizz 
                                mode="play"
                                data={element.data}
                            />
                         </div>
                    {:else if element.type === 'shape'}
                         <div 
                            style="position: absolute; left: {element.x}px; top: {element.y}px; width: {element.data.width}px; height: {element.data.height}px;"
                         >
                            <Forms mode="canvas" bind:data={element.data} />
                         </div>
                    {/if}
                {/each}
            </div>
            </Fullscreen>

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