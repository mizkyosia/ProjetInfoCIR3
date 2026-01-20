<script>
  // Placeholder data for the sidebar items
  const sidebarItems = [
    { icon: '🎨', label: 'Design' },
    { icon: '🧩', label: 'Elements' },
    { icon: 'T', label: 'Text' },
    { icon: '☁️', label: 'Uploads' },
    { icon: '🖊️', label: 'Draw' },
    { icon: '📂', label: 'Projects' },
    { icon: '📱', label: 'Apps' }
  ];

  // Placeholder data for templates
  const templates = [
    { color: 'bg-blue-200', title: 'Infographic' },
    { color: 'bg-pink-200', title: 'Instagram Post' },
    { color: 'bg-yellow-200', title: 'Presentation' },
    { color: 'bg-green-200', title: 'Poster' },
    { color: 'bg-purple-200', title: 'Resume' },
    { color: 'bg-orange-200', title: 'Logo' }
  ];

  // ✅ Taille "réelle" de la white board (modifiable)
  let boardWidth = 800;
  let boardHeight = 450;
  let showResizePopup = false;

function toggleResizePopup() {
  showResizePopup = !showResizePopup;
}

function closeResizePopup() {
  showResizePopup = false;
}


  // ✅ Resize state
  let resizing = false;
  let startX = 0;
  let startY = 0;
  let startW = 0;
  let startH = 0;

  const MIN_W = 200;
  const MIN_H = 120;

  function startResize(e) {
    e.preventDefault();
    e.stopPropagation();

    resizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startW = boardWidth;
    startH = boardHeight;

    // capture du pointeur pour un drag fluide
    e.currentTarget?.setPointerCapture?.(e.pointerId);

    window.addEventListener('pointermove', onResizeMove);
    window.addEventListener('pointerup', stopResize, { once: true });
  }

  function onResizeMove(e) {
    if (!resizing) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    boardWidth = Math.max(MIN_W, Math.round(startW + dx));
    boardHeight = Math.max(MIN_H, Math.round(startH + dy));
  }

  function stopResize() {
    resizing = false;
    window.removeEventListener('pointermove', onResizeMove);
  }
  let resizeBtnEl;
let resizePopupEl;

function handleDocClick(e) {
  if (!showResizePopup) return;

  // ✅ Si on clique sur le handle, on ne ferme PAS le popup
  const el = e.target;
  if (el instanceof Element && el.closest(".resize-handle")) {
    return;
  }

  const target = e.target;

  const clickedInsidePopup = resizePopupEl && resizePopupEl.contains(target);
  const clickedOnButton = resizeBtnEl && resizeBtnEl.contains(target);

  if (!clickedInsidePopup && !clickedOnButton) {
    showResizePopup = false;
  }
}

import { onMount, onDestroy } from "svelte";

onMount(() => {
  // capture=true : on intercepte avant que d'autres éléments bloquent le clic
  document.addEventListener("pointerdown", handleDocClick, true);
});

onDestroy(() => {
  document.removeEventListener("pointerdown", handleDocClick, true);
});

</script>

<div class="flex h-screen w-full bg-gray-100 font-sans overflow-hidden">
  <!-- Left Sidebar (Navigation) -->
  <aside class="w-20 bg-gray-900 text-white flex flex-col items-center py-4 flex-shrink-0">
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
          class={`flex flex-col items-center justify-center w-full py-3 hover:bg-gray-800 transition-colors ${
            i === 0 ? 'bg-gray-800 border-l-4 border-cyan-400' : ''
          }`}
        >
          <span class="text-xl mb-1">{item.icon}</span>
          <span class="text-xs font-medium">{item.label}</span>
        </button>
      {/each}
    </nav>
  </aside>

  <!-- Main Workspace (Canvas Area) -->
  <main class="flex-1 flex flex-col min-w-0 bg-gray-100 relative">
    <!-- Top Bar -->
    <header class="h-14 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between px-4 shadow-sm flex-shrink-0">
      <div class="flex items-center space-x-4">
        <span class="font-semibold px-2 py-1 hover:bg-white/10 rounded cursor-pointer">File</span>
        <div class="relative">
  <button
  bind:this={resizeBtnEl}
  class="font-semibold px-2 py-1 hover:bg-white/10 rounded"
  type="button"
  on:click={toggleResizePopup}
>
  Resize
</button>

  {#if showResizePopup}
    <!-- Overlay invisible pour fermer au clic extérieur -->
    <button
      class="fixed inset-0 cursor-default"
      style="background: transparent;"
      on:click={closeResizePopup}
      aria-label="Close resize popup"
      type="button"
    ></button>

    <!-- Popup -->
    <div class="resize-popup" bind:this={resizePopupEl}>
      <div class="resize-title">Whiteboard size</div>

      <div class="resize-row">
        <span class="label">Width</span>
        <span class="value">{boardWidth}px</span>
      </div>

      <div class="resize-row">
        <span class="label">Height</span>
        <span class="value">{boardHeight}px</span>
      </div>

      <div class="resize-big">
        {boardWidth} × {boardHeight}
      </div>

      {#if resizing}
        <div class="resize-hint">Redimensionnement en cours…</div>
      {/if}
    </div>
  {/if}
</div>

        <div class="h-4 w-[1px] bg-white/30"></div>

        <!-- ✅ affiche la taille réelle actuelle -->
        <span class="text-sm opacity-90">Sans nom — {boardWidth}×{boardHeight}</span>
      </div>

      <div class="flex items-center space-x-3">
        <div class="flex -space-x-2">
          <div class="w-8 h-8 rounded-full bg-red-400 border-2 border-indigo-600"></div>
          <div class="w-8 h-8 rounded-full bg-green-400 border-2 border-indigo-600"></div>
        </div>
        <button class="bg-white/20 hover:bg-white/30 p-2 rounded-full" type="button">
          <span>➕</span>
        </button>
        <button class="bg-white text-indigo-700 font-bold py-1.5 px-4 rounded hover:bg-gray-100" type="button">
          Share
        </button>
      </div>
    </header>

    <!-- Canvas Container -->
    <div class="flex-1 relative overflow-auto flex items-center justify-center p-10 bg-gray-200">
      <!-- The White Board / Page (✅ redimensionnable) -->
      <div
        class="bg-white shadow-xl relative group"
        style="width:{boardWidth}px; height:{boardHeight}px;"
      >
        <!-- Content Placeholder -->

        <!-- ✅ Handle resize (coin bas-droit) -->
        {#if showResizePopup}
           <div
                class="resize-handle"
                on:pointerdown={startResize}
                title="Redimensionner"
            ></div>
        {/if}
     </div>

      <!-- Footer / Zoom Controls (inchangé pour l'instant) -->
      <div class="absolute bottom-4 right-4 bg-white px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-4 text-gray-600 text-sm">
        <div class="h-4 w-[1px] bg-gray-300"></div>
        <div class="flex items-center space-x-2">
          <button class="hover:text-black" type="button">-</button>
          <span>56%</span>
          <button class="hover:text-black" type="button">+</button>
        </div>
        <div class="h-4 w-[1px] bg-gray-300"></div>
        <span class="cursor-pointer hover:bg-gray-100 p-1 rounded">⤢</span>
      </div>
    </div>
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
  box-shadow: 0 12px 30px rgba(0,0,0,.25);
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
