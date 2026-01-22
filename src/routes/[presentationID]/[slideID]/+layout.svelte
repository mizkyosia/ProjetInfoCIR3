<script lang="ts">
    import Export from "$lib/components/Export.svelte";

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
        { icon: "❓", label: "Quizz" },
        { icon: "🔘", label: "Buttons" },
        {
            icon: '<i class="fa fa-gear" aria-hidden="true"></i>',
            label: "Settings",
        },
    ];

    import { listImageURLs, getImageURL, saveImage } from "$lib/db/images";
    import Shape from "$lib/components/widgets/Shape.svelte";
    import { createPresentationElement } from "$lib/types/presentation";
    import { onMount } from "svelte";
    import { editorStore } from "$lib/state.svelte.js";
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

    let { children, data } = $props();

    const presentation = $state(data.presentation);

    editorStore.presentation = presentation;

    let openPanel = $state("");
    let zoom = $state(1);
    let pan = $state({ x: 0, y: 0 });
    let isSidebarOpen = $state(false);

    let boardElement: HTMLDivElement; // Reference to the board div

    let uploadedImages: Awaited<ReturnType<typeof listImageURLs>> = $state([]);
    listImageURLs().then((urls) => (uploadedImages = urls));

    onMount(() => {
        const unsubscribe = beforeNavigate(({ from, to, cancel }) => {
            // example: save presentation before navigating
            savePresentation(editorStore.presentation);
        });

        return unsubscribe; // optional cleanup
    });

    setInterval(() => {
        if (editorStore.currentSlide) {
            updateSlideThumbnail(editorStore.currentSlide.id, boardElement);
        }
    }, 10000); // every 30 seconds

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
    function toggleSidebar() {
        isSidebarOpen = !isSidebarOpen;
        if (!isSidebarOpen) {
            openPanel = "";
        }
    }

    async function onUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        const imageId = await saveImage(file);

        const url = (await getImageURL(imageId)) as string;

        uploadedImages.unshift({ url, id: imageId });
    }

    // Resize

    let fullscreenComponent: Fullscreen | undefined = $state();
    let isFull = $state(false);

    let showResizePopup = $state(false);

    function closeResizePopup() {
        showResizePopup = false;
    }

    // ✅ Resize state
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

        // capture du pointeur pour un drag fluide
        // e.currentTarget?.setPointerCapture?.(e.pointerId);

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
    let resizeBtnEl: HTMLElement | undefined = $state();
    let resizePopupEl: HTMLElement | undefined = $state();

    // Quizz form state
    let quizzForm = $state({
        question: "",
        answers: ["", ""],
        correctAnswerIndex: 0,
    });

    function addAnswer() {
        quizzForm.answers.push("");
    }

    function removeAnswer(index: number) {
        if (quizzForm.answers.length > 2) {
            quizzForm.answers.splice(index, 1);
            if (quizzForm.correctAnswerIndex >= quizzForm.answers.length) {
                quizzForm.correctAnswerIndex = quizzForm.answers.length - 1;
            }
        }
    }

    function submitQuizz() {
        const filledAnswers = quizzForm.answers.filter((a) => a.trim());
        if (!quizzForm.question.trim() || filledAnswers.length < 2) {
            alert("Please enter a question and at least 2 answers");
            return;
        }

        console.log("Quiz submitted:", {
            question: quizzForm.question,
            options: filledAnswers,
            correctAnswerIndex: quizzForm.correctAnswerIndex,
        });

        editorStore.updateSlide((s) =>
            s.elements.push(
                createPresentationElement("quizz", {
                    question: quizzForm.question,
                    options: filledAnswers,
                    correctAnswerIndex: quizzForm.correctAnswerIndex,
                }),
            ),
        );

        // Reset form
        quizzForm = {
            question: "",
            answers: ["", ""],
            correctAnswerIndex: 0,
        };
    }
</script>

