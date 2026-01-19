<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font
awesome.min.css"> 
<script>
    // États de la toolbar
    let selectedFont = "Arial";
    let fontSize = 16;
    let textColor = "#000000";

    // Applique une commande simple (gras, italique, souligné…)
    /**
     * @param {string} cmd
     */
    function applyCommand(cmd, value = null) {
        // @ts-ignore
        document.execCommand(cmd, false, value);
    }

    // Police
    function applyFont() {
        document.execCommand("fontName", false, selectedFont);
    }

    // Taille (hack nécessaire car execCommand ne gère pas les px)
    function applySize() {
        document.execCommand("fontSize", false, "7");
        const elements = document.querySelectorAll("font[size='7']");
        elements.forEach(el => {
            el.removeAttribute("size");
            el.style.fontSize = `${fontSize}px`;
        });
    }

    // Couleur
    function applyColor() {
        document.execCommand("foreColor", false, textColor);
    }

    // Alignement
    function applyAlign(type) {
        document.execCommand("justify" + type);
    }
</script>

<!-- BARRE D’OUTILS -->
<div class="bg-white border-b border-gray-300 shadow-sm p-3 flex items-center space-x-4">

    <!-- Police -->
    <select bind:value={selectedFont} on:change={applyFont}
        class="border rounded px-2 py-1 text-sm">
        <option>Arial</option>
        <option>Times New Roman</option>
        <option>Courier New</option>
        <option>Comic Sans MS</option>
        <option>Verdana</option>
    </select>

    <!-- Taille -->
    <select bind:value={fontSize} on:change={applySize}
        class="border rounded px-2 py-1 text-sm w-20">
        <option value="12">12px</option>
        <option value="16">16px</option>
        <option value="20">20px</option>
        <option value="28">28px</option>
        <option value="36">36px</option>
    </select>

    <!-- Style -->
    <button on:click={() => applyCommand("bold")} class="px-2 py-1 border rounded">B</button>
    <button on:click={() => applyCommand("italic")} class="px-2 py-1 border rounded">I</button>
    <button on:click={() => applyCommand("underline")} class="px-2 py-1 border rounded">U</button>

    <!-- Alignement -->
    <button on:click={() => applyAlign("Left")} class="px-2 py-1 border rounded">←</button>
    <button on:click={() => applyAlign("Center")} class="px-2 py-1 border rounded">↔</button>
    <button on:click={() => applyAlign("Right")} class="px-2 py-1 border rounded">→</button>
    <button on:click={() => applyAlign("Full")} class="px-2 py-1 border rounded">≡</button>

    <!-- Couleur -->
    <input type="color" bind:value={textColor} on:input={applyColor}
        class="w-10 h-8 border rounded" />
</div>

<!-- ZONE ÉDITABLE -->
<div
    contenteditable="true"
    class="bg-gray-50 border border-gray-300 rounded p-4 mt-3 min-h-[200px]"
>
    Sélectionnez du texte et appliquez un style.
</div>