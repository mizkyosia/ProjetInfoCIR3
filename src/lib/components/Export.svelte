<script lang="ts">
    import html2canvas from "html2canvas";
    import { editorStore } from "$lib/state.svelte";
    import { exportPresentationToPDF } from "$lib/utils/exportPDF";
    import { exportPresentationToHTML } from "$lib/utils/exportHTML";

    let showShareMenu = $state(false);
    let isExporting = $state(false);
    let exportProgress = $state({ current: 0, total: 0 });

    function toggleShareMenu() {
        showShareMenu = !showShareMenu;
    }

    function toHSL(value: string) {
        // Convertit n'importe quelle couleur CSS (oklch, hsl, rgb, etc.) en hsl via le navigateur
        const tmp = document.createElement("div");
        tmp.style.color = value;
        document.body.appendChild(tmp);
        const hsl = getComputedStyle(tmp).color;
        document.body.removeChild(tmp);

        // Convertir en HSL si ce n'est pas déjà
        if (hsl.includes("hsl")) {
            return hsl;
        }

        // Si c'est rgb/rgba, convertir en hsl
        const rgb = hsl.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
            const r = parseInt(rgb[0]) / 255;
            const g = parseInt(rgb[1]) / 255;
            const b = parseInt(rgb[2]) / 255;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h = 0,
                s = 0,
                l = (max + min) / 2;

            if (max === min) {
                h = s = 0;
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    case b:
                        h = (r - g) / d + 4;
                        break;
                }
                h /= 6;
            }

            return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
        }

        return hsl;
    }

    async function exportPDF() {
        try {
            console.log("Starting PDF export...");
            const { jsPDF } = await import("jspdf");
            const element = document.getElementById("presentation");

            if (!element) {
                console.error("Presentation element not found");
                alert("Élément de présentation non trouvé");
                return;
            }

            // Cloner l'élément
            const clonedElement = element.cloneNode(true) as HTMLElement;
            clonedElement.style.position = "absolute";
            clonedElement.style.left = "-9999px";
            clonedElement.style.top = "-9999px";
            clonedElement.style.backgroundColor = "#ffffff";

            // Convertir toutes les couleurs oklch en hsl
            const allElements = clonedElement.querySelectorAll("*");
            const origElements = element.querySelectorAll("*");

            const colorProps = [
                "color",
                "backgroundColor",
                "borderTopColor",
                "borderRightColor",
                "borderBottomColor",
                "borderLeftColor",
                "outlineColor",
                "textDecorationColor",
            ];

            for (let i = 0; i < allElements.length; i++) {
                const cs = getComputedStyle(origElements[i]);

                for (const prop of colorProps) {
                    const v = cs.getPropertyValue(prop);
                    if (v && v.includes("oklch")) {
                        (allElements[i] as HTMLElement).style.setProperty(prop, toHSL(v));
                    }
                }
            }

            document.body.appendChild(clonedElement);

            console.log("Converting to canvas...");
            const canvas = await html2canvas(clonedElement, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                backgroundColor: "#ffffff",
                imageTimeout: 0,
            });

            // Supprimer le clone
            document.body.removeChild(clonedElement);

            console.log("Canvas created, converting to image...");
            const imgData = canvas.toDataURL("image/png");

            console.log("Creating PDF...");
            const pdf = new jsPDF("landscape", "px", [
                canvas.width,
                canvas.height,
            ]);

            pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
            pdf.save("presentation.pdf");

            console.log("PDF saved successfully");
            showShareMenu = false;
        } catch (error) {
            console.error("Erreur lors de l'export PDF:", error);
            alert("Erreur: " + (error instanceof Error ? error.message : String(error)));
        }
    }
    function exportHTML() {
        try {
            if (!editorStore.presentation) {
                alert("No presentation loaded");
                return;
            }

            exportPresentationToHTML(editorStore.presentation).then(() => {
                showShareMenu = false;
            });
        } catch (error) {
            console.error("Error exporting HTML:", error);
            alert("Error exporting HTML: " + (error instanceof Error ? error.message : String(error)));
        }
    }

    function sendLink() {
        console.log("Sending link...");
        showShareMenu = false;
    }

    async function exportAllSlidesPDF() {
        try {
            if (!editorStore.presentation) {
                alert("No presentation loaded");
                return;
            }

            isExporting = true;
            exportProgress = { current: 0, total: editorStore.presentation.slides.length };

            await exportPresentationToPDF(editorStore.presentation, {
                quality: "high",
                onProgress: (current, total) => {
                    exportProgress = { current, total };
                },
            });

            showShareMenu = false;
        } catch (error) {
            console.error("Error exporting presentation:", error);
            alert("Error exporting presentation: " + (error instanceof Error ? error.message : String(error)));
        } finally {
            isExporting = false;
            exportProgress = { current: 0, total: 0 };
        }
    }
</script>

<div class="relative">
    <button
        onclick={toggleShareMenu}
        class="font-semibold px-2 py-1 hover:bg-white/10 rounded cursor-pointer text-white"
    >
        File
    </button>

    {#if showShareMenu}
        <div
            class="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 border border-gray-200"
        >
            {#if isExporting}
                <div class="px-4 py-4 text-black text-sm">
                    <div class="mb-2">
                        Exporting slides: {exportProgress.current} / {exportProgress.total}
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div
                            class="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style="width: {exportProgress.total > 0
                                ? (exportProgress.current / exportProgress.total) * 100
                                : 0}%"
                        ></div>
                    </div>
                </div>
            {:else}
                <button
                    onclick={exportAllSlidesPDF}
                    class="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-2 first:rounded-t-lg border-b border-gray-100 text-black font-semibold text-sm"
                >
                    <span>📑</span>
                    <span>Export All Slides as PDF</span>
                </button>
                <button
                    onclick={exportPDF}
                    class="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-2 border-b border-gray-100 text-black text-sm"
                >
                    <span>📄</span>
                    <span>Export Current Slide as PDF</span>
                </button>
                <button
                    onclick={exportHTML}
                    class="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-2 border-b border-gray-100 text-black text-sm"
                >
                    <span>🌐</span>
                    <span>Export All Slides as Interactive HTML</span>
                </button>
                <button
                    onclick={sendLink}
                    class="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-2 last:rounded-b-lg text-black text-sm"
                >
                    <span>🔗</span>
                    <span>Send Link</span>
                </button>
            {/if}
        </div>
    {/if}
</div>
