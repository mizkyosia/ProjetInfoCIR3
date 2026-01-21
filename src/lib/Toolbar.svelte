<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font
awesome.min.css"> 
<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    // États
    let selectedFont = "Arial";
    let fontSize = 16;
    let textColor = "#000000";

    const fonts = [
        'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana',
        'Georgia', 'Palatino', 'Garamond', 'Comic Sans MS', 'Trebuchet MS',
        'Arial Black', 'Impact'
    ];

    const fontSizes = [
        8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28,
        30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60
    ];

    function handleClosed() {
        dispatch("close");
    }

    /* ------------------------------
       LOGIQUE D'ÉDITION SUR SÉLECTION
       ------------------------------ */

    /**
     * @param {string} cmd
     */
    function applyCommand(cmd, value = null) {
        // @ts-ignore
        document.execCommand(cmd, false, value);
    }

    function applyFont() {
        document.execCommand("fontName", false, selectedFont);
    }

    function applySize() {
        document.execCommand("fontSize", false, "7");
        const elements = document.querySelectorAll("font[size='7']");
        elements.forEach(el => {
            el.removeAttribute("size");
            // @ts-ignore
            el.style.fontSize = `${fontSize}px`;
        });
    }

    function applyColor() {
        document.execCommand("foreColor", false, textColor);
    }

    /**
     * @param {string} type
     */
    function applyAlign(type) {
        document.execCommand("justify" + type);
    }
</script>

<!-- BARRE D’OUTILS -->
<div class="bg-white border-b border-gray-300 shadow-sm">
    <div class="flex items-center justify-between px-4 py-2">
        <div class="flex items-center space-x-4">

            <!-- Police -->
            <div class="flex flex-col">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="text-xs text-gray-600 mb-1">Police</label>
                <select
                    bind:value={selectedFont}
                    on:change={applyFont}
                    class="border border-gray-300 rounded px-2 py-1 text-sm w-40"
                >
                    {#each fonts as font}
                        <option value={font} style="font-family:{font}">{font}</option>
                    {/each}
                </select>
            </div>

            <!-- Taille -->
            <div class="flex flex-col">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="text-xs text-gray-600 mb-1">Taille</label>
                <select
                    bind:value={fontSize}
                    on:change={applySize}
                    class="border border-gray-300 rounded px-2 py-1 text-sm w-20"
                >
                    {#each fontSizes as size}
                        <option value={size}>{size}px</option>
                    {/each}
                </select>
            </div>

            <div class="h-8 w-[1px] bg-gray-300"></div>

            <!-- Style -->
            <div class="flex space-x-1">
                <!-- svelte-ignore a11y_consider_explicit_label -->
                <button on:click={() => applyCommand("bold")}
                    class="px-3 py-1 border rounded font-bold bg-white hover:bg-gray-50">
                   <i class="fa fa-bold" aria-hidden="true"></i>
                </button>

                <!-- svelte-ignore a11y_consider_explicit_label -->
                <button on:click={() => applyCommand("italic")}
                    class="px-3 py-1 border rounded italic bg-white hover:bg-gray-50">
                    <i class="fa fa-italic" aria-hidden="true"></i>
                </button>

                <!-- svelte-ignore a11y_consider_explicit_label -->
                <button on:click={() => applyCommand("underline")}
                    class="px-3 py-1 border rounded underline bg-white hover:bg-gray-50">
                    <i class="fa fa-underline" aria-hidden="true"></i>
                </button>
            </div>

            <div class="h-8 w-[1px] bg-gray-300"></div>

            <!-- Alignement -->
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <div class="flex space-x-1">
                <!-- svelte-ignore a11y_consider_explicit_label -->
                <button on:click={() => applyAlign("Left")}
                    class="px-3 py-1 border rounded bg-white hover:bg-gray-50">
                    <i class="fa fa-align-left"></i>
                </button>

                <!-- svelte-ignore a11y_consider_explicit_label -->
                <button on:click={() => applyAlign("Center")}
                    class="px-3 py-1 border rounded bg-white hover:bg-gray-50">
                    <i class="fa fa-align-center"></i>
                </button>

                <!-- svelte-ignore a11y_consider_explicit_label -->
                <button on:click={() => applyAlign("Right")}
                    class="px-3 py-1 border rounded bg-white hover:bg-gray-50">
                    <i class="fa fa-align-right"></i>
                </button>

                <button on:click={() => applyAlign("Full")}
                    class="px-3 py-1 border rounded bg-white hover:bg-gray-50">
                    <i class="fa fa-align-justify"></i>
                </button>
            </div>
            <div class="flex space-x-1">
                <button on:click={() => applyCommand("insertUnorderedList")} class="px-3 py-1 border rounded bg-white hover:bg-gray-50" title="Liste à puces"><i class="fa fa-list-ul"></i></button>
                <button on:click={() => applyCommand("insertOrderedList")} class="px-3 py-1 border rounded bg-white hover:bg-gray-50" title="Liste numérotée"><i class="fa fa-list-ol"></i></button>
            </div>
            <div class="h-8 w-[1px] bg-gray-300"></div>

            <!-- Couleur -->
            <div class="flex flex-col">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="text-xs text-gray-600 mb-1">Couleur</label>
                <input
                    type="color"
                    bind:value={textColor}
                    on:input={applyColor}
                    class="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
            </div>
        </div>

        <!-- Bouton fermer -->
        <button
            on:click={handleClosed}
            class="text-gray-500 hover:text-gray-700 text-xl px-2"
            title="Fermer"
        >
            <i class="fa fa-times"></i>
        </button>
    </div>

    <!-- ZONE ÉDITABLE -->
    <div class="px-4 pb-4">
        <div
            contenteditable="true"
            class="bg-gray-50 rounded p-3 border border-gray-200 min-h-[200px]"
        >
            Sélectionnez du texte et appliquez un style.
        </div>
    </div>
</div>