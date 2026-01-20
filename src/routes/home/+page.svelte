<script lang="ts">
    import Export from "$lib/components/Export.svelte";
    import Base from "$lib/components/widgets/Base.svelte";
    import Image from "$lib/components/widgets/Image.svelte";

    // Placeholder data for the sidebar items
    const sidebarItems = [
        {
            icon: '<i class="fa fa-picture-o" aria-hidden="true"></i>',
            label: "Photo",
        },
        {
            icon: '<i class="fa fa-square" aria-hidden="true"></i>',
            label: "Forms",
        },
        { icon: "T", label: "Text" },
        {
            icon: '<i class="fa fa-table" aria-hidden="true"></i>',
            label: "Tabs",
        },
        { icon: "❓", label: "Quizz" },
        { icon: "📂", label: "Projects" },
    ];

    import Quizz from "$lib/components/widgets/Quizz.svelte";
    import Table from "$lib/components/widgets/Table.svelte";
    import { listImageURLs, getImageURL, saveImage } from "$lib/db/images";
    import {
        createPresentationElement,
        type Element,
        type QuizzElement,
    } from "$lib/types/presentation";
    import { onMount } from "svelte";
    let openPanel = $state("");
    let canvasElements: Element[] = $state([]);
    let zoom = $state(1);
    let pan = $state({ x: 0, y: 0 });
    let boardElement: HTMLDivElement; // Reference to the board div

    let uploadedImages: Awaited<ReturnType<typeof listImageURLs>> = $state([]);

    onMount(async () => {
        uploadedImages = await listImageURLs();
    });

    // --- Gestion du sélecteur ---
    let hoverRow = $state(0),
        hoverCol = $state(0);

    function handleWheel(event: WheelEvent) {
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

    async function onUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        const imageId = await saveImage(file);
        console.log("Saved image with ID:", imageId);

        const url = (await getImageURL(imageId)) as string;

        canvasElements.unshift(
            createPresentationElement("image", { assetId: imageId }),
        );
        uploadedImages.push({ url, id: imageId });
    }
</script>

<div class="flex h-screen w-full bg-gray-100 font-sans overflow-hidden">
    <!-- Left Sidebar (Navigation) -->
    <aside
        class="w-20 bg-gray-900 text-white flex flex-col items-center py-4 shrink-0"
    >
        <!-- Burger Menu / Logo placeholder -->
        <div class="mb-6 p-2 cursor-pointer hover:bg-gray-800 rounded">
            <div class="w-6 h-0.5 bg-white mb-1"></div>
            <div class="w-6 h-0.5 bg-white mb-1"></div>
            <div class="w-6 h-0.5 bg-white"></div>
        </div>

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
    {#if openPanel == "Photo"}
        <div
            class="w-80 bg-white h-full shadow-xl overflow-y-auto shrink-0 z-10 border-r border-gray-200"
        >
            <label
                for="file"
                class="cursor-pointer bg-neutral-100 w-auto m-8 h-fit aspect-square border-2 border-dashed border-neutral-700 rounded-4xl flex items-center justify-center"
            >
                <div class="flex flex-col items-center content-center gap-1">
                    <svg viewBox="0 0 640 512" class="h-12 mb-5">
                        <path
                            d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"
                        ></path>
                    </svg>
                    <p>Drag and Drop</p>
                    <p>or</p>
                    <span
                        class="bg-linear-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-left hover:bg-right px-4 py-1 rounded-xl text-neutral-50 transition-all"
                        >Browse file</span
                    >
                </div>
                <input
                    class="hidden"
                    id="file"
                    type="file"
                    onchange={onUpload}
                />
            </label>
            <hr class="mx-5 border rounded-full border-neutral-700" />

            <div class="flex flex-wrap items-center">
                {#each uploadedImages as img (img.id)}
                    <button
                        onclick={() => {
                            canvasElements.push(
                                createPresentationElement("image", {
                                    assetId: img.id,
                                }),
                            );
                        }}
                    >
                        <img
                            src={img.url}
                            class="h-26 shadow m-2 hover:shadow-lg transition-all cursor-pointer rounded-2xl border border-neu"
                            alt="Uploaded"
                        />
                    </button>
                {/each}
            </div>
        </div>
    {:else if openPanel == "Tabs"}
        <div
            class="w-80 bg-white h-full shadow-xl overflow-y-auto shrink-0 z-10 border-r border-gray-200"
        >
            Tableaux
            <div
                class="mb-2 text-xs text-gray-500 font-semibold text-center uppercase tracking-wider"
            >
                {hoverCol > 0
                    ? `${hoverCol} x ${hoverRow}`
                    : "Insérer un tableau"}
            </div>

            <div
                class="grid grid-cols-10 gap-1 outline-none"
                onmouseleave={() => {
                    hoverRow = 0;
                    hoverCol = 0;
                }}
                role="grid"
                tabindex="-1"
            >
                {#each Array(10) as _, r}
                    {#each Array(10) as _, c}
                        <button
                            type="button"
                            class="w-5 h-5 border rounded-sm transition-colors duration-75 block p-0
                {r + 1 <= hoverRow && c + 1 <= hoverCol
                                ? 'bg-orange-500 border-orange-600 shadow-sm'
                                : 'bg-white border-gray-200 hover:border-blue-400'}"
                            onmouseenter={() => {
                                hoverRow = r + 1;
                                hoverCol = c + 1;
                            }}
                            onclick={() => {
                                canvasElements.push(
                                    createPresentationElement("table", {
                                        table: new Array(hoverRow).fill(
                                            new Array(hoverCol),
                                        ),
                                    }),
                                );
                            }}
                            aria-label="{r + 1}x{c + 1}"
                        ></button>
                    {/each}
                {/each}
            </div>
        </div>
    {:else if openPanel === "Quizz"}
        <div
            class="w-80 bg-white h-full shadow-xl overflow-y-auto shrink-0 z-10 border-r border-gray-200"
        >
            <button
                onclick={() => {
                    canvasElements.push(createPresentationElement("quizz"));
                }}>Ajouter quizz</button
            >
        </div>
    {/if}

    <!-- Main Workspace (Canvas Area) -->
    <main class="flex-1 flex flex-col min-w-0 bg-gray-100 relative">
        <!-- Top Bar -->
        <header
            class="h-14 bg-linear-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between px-4 shadow-sm shrink-0"
        >
            <div class="flex items-center space-x-4">
                <Export />
                <span
                    class="font-semibold px-2 py-1 hover:bg-white/10 rounded cursor-pointer"
                    >Resize</span
                >
                <div class="h-4 w-px bg-white/30"></div>
                <span class="text-sm opacity-90">Sans nom 1920x1080 </span>
            </div>
        </header>

        <!-- Canvas Container -->
        <div
            class="flex-1 relative overflow-hidden flex items-center justify-center bg-gray-200 w-full h-full"
            onwheel={handleWheel}
        >
            <!-- The White Board / Page -->
            <div
                bind:this={boardElement}
                role="region"
                aria-label="main"
                class="bg-white w-200 h-112.5 shadow-xl relative group overflow-hidden origin-center will-change-transform"
                style="transform: translate({pan.x}px, {pan.y}px) scale({zoom})"
            >
                <!-- Dropped Elements -->
                {#each canvasElements as element (element.id)}
                    {#if element.type === "image"}
                        <Image {...element} />
                    {:else if element.type === "table"}
                        <Table {...element} />
                    {:else if element.type === "quizz"}
                        <Quizz mode="view" {...element} />
                    {/if}
                {/each}
            </div>

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
                    onclick={resetView}>⤢</button
                >
            </div>
        </div>
    </main>
</div>
