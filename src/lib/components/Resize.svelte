<script>
  import { onMount, onDestroy } from "svelte";

  let { 
    width = $bindable(),
    height = $bindable(),
    color = $bindable("#ffffff"),
    visible = $bindable(false),
    zoom = 1,
    type = "menu" // "menu" | "handle"
  } = $props();

  const MIN_W = 200;
  const MIN_H = 120;

  // --- MENU LOGIC ---
  let resizeBtnEl = $state(null);
  let resizePopupEl = $state(null);

  function toggleResizePopup() {
    visible = !visible;
  }

  function closeResizePopup() {
    visible = false;
  }

  function handleDocClick(e) {
    if (!visible) return;

    // Check if clicked on handle (handled via class check to allow cross-component detection)
    const el = e.target;
    // We check for a specific class or attribute that acts as a marker
    if (el instanceof Element && el.closest(".resize-handle-target")) {
      return;
    }

    const target = e.target;
    const clickedInsidePopup = resizePopupEl && resizePopupEl.contains(target);
    const clickedOnButton = resizeBtnEl && resizeBtnEl.contains(target);

    if (!clickedInsidePopup && !clickedOnButton) {
      visible = false;
    }
  }

  // Only bind document listener if acts as menu
  onMount(() => {
    if (type === "menu") {
      document.addEventListener("pointerdown", handleDocClick, true);
    }
  });

  onDestroy(() => {
    if (type === "menu") {
      document.removeEventListener("pointerdown", handleDocClick, true);
    }
  });


  // --- HANDLE LOGIC ---
  let resizing = $state(false);
  let startX = 0;
  let startY = 0;
  let startW = 0;
  let startH = 0;

  function startResize(e) {
      e.preventDefault();
      e.stopPropagation();

      resizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startW = width;
      startH = height;

      // Pointer capture
      e.currentTarget?.setPointerCapture?.(e.pointerId);

      window.addEventListener('pointermove', onResizeMove);
      window.addEventListener('pointerup', stopResize, { once: true });
      
      // Add global cursor class
      document.body.classList.add('resizing');
  }

  function onResizeMove(e) {
      if (!resizing) return;

      const dx = (e.clientX - startX) / zoom;
      const dy = (e.clientY - startY) / zoom;

      width = Math.max(MIN_W, Math.round(startW + dx));
      height = Math.max(MIN_H, Math.round(startH + dy));
  }

  function stopResize() {
      resizing = false;
      window.removeEventListener('pointermove', onResizeMove);
      document.body.classList.remove('resizing');
  }

</script>

{#if type === "menu"}
    <div class="relative">
        <button 
            bind:this={resizeBtnEl}
            onclick={toggleResizePopup}
            class="font-semibold px-2 py-1 hover:bg-white/10 rounded cursor-pointer"
        >
            Resize
        </button>
        
        {#if visible}
            <div 
                class="resize-popup"
                bind:this={resizePopupEl}
            >
                <h3>Taille du document</h3>
                <div class="field">
                    <label for="bw">Largeur (px)</label>
                    <input id="bw" type="number" bind:value={width} min={MIN_W} />
                </div>
                <div class="field">
                    <label for="bh">Hauteur (px)</label>
                    <input id="bh" type="number" bind:value={height} min={MIN_H} />
                </div>
                <div class="field">
                    <label for="bc">Couleur de fond</label>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <input id="bc" type="color" bind:value={color} style="width:30px; height:30px; padding:0; border:none; cursor:pointer;" />
                        <span style="font-size:11px;">{color}</span>
                    </div>
                </div>
                <div class="actions">
                    <button onclick={closeResizePopup}>Fermer</button>
                </div>
            </div>
        {/if}
    </div>
{:else if type === "handle"}
    {#if visible}
        <!-- class 'resize-handle-target' is a marker for the click listener -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
            class="resize-handle resize-handle-target"
            onpointerdown={startResize}
        ></div>
        <div class="absolute bottom-0 right-0 p-1 text-[10px] text-gray-400 bg-white/80 pointer-events-none">
            {width} × {height}
        </div>
    {/if}
{/if}

<style>
  /* Popup styling */
  .resize-popup {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 8px;
    padding: 12px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 1000;
    width: 200px;
    color: #333;
  }
  .resize-popup h3 {
    margin: 0 0 10px 0;
    font-size: 14px;
    font-weight: 600;
    border-bottom: 1px solid #eee;
    padding-bottom: 4px;
  }
  .resize-popup .field {
    display: flex;
    flex-direction: column;
    margin-bottom: 8px;
  }
  .resize-popup label {
    font-size: 11px;
    margin-bottom: 2px;
    color: #666;
  }
  .resize-popup input {
    font-size: 13px;
    padding: 4px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  .resize-popup .actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;
  }
  .resize-popup button {
    font-size: 11px;
    padding: 4px 8px;
    background: #eee;
    border-radius: 4px;
  }
  .resize-popup button:hover {
    background: #ddd;
  }

  /* Handle de redimensionnement (coin bas-droit) */
  .resize-handle {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 16px;
    height: 16px;
    cursor: nwse-resize;
    z-index: 50;
    background: linear-gradient(135deg, transparent 50%, #ff0044 50%);
  }
  .resize-handle:hover {
      background: linear-gradient(135deg, transparent 50%, #cc0033 50%);
  }
  
  /* Global cursor override */
  :global(body.resizing) {
      cursor: nwse-resize !important;
  }
</style>