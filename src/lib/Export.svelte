<script>
  import html2canvas from "html2canvas";
  let showShareMenu = false;

  function toggleShareMenu() {
    showShareMenu = !showShareMenu;
  }

  function toHSL(value) {
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
      const r = rgb[0] / 255;
      const g = rgb[1] / 255;
      const b = rgb[2] / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
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

      for (let i = 0; i < allElements.length; i++) {
        const cs = getComputedStyle(origElements[i]);
        
        for (const prop of colorProps) {
          const v = cs[prop];
          if (v && v.includes("oklch")) {
            allElements[i].style[prop] = toHSL(v);
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
        try {
            const element = document.getElementById("presentation");

            if (!element) {
                console.error('Presentation element not found');
                return;
            }

            // Cloner l'élément et convertir oklch en hsl
            const clonedElement = element.cloneNode(true);
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
                    const v = cs[prop];
                    if (v && v.includes("oklch")) {
                        allElements[i].style[prop] = toHSL(v);
                    }
                }
            }

            const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presentation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f3f4f6;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
        }
        
        .presentation {
            width: 800px;
            height: 450px;
            background-color: white;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
        }
    </style>
</head>
<body>
    <div class="presentation">
        ${clonedElement.innerHTML}
    </div>
</body>
</html>`;

            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'presentation.html';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            showShareMenu = false;
        } catch (error) {
            console.error('Error exporting HTML:', error);
        }
    }

    function sendLink() {
        console.log('Sending link...');
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
        <div class="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
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
