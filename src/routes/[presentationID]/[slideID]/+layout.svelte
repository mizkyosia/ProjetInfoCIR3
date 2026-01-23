<script lang="ts">
    import Export from "$lib/components/Export.svelte";
    import ExportSlideRenderer from "$lib/components/ExportSlideRenderer.svelte";
    import PhotoPanel from "$lib/components/panels/PhotoPanel.svelte";
    import ShapesPanel from "$lib/components/panels/ShapesPanel.svelte";
    import TextPanel from "$lib/components/panels/TextPanel.svelte";
    import TabsPanel from "$lib/components/panels/TabsPanel.svelte";
    import QuizzPanel from "$lib/components/panels/QuizzPanel.svelte";
    import ButtonsPanel from "$lib/components/panels/ButtonsPanel.svelte";
    import GraphPanel from "$lib/components/panels/GraphPanel.svelte";
    import SettingsPanel from "$lib/components/panels/SettingsPanel.svelte";

    // Placeholder data for the sidebar items
    const sidebarItems = [
        {
            icon: '<i class="fa fa-picture-o" aria-hidden="true"></i>',
            label: "Photo",
        },
        {
            icon: '<i class="fa fa-square" aria-hidden="true"></i>',
            label: "Shapes",
        },
        { icon: "T", label: "Text" },
        {
            icon: '<i class="fa fa-table" aria-hidden="true"></i>',
            label: "Tabs",
        },
        {
            icon: '<i class="fa fa-question" aria-hidden="true"></i>',
            label: "Quizz",
        },
        {
            icon: '<i class="fa fa-circle" aria-hidden="true"></i>',
            label: "Buttons",
        },
        {
            icon: '<i class="fa fa-bar-chart" aria-hidden="true"></i>',
            label: "Graph",
        },
        {
            icon: '<i class="fa fa-gear" aria-hidden="true"></i>',
            label: "Settings",
        },
    ];

    import { newSlide, savePresentation } from "$lib/db/presentations.svelte";
    import { beforeNavigate } from "$app/navigation";
    import Fullscreen from "$lib/components/Fullscreen.svelte";
    import {
        getSlideThumbnailURL,
        updateSlideThumbnail,
    } from "$lib/db/thumbnails.js";
    import Editor from "$lib/components/Editor.svelte";
    import { selectedElement } from "$lib/components/widgets/Base.svelte";
    import Icon from "@iconify/svelte";
    import { editorStore } from "$lib/state.svelte.js";

    let { children, data } = $props();

    const presentation = $state(data.presentation);

    editorStore.presentation = presentation;

    let openPanel = $state("");
    let zoom = $state(1);
    let pan = $state({ x: 0, y: 0 });
    let isSidebarOpen = $state(false);

    let boardElement: HTMLDivElement; // Reference to the board div

    let fullscreenComponent: Fullscreen | undefined = $state();

    // Store previous zoom/pan state for fullscreen toggle
    let previousZoom = $state(1);
    let previousPan = $state({ x: 0, y: 0 });

    import { onMount } from "svelte";

    onMount(() => {
        const unsubscribe = beforeNavigate(({ from, to, cancel }) => {
            savePresentation(editorStore.presentation);
        });

        return unsubscribe;
    });

    setInterval(() => {
        if (editorStore.currentSlide) {
            updateSlideThumbnail(editorStore.currentSlide.id, boardElement);
        }
    }, 10000);

    function handleWheel(event: WheelEvent) {
        event.preventDefault();

        if (event.shiftKey) {
            const delta = event.deltaX !== 0 ? event.deltaX : event.deltaY;
            pan.x -= delta;
        } else if (event.ctrlKey) {
            pan.y -= event.deltaY;
        } else {
            const rect = boardElement.getBoundingClientRect();
            const scaleFactor = 0.001;
            const delta = -event.deltaY * scaleFactor;
            const newZoom = Math.min(Math.max(zoom + delta, 0.2), 5);

            const scaleRatio = newZoom / zoom;
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const mouseX = event.clientX - centerX;
            const mouseY = event.clientY - centerY;

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
            openPanel = "";
        }
    }

    function handleFullscreenEnter() {
        previousZoom = zoom;
        previousPan = { ...pan };

        if (boardElement) {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            const slideWidth = editorStore.currentSlide?.width ?? 450;
            const slideHeight = editorStore.currentSlide?.height ?? 450;

            const zoomForWidth = (viewportWidth - 40) / slideWidth;
            const zoomForHeight = (viewportHeight - 40) / slideHeight;

            const newZoom = Math.min(zoomForWidth, zoomForHeight);

            zoom = Math.min(newZoom, 5);
            pan = { x: 0, y: 0 };
        }
    }

    function handleFullscreenExit() {
        zoom = previousZoom;
        pan = previousPan;
    }

    // Resize state
    let resizing = $state(false);
    let startX = $state(0);
    let startY = $state(0);
    let startW = $state(0);
    let startH = $state(0);

    const MIN_W = 200;
    const MIN_H = 120;

    function startResize(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();

        resizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startW = editorStore.currentSlide?.width ?? 450;
        startH = editorStore.currentSlide?.height ?? 450;

        window.addEventListener("pointermove", onResizeMove);
        window.addEventListener("pointerup", stopResize, { once: true });
    }

    function onResizeMove(e: MouseEvent) {
        if (!resizing || editorStore.currentSlide === null) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        editorStore.currentSlide.width = Math.max(
            MIN_W,
            Math.round(startW + dx),
        );
        editorStore.currentSlide.height = Math.max(
            MIN_H,
            Math.round(startH + dy),
        );
    }

    function stopResize() {
        resizing = false;
        window.removeEventListener("pointermove", onResizeMove);
    }