<svelte:document
    onpointerdown={(e) => {
        if (!showResizePopup) return;

        // ✅ Si on clique sur le handle, on ne ferme PAS le popup
        const el = e.target;
        if (el instanceof Element && el.closest(".resize-handle")) {
            return;
        }

        const target = e.target;

        const clickedInsidePopup =
            resizePopupEl && resizePopupEl.contains(target as Node | null);
        const clickedOnButton =
            resizeBtnEl && resizeBtnEl.contains(target as Node | null);

        if (!clickedInsidePopup && !clickedOnButton) {
            showResizePopup = false;
        }
    }}
/>

<div class="flex h-screen w-full bg-gray-100 font-sans overflow-hidden">
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
                <label
                    for="file"
                    class="cursor-pointer bg-neutral-100 w-auto m-8 h-fit aspect-square border-2 border-dashed border-neutral-700 rounded-4xl flex items-center justify-center"
                >
                    <div
                        class="flex flex-col items-center content-center gap-1"
                    >
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
                                editorStore.updateSlide((slide) =>
                                    slide.elements.push(
                                        createPresentationElement("image", {
                                            assetId: img.id,
                                        }),
                                    ),
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
            {:else if openPanel == "Tabs"}
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
                                    editorStore.updateSlide((s) =>
                                        s.elements.push(
                                            createPresentationElement("table", {
                                                table: new Array(hoverRow).fill(
                                                    new Array(hoverCol),
                                                ),
                                                width: 70 * hoverCol,
                                                height: 40 * hoverRow,
                                            }),
                                        ),
                                    );
                                }}
                                aria-label="{r + 1}x{c + 1}"
                            ></button>
                        {/each}
                    {/each}
                </div>
            {:else if openPanel === "Quizz"}
                <div class="p-6 space-y-4">
                    <!-- Question input -->
                    <div>
                        <label
                            class="block text-sm font-semibold text-gray-700 mb-2"
                            >Question</label
                        >
                        <textarea
                            bind:value={quizzForm.question}
                            placeholder="Enter your question"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                            rows="3"
                        ></textarea>
                    </div>

                    <!-- Answers section -->
                    <div>
                        <span
                            class="block text-sm font-semibold text-gray-700 mb-3"
                            >Answers</span
                        >
                        <div class="space-y-2">
                            {#each quizzForm.answers as answer, index}
                                <div class="flex gap-2 items-center">
                                    <div class="flex-1">
                                        <input
                                            type="text"
                                            bind:value={
                                                quizzForm.answers[index]
                                            }
                                            placeholder={`Answer ${index + 1}`}
                                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <!-- Correct answer radio -->
                                    <label
                                        class="flex items-center gap-2 cursor-pointer"
                                    >
                                        <input
                                            type="radio"
                                            name="correctAnswer"
                                            value={index}
                                            bind:group={
                                                quizzForm.correctAnswerIndex
                                            }
                                            class="w-4 h-4 accent-purple-600"
                                        />
                                        <span class="text-xs text-gray-600"
                                            >Correct</span
                                        >
                                    </label>

                                    <!-- Remove button -->
                                    {#if quizzForm.answers.length > 2}
                                        <button
                                            onclick={() => removeAnswer(index)}
                                            class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove answer"
                                        >
                                            <i
                                                class="fa fa-trash"
                                                aria-hidden="true"
                                            ></i>
                                        </button>
                                    {/if}
                                </div>
                            {/each}
                        </div>

                        <!-- Add answer button -->
                        <button
                            onclick={addAnswer}
                            class="mt-3 w-full px-3 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-purple-500 hover:text-purple-600 transition-colors text-sm font-medium"
                        >
                            <i class="fa fa-plus" aria-hidden="true"></i> Add Answer
                        </button>
                    </div>

                    <!-- Submit button -->
                    <button
                        onclick={submitQuizz}
                        class="w-full px-4 py-2 bg-linear-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
                    >
                        <i class="fa fa-check" aria-hidden="true"></i> Add Quiz to
                        Slide
                    </button>
                </div>
            {:else if openPanel === "Shapes"}
                <Shape
                    mode="sidebar"
                    onSelect={(t) => {
                        editorStore.updateSlide((s) =>
                            s.elements.push(
                                createPresentationElement("shape", {
                                    shapeType: t,
                                    fillColor: "#aaaaff",
                                    borderColor: "#8888ff",
                                    borderThickness: 2,
                                }),
                            ),
                        );
                    }}
                    data={createPresentationElement("shape")}
                />
            {:else if openPanel == "Buttons"}
                <button
                    class="p-2 rounded-xl text-xl font-bold cursor-pointer"
                    onclick={() => {
                        editorStore.updateSlide((s) =>
                            s.elements.push(
                                createPresentationElement("button", {
                                    fillColor: "#aaaaff",
                                    borderColor: "#8888ff",
                                    borderThickness: 2,
                                }),
                            ),
                        );
                    }}
                >
                    Ajouter bouton
                </button>
            {:else if openPanel == "Text"}
                <button
                    class="p-2 rounded-xl text-xl font-bold cursor-pointer"
                    onclick={() => {
                        editorStore.updateSlide((s) =>
                            s.elements.push(createPresentationElement("text")),
                        );
                    }}
                >
                    Ajouter zone de texte
                </button>
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
                <button
                    onclick={() => (showResizePopup = true)}
                    class="font-semibold px-2 py-1 hover:bg-white/10 rounded cursor-pointer"
                    >Resize</button
                >
                <div class="h-4 w-px bg-white/30"></div>
                <span class="text-sm opacity-90"
                    >Sans nom {editorStore.currentSlide?.width}x{editorStore
                        .currentSlide?.height}
                </span>

                <button
                    class="bg-white/20 hover:bg-white/30 px-4 py-1 rounded-full text-sm font-medium transition-colors"
                    onclick={() => {
                        fullscreenComponent?.fsToggle();
                    }}
                >
                    <i class="fa fa-arrows-alt" aria-hidden="true"></i> Full screen
                </button>

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

            {#if showResizePopup}
                <!-- Overlay invisible pour fermer au clic extérieur -->
                <button
                    class="fixed inset-0 cursor-default"
                    style="background: transparent;"
                    onclick={closeResizePopup}
                    aria-label="Close resize popup"
                    type="button"
                ></button>

                <!-- Popup -->
                <div class="resize-popup" bind:this={resizePopupEl}>
                    <div class="resize-title">Whiteboard size</div>

                    <div class="resize-row">
                        <span class="label">Width</span>
                        <span class="value"
                            >{editorStore.currentSlide?.width}px</span
                        >
                    </div>

                    <div class="resize-row">
                        <span class="label">Height</span>
                        <span class="value"
                            >{editorStore.currentSlide?.height}px</span
                        >
                    </div>

                    <div class="resize-big">
                        {editorStore.currentSlide?.width} × {editorStore
                            .currentSlide?.height}
                    </div>

                    {#if resizing}
                        <div class="resize-hint">
                            Redimensionnement en cours…
                        </div>
                    {/if}
                </div>
            {/if}
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
            <Fullscreen bind:isFull bind:this={fullscreenComponent}>
                <Editor />

                <div
                    bind:this={boardElement}
                    role="region"
                    aria-label="main"
                    class="bg-white w-200 h-112.5 shadow-xl relative group origin-center will-change-transform"
                    style="transform: translate({pan.x}px, {pan.y}px) scale({zoom}); width:{editorStore
                        .currentSlide?.width}px; height:{editorStore
                        .currentSlide?.height}px;"
                >
                    {@render children()}
                    <!-- ✅ Handle resize (coin bas-droit) -->
                    {#if showResizePopup}
                        <div
                            class="resize-handle"
                            onpointerdown={startResize}
                            title="Redimensionner"
                        ></div>
                    {/if}
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
                    onclick={resetView}>⤢</button
                >
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
                            class="shrink-0"
                        >
                            {#if thumbnail}
                                <img
                                    class="block w-auto h-36 m-4 rounded-3xl border-2 border-violet-500"
                                    alt="Slide n°{i}"
                                    src={thumbnail}
                                />
                            {:else}
                                <div
                                    class="h-36 w-48 m-4 rounded-3xl border-2 border-violet-500 flex items-center justify-center"
                                >
                                    Slide n°{i}
                                </div>
                            {/if}
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
