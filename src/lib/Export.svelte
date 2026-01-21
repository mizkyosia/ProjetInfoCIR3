<script lang="ts">
  import html2canvas from "html2canvas-pro";
  export let canvasElements: any[];

  let showShareMenu = false;

  function toggleShareMenu() {
    showShareMenu = !showShareMenu;
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
      const clonedElement = element.cloneNode(true);
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

     
      
      document.body.appendChild(clonedElement);

      console.log("Converting to canvas...");
      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,  
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        imageTimeout: 0
      });

      // Supprimer le clone
      document.body.removeChild(clonedElement);

      console.log("Canvas created, converting to image...");
      const imgData = canvas.toDataURL("image/png");

      console.log("Creating PDF...");
      const pdf = new jsPDF("landscape", "px", [canvas.width, canvas.height]);

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("presentation.pdf");

      console.log("PDF saved successfully");
      showShareMenu = false;
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      alert("Erreur: " + error.message);
    }
  }
  function exportHTML() {
  const id = crypto.randomUUID();

  localStorage.setItem(
    "pres:" + id,
    JSON.stringify({
      canvasElements
    })
  );

  window.open(`/viewer#${id}`, "_blank");
  showShareMenu = false;
}



  function sendLink() {
    console.log("Sending link...");
    showShareMenu = false;
  }
</script>

<div class="relative">
  <button
    on:click={toggleShareMenu}
    class="font-semibold px-2 py-1 hover:bg-white/10 rounded cursor-pointer text-white"
  >
    File
  </button>

  {#if showShareMenu}
    <div
      class="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-200"
    >
      <button
        on:click={exportPDF}
        class="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-2 first:rounded-t-lg border-b border-gray-100 text-black"
      >
        <span>📄</span>
        <span>Export as PDF</span>
      </button>
      <button
        on:click={exportHTML}
        class="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-2 border-b border-gray-100 text-black"
      >
        <span>🌐</span>
        <span>Export as HTML</span>
      </button>
      <button
        on:click={sendLink}
        class="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-2 last:rounded-b-lg text-black"
      >
        <span>🔗</span>
        <span>Send Link</span>
      </button>
    </div>
  {/if}
</div>