</script>

<div class="flex h-screen w-full bg-gray-100 font-sans overflow-hidden">
    <!-- Hidden export slide renderer -->
    <ExportSlideRenderer {presentation} />

    <!-- Burger Menu Button (Fixed/Absolute so it persists) -->

    <!-- Left Sidebar (Navigation) -->
    {#if isSidebarOpen}
        <button
            class="absolute hover:bg-gray-800 top-4 left-7 z-50 p-2 cursor-pointer text-2xl rounded transition-colors fa-times fa text-white"
            onclick={toggleSidebar}
            title="Toggle Menu"
        >
        </button>
        <aside
            class="w-20 bg-gray-900 text-white flex flex-col items-center py-4 shrink-0 pt-20"
        >
            <!-- Nav Items -->
            <nav class="flex-1 w-full space-y-2">
                {#each sidebarItems as item, i}
                    <button
                        onclick={() => (openPanel = item.label)}
                        class={`flex flex-col items-center justify-center w-full py-3 hover:bg-gray-800 transition-colors ${openPanel === item.label ? "bg-gray-800 border-l-4 border-cyan-400" : ""}`}
                    >
                        <span class="text-xl mb-1">{@html item.icon}</span>
                        <span class="text-xs font-medium">{item.label}</span>
                    </button>
                {/each}
            </nav>
        </aside>
    {/if}
    {#if openPanel != ""}
        <div
            class="w-80 bg-white h-full shadow-xl overflow-y-auto shrink-0 z-10 border-r border-gray-200"
        >
            {#if openPanel == "Photo"}
                <PhotoPanel />
            {:else if openPanel == "Tabs"}
                <TabsPanel />
            {:else if openPanel === "Quizz"}
                <QuizzPanel />
            {:else if openPanel === "Shapes"}
                <ShapesPanel />
            {:else if openPanel == "Buttons"}
                <ButtonsPanel {presentation} />
            {:else if openPanel == "Graph"}
                <GraphPanel />
            {:else if openPanel == "Text"}
                <TextPanel />
            {:else if openPanel == "Settings"}
                <SettingsPanel {presentation} />
            {/if}
        </div>
    {/if}

    <!-- Main Workspace (Canvas Area) -->
    <main class="flex-1 flex flex-col min-w-0 bg-gray-100 relative">
        <!-- Top Bar -->
        <header
            class="h-14 bg-linear-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between px-4 shadow-sm shrink-0"
        >
            <div class="flex items-center space-x-4">
                <!-- Burger Menu -->
                <button
                    class="p-1 mr-1 cursor-pointer rounded hover:bg-white/10 flex flex-col justify-center {isSidebarOpen
                        ? 'hidden'
                        : ''}"
                    onclick={toggleSidebar}
                    title="Toggle Menu"
                >
                    <div class="w-5 h-0.5 mb-1 bg-white/90"></div>
                    <div class="w-5 h-0.5 mb-1 bg-white/90"></div>
                    <div class="w-5 h-0.5 bg-white/90"></div>
                </button>

                <a
                    class="flex items-center gap-2 text-lg hover:bg-neutral-500/20"
                    href="/"
                >
                    <div
                        class="w-8 h-8 rounded-full bg-linear-to-tr from-blue-500 to-purple-600 shadow-2xl"
                    ></div>
                    <span class="text-xl font-bold tracking-tight"
                        >DesignFlow</span
                    >
                </a>

                <Export />
                <div class="h-4 w-px bg-white/30"></div>
                <input
                    type="text"
                    bind:value={presentation.title}
                    class="text-sm opacity-90 bg-transparent text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 rounded px-2 py-1 min-w-32"
                    placeholder="Untitled"
                />
                <span class="text-sm opacity-90"
                    >{editorStore.currentSlide?.width}x{editorStore.currentSlide
                        ?.height}
                </span>

                <a
                    href="/{presentation.id}"
                    class="group flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/20 transition-all duration-200 cursor-pointer"
                    title="Tooltip text"
                >
                    <Icon
                        icon="material-symbols:graph-1"
                        width="24"
                        height="24"
                    />
                </a>
            </div>
        </header>

        <!-- Canvas Container -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="flex-1 relative overflow-hidden flex items-center justify-center bg-gray-200 w-full h-full"
            onwheel={handleWheel}
            onpointerdown={() => {
                selectedElement?.();
            }}
        >
            <!-- The White Board / Page -->
            <Fullscreen
                bind:this={fullscreenComponent}
                onFullscreenEnter={handleFullscreenEnter}
                onFullscreenExit={handleFullscreenExit}
            >
                <Editor />

                <div
                    class="absolute"
                    style="transform: translate({pan.x}px, {pan.y}px) scale({zoom});"
                >
                    <div
                        bind:this={boardElement}
                        id="presentation"
                        role="region"
                        aria-label="main"
                        class="bg-white w-200 h-112.5 shadow-xl relative group origin-center will-change-transform"
                        style=" width:{editorStore.currentSlide
                            ?.width}px; height:{editorStore.currentSlide
                            ?.height}px;"
                    >
                        {@render children()}
                        <!-- ✅ Handle resize (coin bas-droit) -->
                        {#if editorStore.canResizeCanvas}
                            <div
                                class="resize-handle"
                                onpointerdown={startResize}
                                title="Redimensionner"
                            ></div>
                        {/if}
                    </div>
                </div>
            </Fullscreen>

            <!-- Footer / Zoom Controls -->
            <div
                class="absolute bottom-4 right-4 bg-white px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-4 text-gray-600 text-sm"
            >
                <div class="h-4 w-px bg-gray-300"></div>
                <div class="flex items-center space-x-2">
                    <button class="hover:text-black py-1 px-2" onclick={zoomOut}
                        >-</button
                    >
                    <span class="w-12 text-center"
                        >{Math.round(zoom * 100)}%</span
                    >
                    <button class="hover:text-black py-1 px-2" onclick={zoomIn}
                        >+</button
                    >
                </div>
                <div class="h-4 w-px bg-gray-300"></div>
                <button
                    class="cursor-pointer hover:bg-gray-100 p-1 rounded"
                    onclick={resetView}
                    title="Reset view"
                >
                    <Icon
                        icon="material-symbols:center-focus-strong"
                        width="20"
                        height="20"
                    />
                </button>
                <div class="h-4 w-px bg-gray-300"></div>
                <button
                    class="cursor-pointer hover:bg-gray-100 p-1 rounded"
                    onclick={() => {
                        fullscreenComponent?.fsToggle();
                    }}
                    title="Toggle fullscreen"
                >
                    <i class="fa fa-arrows-alt" aria-hidden="true"></i>
                </button>
            </div>
        </div>

        <footer
            class="bg-neutral-100 flex flex-row items-center px-4 shadow-sm shrink-0 overflow-scroll"
        >
            <div class="flex flex-row">
                {#each presentation.slides as slide, i}
                    {#await getSlideThumbnailURL(slide.id) then thumbnail}
                        <a
                            href="/{presentation.id}/{slide.id}"
                            class="shrink-0 relative"
                        >
                            {#if thumbnail}
                                <img
                                    class="block w-auto h-36 m-4 rounded-3xl border-2 {slide.id ===
                                    editorStore.currentSlide?.id
                                        ? 'border-indigo-500 border-4'
                                        : 'border-violet-500'}"
                                    alt="Slide n°{i}"
                                    src={thumbnail}
                                />
                            {:else}
                                <div
                                    class="h-36 w-48 m-4 rounded-3xl border-2 flex items-center justify-center {slide.id ===
                                    editorStore.currentSlide?.id
                                        ? 'border-indigo-500 border-4'
                                        : 'border-violet-500'}"
                                >
                                    Slide n°{i}
                                </div>
                            {/if}
                            <!-- Overlay with slide name -->
                            <div
                                class="absolute inset-x-4 bottom-4 rounded-b-3xl bg-gradient-to-t from-black/60 to-transparent px-3 py-2"
                            >
                                <p
                                    class="text-white/80 text-xs font-semibold truncate"
                                >
                                    {slide.name || `Slide ${i + 1}`}
                                </p>
                            </div>
                        </a>
                    {/await}
                {/each}
                <button
                    class="shrink-0 h-36 w-48 m-4 rounded-3xl border-violet-500 border-4 border-dashed flex items-center justify-center cursor-pointer"
                    onclick={() => {
                        presentation.slides.push(newSlide());
                    }}
                >
                    <Icon
                        icon="line-md:plus"
                        class="text-5xl text-violet-500"
                    />
                </button>
            </div>
        </footer>
    </main>
</div>

<style>
    /* Petit carré en bas à droite pour redimensionner */
    .resize-handle {
        position: absolute;
        right: -7px;
        bottom: -7px;
        width: 16px;
        height: 16px;
        background: white;
        border: 2px solid rgb(99, 102, 241); /* indigo-500 */
        border-radius: 4px;
        cursor: nwse-resize;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }

    .resize-handle:hover {
        transform: scale(1.05);
    }
    .resize-popup {
        position: absolute;
        top: 44px;
        left: 0;
        width: 220px;
        background: white;
        color: #111;
        border-radius: 12px;
        padding: 12px;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
        z-index: 60;
    }

    .resize-title {
        font-weight: 700;
        margin-bottom: 10px;
    }

    .resize-row {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        margin-bottom: 6px;
        color: #333;
    }

    .resize-row .value {
        font-weight: 600;
        color: #111;
    }

    .resize-big {
        margin-top: 10px;
        padding: 8px 10px;
        border-radius: 10px;
        background: #f3f4f6; /* gray-100 */
        font-weight: 800;
        text-align: center;
    }

    .resize-hint {
        margin-top: 8px;
        font-size: 12px;
        color: #4f46e5; /* indigo */
    }
</style>
