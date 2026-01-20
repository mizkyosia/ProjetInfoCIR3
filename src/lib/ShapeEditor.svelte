<script lang="ts">
  // --- 1. TYPES ---
  type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'star' | 'bubble' | 'heart' | 'arrow' | 'pencil' | 'image' | 'emoji';

  interface Point { x: number; y: number; }

  interface Shape {
    id: number;
    type: ShapeType;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    opacity: number;
    hasShadow: boolean;
    radius: number;
    arrowStart: boolean;
    arrowEnd: boolean;
    content: string;
    fontSize: number;
    textColor: string;
    points?: Point[];
    pathData?: string;
    smoothing?: number;
    url?: string;
  }

  // --- 2. ETAT ---
  let shapes: Shape[] = [];
  let nextId = 1;
  let selectedShapeId: number | null = null;
  let mainCanvas: HTMLElement;

  // Undo / Redo
  let undoStack: string[] = [];
  let redoStack: string[] = [];
  let snapshot: string = "";

  // Presse-papier
  let clipboard: Shape | null = null;

  // Drag & Drop
  let isDraggingOver = false;

  // --- SYSTÈME D'EMOJIS ---
  let showEmojiPicker = false;
  let activeCategory = "all";
  let emojiSearch = "";

  // Mode "Remplacement" : si on double clique sur un emoji, on stocke son ID ici pour le remplacer
  let shapeIdToReplace: number | null = null; 

  const emojiCategories = {
      faces: ["😀", "😃", "😄", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "ww", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "mb", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "og", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾"],
      hands: ["👋", "🤚", "🖐", "✋", "🖖", "👌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "💪", "🧠", "🦷", "🦴", "👀", "👁️", "👅", "👄", "💋"],
      animals: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "cow", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "bh", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜", "🦟", "🦗", "🕷️", "🕸️", "🦂", "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🦙", "🐐", "🦌", "🐕", "🐩", "🦮", "🐕‍🦺", "🐈", "🐓", "🦃", "🦚", "🦜", "🦢", "🦩", "🕊️", "🐇", "🦝", "🦨", "🦡", "🦦", "🦥", "🐁", "🐀", "🐿️", "🦔"],
      food: ["🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🌽", "🥕", "🧄", "🧅", "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🦴", "🌭", "🍔", "🍟", "🍕", "🥪", "🥙", "🧆", "🌮", "🌯", "🥗", "🥘", "🥫", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥟", "🦪", "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🥮", "🍢", "🍡", "🍧", "🍨", "🍦", "🥧", "🧁", "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "🍿", "🍩", "🍪", "🌰", "🥜", "🍯", "🥛", "🍼", "☕", "🍵", "🧃", "🥤", "🍺", "🍻", "🥂", "🍷", "🥃", "🍸", "🍹", "🧉", "🍾", "🧊"],
      objects: ["⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛷", "⛸️", "🥌", "🎿", "⛷️", "🏂", "🪂", "🏋️", "🤼", "🤸", "⛹️", "🤺", "🤾", "🏌️", "🏇", "🧘", "🏄", "🏊", "🤽", "🚣", "🧗", "🚵", "🚴", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️", "🏵️", "🎗️", "🎫", "🎟️", "🎪", "🤹", "🎭", "🎨", "🎬", "🎤", "🎧", "🎼", "🎹", "🥁", "🎷", "🎺", "🎸", "🪕", "🎻", "🎲", "♟️", "🎯", "🎳", "🎮", "🎰", "🧩", "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🚚", "🚛", "🚜", "🏍️", "🛵", "🚲", "🦼", "🦽", "🦺", "🚔", "🚍", "🚘", "🚖", "🚡", "🚠", "🚟", "🚃", "🚋", "🚞", "🚝", "🚄", "🚅", "🚈", "🚂", "🚆", "🚇", "🚊", "🚉", "✈️", "🛫", "🛬", "🛩️", "💺", "🛰️", "🚀", "🛸", "🚁", "🛶", "⛵", "🚤", "🛥️", "🛳️", "⛴️", "🚢", "⚓", "⛽", "🚧", "🚦", "🚥", "🚏", "🗺️", "🗿", "🗽", "🗼", "🏰", "🏯", "🏟️", "🎡", "🎢", "🎠", "⛲", "⛱️", "🏖️", "🏝️", "🏜️", "🌋", "⛰️", "🏔️", "🗻", "🏕️", "⛺", "🏠", "🏡", "🏘️", "🏚️", "🏗️", "🏭", "🏢", "🏬", "🏣", "🏤", "🏥", "🏦", "🏨", "🏪", "🏫", "🏩", "💒", "🏛️", "⛪", "🕌", "🕍", "🛕", "🕋", "⛩️", "🛤️", "🛣️", "🗾", "🎑", "🏞️", "🌅", "🌄", "🌠", "🎇", "🎆", "🌇", "🌆", "🏙️", "🌃", "🌌", "🌉", "🌁"],
      symbols: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️", "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐", "⛎", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓", "🆔", "⚛️", "🉑", "☢️", "☣️", "📴", "📳", "🈶", "🈚", "🈸", "🈺", "🈷️", "✴️", "🆚", "💮", "🉐", "㊙️", "㊗️", "🈴", "🈵", "🈹", "🈲", "🅰️", "🅱️", "🆎", "🆑", "🅾️", "🆘", "❌", "⭕", "🛑", "⛔", "📛", "🚫", "💯", "💢", "♨️", "🚷", "🚯", "🚳", "🚱", "🔞", "📵", "🚭", "❗️", "❕", "❓", "❔", "‼️", "⁉️", "🔅", "🔆", "〽️", "⚠️", "🚸", "🔱", "⚜️", "🔰", "♻️", "✅", "🈯", "💹", "❇️", "✳️", "❎", "🌐", "💠", "Ⓜ️", "🌀", "💤", "🏧", "🚾", "♿", "🅿️", "🈳", "🈂️", "🛂", "🛃", "🛄", "🛅", "🚹", "🚺", "🚼", "🚻", "🚮", "🎦", "📶", "🈁", "🔣", "ℹ️", "🔤", "🔡", "🔠", "🆖", "🆗", "🆙", "🆒", "🆕", "🆓", "0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟", "🔢", "#️⃣", "*️⃣", "⏏️", "▶️", "⏸️", "⏯️", "⏹️", "⏺️", "⏭️", "⏮️", "⏩", "⏪", "⏫", "⏬", "◀️", "🔼", "🔽", "➡️", "⬅️", "⬆️", "⬇️", "↗️", "↘️", "↙️", "↖️", "↕️", "↔️", "↪️", "↩️", "⤴️", "⤵️", "🔀", "🔁", "🔂", "🔄", "🔃", "🎵", "🎶", "➕", "➖", "➗", "✖️", "♾️", "💲", "💱", "™️", "©️", "®️", "〰️", "➰", "➿", "🔚", "🔙", "🔛", "🔝", "🔜", "✔️", "☑️", "🔘", "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚫", "⚪", "🟤", "🔺", "🔻", "🔸", "🔹", "🔶", "🔷", "🔳", "🔲", "▪️", "▫️", "◾", "◽", "◼️", "◻️", "🟥", "🟧", "🟨", "🟩", "🟦", "🟪", "⬛", "⬜", "🟫", "🔈", "🔇", "🔉", "🔊", "🔔", "🔕", "📣", "📢", "👁️‍🗨️", "💬", "💭", "🗯️", "♠️", "♣️", "♥️", "♦️", "🃏", "🎴", "🀄", "🕐", "🕑", "🕒", "🕓", "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚", "🕛", "🕜", "🕝", "🕞", "🕟", "🕠", "🕡", "🕢", "🕣", "🕤", "🕥", "🕦", "🕧"]
  };
  const categoryIcons = { all: "⭐", faces: "😀", hands: "👋", animals: "🐻", food: "🍔", objects: "⚽", symbols: "❤️" };
  const emojiKeywords: Record<string, string> = {
      "😀": "smile sourire happy content", "😂": "mdr lol rire laugh", "😍": "love amour heart coeur", 
      "😭": "cry pleurer sad triste", "😎": "cool sun soleil", "🤔": "think penser", "😴": "sleep dormir",
      "😡": "angry colere enerve", "🤡": "clown", "💩": "poop caca", "👻": "ghost fantome",
      "👍": "like pouce bon ok", "👎": "dislike mauvais", "👋": "hello salut main", "💪": "strong fort muscle",
      "🐶": "dog chien", "🐱": "cat chat", "🦊": "fox renard", "🦁": "lion", "🐯": "tiger tigre",
      "🦄": "unicorn licorne", "🐝": "bee abeille", "🕷️": "spider araignee", "🦖": "dino dinosaure",
      "🍕": "pizza", "🍔": "burger", "🍟": "frites fries", "🍎": "apple pomme", "🍌": "banana banane",
      "🍺": "beer biere", "☕": "coffee cafe", "🎂": "cake gateau anniversaire",
      "⚽": "foot ball ballon", "🏀": "basket", "🚗": "car voiture auto", "✈️": "plane avion",
      "🚀": "rocket fusee", "📱": "phone telephone mobile", "💻": "laptop ordinateur pc",
      "💣": "bomb bombe", "🎉": "party fete", "🎁": "gift cadeau",
      "❤️": "heart coeur love amour rouge", "🔥": "fire feu hot chaud", "✨": "star etoile magic",
      "✅": "check ok valide", "❌": "cross croix non", "⚠️": "warning attention"
  };

  $: filteredEmojis = (() => {
      let emojis: string[] = [];
      const term = emojiSearch.toLowerCase().trim();
      if (activeCategory === 'all') Object.values(emojiCategories).forEach(arr => emojis.push(...arr));
      else { // @ts-ignore 
        emojis = emojiCategories[activeCategory] || []; }
      if (term) { return emojis.filter(e => { const keywords = emojiKeywords[e] || ""; return keywords.includes(term); }); }
      return emojis;
  })();

  $: selectedIndex = shapes.findIndex(s => s.id === selectedShapeId);

  let toolMode: 'select' | 'draw_pencil' = 'select';
  type InteractionAction = 'none' | 'drag' | 'resize' | 'rotate' | 'drawing';
  let currentAction: InteractionAction = 'none';
  let startX = 0, startY = 0;
  let activeHandle: string | null = null;
  let initialShape: Shape | null = null;
  const niceColors = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea', '#000000', '#4b5563', '#ffffff'];

  // --- HISTORIQUE & LOGIQUE ---
  function recordHistory() { undoStack = [...undoStack, JSON.stringify(shapes)]; if (undoStack.length > 50) undoStack.shift(); redoStack = []; }
  function performUndo() { if (undoStack.length === 0) return; redoStack = [...redoStack, JSON.stringify(shapes)]; const prev = undoStack.pop(); undoStack = undoStack; shapes = JSON.parse(prev!); selectedShapeId = null; }
  function performRedo() { if (redoStack.length === 0) return; undoStack = [...undoStack, JSON.stringify(shapes)]; const next = redoStack.pop(); redoStack = redoStack; shapes = JSON.parse(next!); selectedShapeId = null; }
  function copyShape() { if (selectedIndex !== -1) clipboard = JSON.parse(JSON.stringify(shapes[selectedIndex])); }
  function pasteShape() { if (!clipboard) return; recordHistory(); const newShape = JSON.parse(JSON.stringify(clipboard)); newShape.id = nextId++; newShape.x += 20; newShape.y += 20; shapes = [...shapes, newShape]; selectedShapeId = newShape.id; }
  
  function getSvgPathFromStroke(points: Point[], smoothing: number = 0.5): string {
    const len = points.length; if (len < 2) return ''; if (smoothing === 0) return `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;
    const p0 = points[0]; let d = `M ${p0.x} ${p0.y}`;
    for (let i = 1; i < len - 1; i++) {
        const p1 = points[i]; const p2 = points[i + 1];
        const endX = (p1.x + p2.x) / 2; const endY = (p1.y + p2.y) / 2;
        const cpX = p1.x + (p1.x - endX) * (1 - smoothing); const cpY = p1.y + (p1.y - endY) * (1 - smoothing);
        d += ` Q ${p1.x} ${p1.y}, ${endX} ${endY}`;
    }
    d += ` L ${points[len - 1].x} ${points[len - 1].y}`; return d;
  }

  function handleEmojiSelect(emoji: string) {
      if (shapeIdToReplace !== null) {
          // Mode Remplacement (via double-clic)
          recordHistory();
          shapes = shapes.map(s => s.id === shapeIdToReplace ? { ...s, content: emoji } : s);
          shapeIdToReplace = null;
      } else {
          // Mode Ajout
          addShape('emoji', emoji);
      }
      showEmojiPicker = false;
      emojiSearch = "";
  }

  function addShape(type: ShapeType, extraData: string = '') {
    if (type === 'pencil') { toolMode = 'draw_pencil'; selectedShapeId = null; return; }
    recordHistory();
    toolMode = 'select';
    
    const isImg = type === 'image', isArrow = type === 'arrow', isEmoji = type === 'emoji';
    let w = 120, h = 120;
    if (isArrow) { w = 200; h = 60; } else if (isImg) { w = 150; h = 150; } else if (isEmoji) { w = 80; h = 80; }

    const newShape: Shape = {
      id: nextId++, type, x: 200, y: 200, width: w, height: h, rotation: 0,
      fill: (isArrow || isImg || isEmoji) ? 'transparent' : getRandomColor(),
      stroke: (isArrow) ? '#2563eb' : (isImg || isEmoji ? 'transparent' : '#000000'),
      strokeWidth: (isArrow) ? 4 : 0, opacity: 1, hasShadow: (!isArrow && !isImg && !isEmoji),
      radius: 0, arrowStart: false, arrowEnd: true, content: isEmoji ? extraData : '',
      fontSize: 0, textColor: '#000000', smoothing: 0.5, url: isImg ? extraData : undefined
    };
    shapes = [...shapes, newShape];
    selectedShapeId = newShape.id;
  }
  function promptAddImage() { const url = prompt("URL Image :", "https://via.placeholder.com/150"); if (url) addShape('image', url); }
  function moveLayer(direction: 'up' | 'down' | 'top' | 'bottom') {
    if (selectedShapeId === null || selectedIndex === -1) return;
    recordHistory();
    const item = shapes[selectedIndex]; let newShapes = [...shapes]; newShapes.splice(selectedIndex, 1);
    if (direction === 'top') newShapes.push(item);
    else if (direction === 'bottom') newShapes.unshift(item);
    else if (direction === 'up') newShapes.splice(Math.min(newShapes.length, selectedIndex + 1), 0, item);
    else if (direction === 'down') newShapes.splice(Math.max(0, selectedIndex - 1), 0, item);
    shapes = newShapes;
  }
  function deleteSelected() { if (selectedShapeId !== null) { recordHistory(); shapes = shapes.filter(s => s.id !== selectedShapeId); selectedShapeId = null; } }
  function getRandomColor() { return niceColors[Math.floor(Math.random() * (niceColors.length - 2))]; }

  // --- EVENTS ---
  function handleDragOver(e: DragEvent) { e.preventDefault(); isDraggingOver = true; }
  function handleDragLeave() { isDraggingOver = false; }
  function handleDrop(e: DragEvent) {
      e.preventDefault(); isDraggingOver = false;
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
              const reader = new FileReader();
              reader.onload = (evt) => { if (evt.target?.result) addShape('image', evt.target.result as string); };
              reader.readAsDataURL(file);
          }
      }
  }

  function handleDoubleClick(id: number) {
      const s = shapes.find(sh => sh.id === id);
      if (s && s.type === 'emoji') {
          shapeIdToReplace = id;
          showEmojiPicker = true;
          emojiSearch = "";
      }
  }

  function handleMouseDown(event: MouseEvent, action: InteractionAction, id: number | null = null, handle: string | null = null) {
    if (event.button !== 0) return;
    snapshot = JSON.stringify(shapes); startX = event.clientX; startY = event.clientY;
    if (toolMode === 'draw_pencil' && action === 'none') {
        if (!mainCanvas) return; currentAction = 'drawing'; selectedShapeId = null;
        const rect = mainCanvas.getBoundingClientRect();
        const lastPencil = [...shapes].reverse().find(s => s.type === 'pencil');
        shapes = [...shapes, { id: nextId++, type: 'pencil', x: 0, y: 0, width: 0, height: 0, rotation: 0, fill: 'none', stroke: lastPencil ? lastPencil.stroke : '#2563eb', strokeWidth: lastPencil ? lastPencil.strokeWidth : 3, opacity: 1, hasShadow: false, radius: 0, arrowStart: false, arrowEnd: false, content: '', fontSize: 0, textColor: '', points: [{ x: event.clientX - rect.left, y: event.clientY - rect.top }], pathData: `M ${event.clientX - rect.left} ${event.clientY - rect.top}`, smoothing: 0.5 }];
        return;
    } 
    if (action === 'resize' || action === 'rotate') { event.stopPropagation(); currentAction = action; activeHandle = handle; const s = shapes.find(s => s.id === selectedShapeId); if (s) initialShape = { ...s }; return; }
    if (toolMode === 'select' && id !== null) { event.stopPropagation(); selectedShapeId = id; currentAction = 'drag'; const s = shapes.find(s => s.id === selectedShapeId); if (s) initialShape = { ...s }; return; }
    if (toolMode === 'select' && id === null) selectedShapeId = null;
  }
  function handleMouseMove(event: MouseEvent) {
    if (toolMode === 'draw_pencil' && currentAction === 'drawing') {
        if (!mainCanvas) return;
        const rect = mainCanvas.getBoundingClientRect(); const mouseX = event.clientX - rect.left; const mouseY = event.clientY - rect.top;
        const idx = shapes.length - 1; const s = shapes[idx]; if (!s.points) return;
        const lastPoint = s.points[s.points.length - 1];
        if (Math.hypot(mouseX - lastPoint.x, mouseY - lastPoint.y) > 3) {
            const newPoints = [...s.points, { x: mouseX, y: mouseY }];
            shapes[idx] = { ...s, points: newPoints, pathData: getSvgPathFromStroke(newPoints, s.smoothing) };
        }
        return;
    }
    if (currentAction === 'none' || !initialShape || selectedShapeId === null) return;
    const dx = event.clientX - startX; const dy = event.clientY - startY; const shiftPressed = event.shiftKey;
    shapes = shapes.map(s => {
      if (s.id !== selectedShapeId) return s;
      if (currentAction === 'drag') return { ...s, x: initialShape!.x + dx, y: initialShape!.y + dy };
      if (currentAction === 'resize' && activeHandle) {
        let { x, y, width, height } = initialShape!;
        if (activeHandle.includes('r')) width += dx; if (activeHandle.includes('b')) height += dy;
        if (activeHandle.includes('l')) { x += dx; width -= dx; } if (activeHandle.includes('t')) { y += dy; height -= dy; }
        if (shiftPressed && initialShape!.width > 0 && initialShape!.height > 0) {
             const ratio = initialShape!.width / initialShape!.height;
             if (activeHandle.length === 2) { if (activeHandle.includes('b')) width = height * ratio; else height = width / ratio; }
        }
        if (width < 10) width = 10; if (height < 10) height = 10;
        return { ...s, x, y, width, height };
      }
      if (currentAction === 'rotate') {
        const cx = initialShape!.x + initialShape!.width / 2; const cy = initialShape!.y + initialShape!.height / 2;
        let deg = Math.atan2(event.clientY - cy, event.clientX - cx) * (180 / Math.PI);
        if (s.type !== 'arrow') deg += 90; if (shiftPressed) deg = Math.round(deg / 15) * 15;
        return { ...s, rotation: deg };
      }
      return s;
    });
  }
  function handleMouseUp() {
    if (currentAction === 'drawing') {
        const idx = shapes.length - 1; const s = shapes[idx];
        if (s.points && s.points.length > 2) {
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            s.points.forEach(p => { if (p.x < minX) minX = p.x; if (p.y < minY) minY = p.y; if (p.x > maxX) maxX = p.x; if (p.y > maxY) maxY = p.y; });
            const width = maxX - minX; const height = maxY - minY; const relativePoints = s.points.map(p => ({ x: p.x - minX, y: p.y - minY }));
            shapes[idx] = { ...s, x: minX, y: minY, width: Math.max(20, width), height: Math.max(20, height), points: relativePoints, pathData: getSvgPathFromStroke(relativePoints, s.smoothing) };
        } else { shapes.pop(); shapes = shapes; }
    }
    if (['drag', 'resize', 'rotate', 'drawing'].includes(currentAction)) {
         if (JSON.stringify(shapes) !== snapshot) { undoStack = [...undoStack, snapshot]; if (undoStack.length > 50) undoStack.shift(); redoStack = []; }
    }
    currentAction = 'none'; activeHandle = null; initialShape = null;
  }
  function handleKeydown(e: KeyboardEvent) { 
      if (e.ctrlKey || e.metaKey) {
          if (e.key === 'z') { e.preventDefault(); performUndo(); return; }
          if (e.key === 'y') { e.preventDefault(); performRedo(); return; }
          if (e.key === 'c') { copyShape(); return; }
          if (e.key === 'v') { pasteShape(); return; }
      }
      if (e.key === 'Escape') { toolMode = 'select'; selectedShapeId = null; showEmojiPicker = false; return; }
      if (!selectedShapeId) return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && (e.target as HTMLElement).tagName !== 'INPUT') { deleteSelected(); }
  }
</script>

<svelte:window on:keydown={handleKeydown} on:mousemove={handleMouseMove} on:mouseup={handleMouseUp} />

<div class="flex flex-col h-full w-full bg-white font-sans rounded-3xl overflow-hidden select-none shadow-xl ring-1 ring-gray-100 relative">
  
  <header class="h-16 bg-gray-50 border-b border-gray-200 flex items-center px-4 gap-4 z-20 overflow-x-auto">
    <div class="flex items-center gap-2 mr-2 border-r border-gray-200 pr-4">
        <div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold shadow-sm">S</div>
        <div class="flex flex-col"><span class="text-xs font-bold text-gray-700">STUDIO</span><span class="text-[10px] text-gray-500">Editor</span></div>
    </div>
    
    <div class="flex items-center border-r border-gray-200 pr-4 gap-1">
        <button on:click={() => { toolMode = 'draw_pencil'; selectedShapeId = null; }} class="w-10 h-10 rounded flex items-center justify-center transition-all {toolMode === 'draw_pencil' ? 'bg-white shadow ring-2 ring-blue-400 text-blue-600' : 'text-gray-500 hover:bg-gray-200'}" title="Crayon">✏️</button>
        <button on:click={() => toolMode = 'select'} class="w-10 h-10 rounded flex items-center justify-center transition-all {toolMode === 'select' ? 'bg-white shadow ring-2 ring-blue-400 text-blue-600' : 'text-gray-500 hover:bg-gray-200'}" title="Sélection">↖️</button>
    </div>

    <div class="flex items-center border-r border-gray-200 pr-4 gap-2">
        <button on:click={promptAddImage} class="w-10 h-10 rounded flex items-center justify-center text-xl hover:bg-gray-200" title="Ajouter Image">🖼️</button>
        
        <button on:click={() => { showEmojiPicker = true; emojiSearch = ""; shapeIdToReplace = null; }} class="w-10 h-10 rounded flex items-center justify-center text-xl hover:bg-gray-200" title="Ajouter Emoji">😀</button>

        <div class="w-px h-6 bg-gray-200"></div>
        <button on:click={performUndo} class="w-8 h-8 rounded flex items-center justify-center text-gray-600 hover:bg-gray-200 {undoStack.length === 0 ? 'opacity-30 cursor-not-allowed' : ''}" title="Annuler">↩️</button>
        <button on:click={performRedo} class="w-8 h-8 rounded flex items-center justify-center text-gray-600 hover:bg-gray-200 {redoStack.length === 0 ? 'opacity-30 cursor-not-allowed' : ''}" title="Rétablir">↪️</button>
    </div>

    {#if selectedIndex !== -1 && toolMode === 'select'}
        <div class="flex items-center gap-4 animate-fade-in">
            <div class="flex flex-col justify-center">
                <span class="text-[9px] text-gray-500 uppercase font-bold">Calques</span>
                <div class="flex bg-white rounded border border-gray-300 overflow-hidden">
                   <button class="px-2 py-1 hover:bg-gray-100 text-gray-600 border-r border-gray-200" on:click={() => moveLayer('bottom')}>⟱</button>
                   <button class="px-2 py-1 hover:bg-gray-100 text-gray-600 border-r border-gray-200" on:click={() => moveLayer('down')}>↓</button>
                   <button class="px-2 py-1 hover:bg-gray-100 text-gray-600 border-r border-gray-200" on:click={() => moveLayer('up')}>↑</button>
                   <button class="px-2 py-1 hover:bg-gray-100 text-gray-600" on:click={() => moveLayer('top')}>⟰</button>
                </div>
           </div>

            {#if shapes[selectedIndex].type === 'arrow'}
                <div class="flex flex-col justify-center">
                      <span class="text-[9px] text-gray-500 uppercase font-bold">Pointes</span>
                      <div class="flex bg-white rounded border border-gray-300 overflow-hidden">
                        <button class="px-2 py-1 hover:bg-gray-50 {shapes[selectedIndex].arrowStart ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}" on:click={() => { recordHistory(); shapes[selectedIndex].arrowStart = !shapes[selectedIndex].arrowStart; }}>◀</button>
                        <div class="w-px bg-gray-200"></div>
                        <button class="px-2 py-1 hover:bg-gray-50 {shapes[selectedIndex].arrowEnd ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}" on:click={() => { recordHistory(); shapes[selectedIndex].arrowEnd = !shapes[selectedIndex].arrowEnd; }}>▶</button>
                      </div>
                </div>
            {/if}

            {#if shapes[selectedIndex].type === 'pencil'}
                <div class="flex flex-col justify-center w-24">
                    <span class="text-[9px] text-gray-500 uppercase font-bold">Lissage</span>
                    <input type="range" min="0" max="1" step="0.1" on:mousedown={recordHistory} bind:value={shapes[selectedIndex].smoothing} on:change={() => { if(shapes[selectedIndex].points) shapes[selectedIndex].pathData = getSvgPathFromStroke(shapes[selectedIndex].points, shapes[selectedIndex].smoothing); }} class="h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer" />
                </div>
            {/if}

            <div class="flex flex-col justify-center">
                <span class="text-[9px] text-gray-500 uppercase font-bold">Style</span>
                <div class="flex gap-2 items-center bg-white p-1 rounded border border-gray-200">
                    {#if shapes[selectedIndex].type !== 'image' && shapes[selectedIndex].type !== 'emoji'}
                        <div class="relative w-6 h-6">
                            <input type="color" on:input={recordHistory} bind:value={shapes[selectedIndex].stroke} class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"/>
                            <div class="w-6 h-6 rounded border border-gray-300" style="background-color: {shapes[selectedIndex].stroke}"></div>
                        </div>
                        <div class="flex items-center gap-1 bg-gray-100 rounded px-1 border border-gray-200">
                            <input type="number" min="1" max="50" on:change={recordHistory} bind:value={shapes[selectedIndex].strokeWidth} class="w-12 bg-transparent text-sm font-bold text-center focus:outline-none p-1"/>
                            <span class="text-[9px] text-gray-500 font-bold pr-1">px</span>
                        </div>
                    {/if}
                    {#if shapes[selectedIndex].type !== 'pencil' && shapes[selectedIndex].type !== 'arrow' && shapes[selectedIndex].type !== 'image' && shapes[selectedIndex].type !== 'emoji'}
                        <div class="w-px h-4 bg-gray-200 mx-1"></div>
                        <div class="relative w-6 h-6">
                            <input type="color" on:input={recordHistory} bind:value={shapes[selectedIndex].fill} class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"/>
                            <div class="w-6 h-6 rounded border border-gray-300" style="background-color: {shapes[selectedIndex].fill}"></div>
                        </div>
                    {/if}
                    <div class="w-px h-4 bg-gray-200 mx-1"></div>
                    <div class="flex items-center gap-1 bg-gray-100 rounded px-1 border border-gray-200" title="Opacité">
                         <span class="text-xs">👁️</span>
                         <input type="number" min="0.1" max="1" step="0.1" on:change={recordHistory} bind:value={shapes[selectedIndex].opacity} class="w-12 bg-transparent text-sm font-bold text-center focus:outline-none p-1"/>
                    </div>
                </div>
            </div>
            <button on:click={copyShape} class="text-gray-500 hover:bg-gray-100 p-2 rounded" title="Copier">📋</button>
            {#if clipboard} <button on:click={pasteShape} class="text-gray-500 hover:bg-gray-100 p-2 rounded animate-fade-in" title="Coller">📋⬇</button> {/if}
            <button on:click={deleteSelected} class="ml-auto text-red-500 hover:bg-red-50 p-2 rounded" title="Supprimer">🗑️</button>
        </div>
    {:else if toolMode === 'draw_pencil'}
        <span class="text-sm text-blue-600 font-medium ml-2 animate-pulse">🖊️ Mode Dessin</span>
    {:else}
        <span class="text-sm text-gray-400 italic ml-2">Sélectionnez un objet...</span>
    {/if}
  </header>

  <div class="flex flex-1 overflow-hidden relative">
      <aside class="w-16 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 gap-3 z-10 overflow-y-auto">
        {#each [{t:'arrow', i:'➡️', n:'Flèche'}, {t:'rectangle', i:'🟥', n:'Rectangle'}, {t:'circle', i:'🔵', n:'Cercle'}, {t:'triangle', i:'🔺', n:'Triangle'}, {t:'bubble', i:'💬', n:'Bulle'}, {t:'star', i:'⭐', n:'Etoile'}, {t:'heart', i:'❤️', n:'Coeur'}] as tool}
            <button class="w-10 h-10 flex items-center justify-center rounded bg-white shadow-sm border border-gray-200 hover:scale-110 hover:border-blue-400 hover:text-blue-600 transition-all text-xl" on:click={() => addShape(tool.t as ShapeType)} title={tool.n}>{tool.i}</button>
        {/each}
      </aside>

      <main bind:this={mainCanvas} class="flex-1 relative bg-white overflow-hidden transition-colors duration-200 {isDraggingOver ? 'bg-blue-50 ring-4 ring-inset ring-blue-200' : ''}" 
        style="cursor: {toolMode === 'draw_pencil' ? 'crosshair' : 'default'}"
        on:mousedown={(e) => handleMouseDown(e, 'none')} 
        on:dragover={handleDragOver} on:dragleave={handleDragLeave} on:drop={handleDrop}
        role="application">
        
        {#if isDraggingOver} <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-50"><span class="text-2xl font-bold text-blue-400">Déposez l'image ici</span></div> {/if}
        <div class="absolute inset-0 pointer-events-none opacity-20" style="background-image: linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px); background-size: 20px 20px;"></div>

        <svg class="w-full h-full relative z-0">
          <defs>
             <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3"/><feOffset dx="3" dy="3" result="offsetblur"/><feComponentTransfer><feFuncA type="linear" slope="0.2"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          {#each shapes as shape (shape.id)}
            {@const isSelected = selectedShapeId === shape.id}
            {@const centerX = shape.width/2} {@const centerY = shape.height/2}
            <g transform="translate({shape.x}, {shape.y}) rotate({shape.rotation}, {centerX}, {centerY})" 
               class="outline-none group {toolMode === 'select' ? 'cursor-move' : ''}" style="opacity: {shape.opacity};"
               on:mousedown={(e) => { if(toolMode === 'select') handleMouseDown(e, 'drag', shape.id); }} 
               on:dblclick={(e) => { e.stopPropagation(); handleDoubleClick(shape.id); }} role="group">
              <g filter={shape.hasShadow ? 'url(#dropShadow)' : ''}>
                  {#if shape.type === 'image'} <image href={shape.url} width={shape.width} height={shape.height} preserveAspectRatio="none" />
                  {:else if shape.type === 'emoji'} 
                      <rect width={shape.width} height={shape.height} fill="transparent" /> <foreignObject width={shape.width} height={shape.height} style="pointer-events: none;"><div class="w-full h-full flex items-center justify-center" style="font-size: {Math.min(shape.width, shape.height) * 0.8}px; line-height: 1;">{shape.content}</div></foreignObject>
                  {:else if shape.type === 'pencil'} <path d={shape.pathData} fill="none" stroke={shape.stroke} stroke-width={shape.strokeWidth} stroke-linecap="round" stroke-linejoin="round"/> {#if toolMode === 'select'} <path d={shape.pathData} fill="none" stroke="transparent" stroke-width="20" /> {/if}
                  {:else if shape.type === 'arrow'}
                      {@const sw = Number(shape.strokeWidth)} {@const headLen = sw * 4} {@const headWide = sw * 3}
                      <line x1={shape.arrowStart?headLen:0} y1={centerY} x2={shape.arrowEnd?shape.width-headLen:shape.width} y2={centerY} stroke={shape.stroke} stroke-width={sw} stroke-linecap="butt" />
                      {#if shape.arrowStart} <path d="M {headLen} {centerY - headWide/2} L 0 {centerY} L {headLen} {centerY + headWide/2} Z" fill={shape.stroke} /> {/if}
                      {#if shape.arrowEnd} <path d="M {shape.width - headLen} {centerY - headWide/2} L {shape.width} {centerY} L {shape.width - headLen} {centerY + headWide/2} Z" fill={shape.stroke} /> {/if}
                      <line x1="0" y1={centerY} x2={shape.width} y2={centerY} stroke="transparent" stroke-width="20" />
                  {:else}
                      {#if shape.type === 'rectangle'} <rect width={shape.width} height={shape.height} fill={shape.fill} stroke={shape.stroke} stroke-width={shape.strokeWidth} rx={shape.radius}/>
                      {:else if shape.type === 'circle'} <ellipse cx={shape.width/2} cy={shape.height/2} rx={shape.width/2} ry={shape.height/2} fill={shape.fill} stroke={shape.stroke} stroke-width={shape.strokeWidth}/>
                      {:else if shape.type === 'triangle'} <polygon points="{shape.width/2},0 0,{shape.height} {shape.width},{shape.height}" fill={shape.fill} stroke={shape.stroke} stroke-width={shape.strokeWidth} stroke-linejoin="round"/>
                      {:else if shape.type === 'heart'} <path d="M{shape.width/2},{shape.height*0.3} C{shape.width/2},{shape.height*0.1} {shape.width*0.2},{shape.height*0.1} {shape.width*0.2},{shape.height*0.4} C{shape.width*0.2},{shape.height*0.6} {shape.width/2},{shape.height*0.9} {shape.width/2},{shape.height*0.9} C{shape.width/2},{shape.height*0.9} {shape.width*0.8},{shape.height*0.6} {shape.width*0.8},{shape.height*0.4} C{shape.width*0.8},{shape.height*0.1} {shape.width/2},{shape.height*0.1} {shape.width/2},{shape.height*0.3}" fill={shape.fill} stroke={shape.stroke} stroke-width={shape.strokeWidth} />
                      {:else if shape.type === 'star'} <polygon points="{shape.width*0.5},{shape.height*0.0} {shape.width*0.63},{shape.height*0.38} {shape.width*1.0},{shape.height*0.38} {shape.width*0.69},{shape.height*0.59} {shape.width*0.82},{shape.height*1.0} {shape.width*0.5},{shape.height*0.75} {shape.width*0.18},{shape.height*1.0} {shape.width*0.31},{shape.height*0.59} {shape.width*0.0},{shape.height*0.38} {shape.width*0.37},{shape.height*0.38}" fill={shape.fill} stroke={shape.stroke} stroke-width={shape.strokeWidth} stroke-linejoin="round"/>
                      {:else if shape.type === 'bubble'} <path d="M0,0 h{shape.width} v{shape.height*0.8} h-{shape.width*0.4} l-{shape.width*0.1},{shape.height*0.2} l-{shape.width*0.1},-{shape.height*0.2} h-{shape.width*0.4} z" fill={shape.fill} stroke={shape.stroke} stroke-width={shape.strokeWidth} />
                      {/if}
                      {#if shape.content} <foreignObject x="0" y="0" width={shape.width} height={shape.height} style="pointer-events: none;"><div class="w-full h-full flex items-center justify-center text-center p-2 break-words leading-tight" style="color: {shape.textColor}; font-size: {shape.fontSize}px; font-weight: bold;">{shape.content}</div></foreignObject> {/if}
                  {/if}
              </g>
              {#if isSelected && toolMode === 'select'}
                <rect x="-2" y="-2" width={shape.width+4} height={shape.height+4} fill="none" stroke="#2563eb" stroke-width="1" stroke-dasharray="4" class="pointer-events-none"/>
                <line x1={shape.width/2} y1="-2" x2={shape.width/2} y2="-30" stroke="#2563eb" stroke-width="1.5" />
                <g class="cursor-grab" on:mousedown={(e) => handleMouseDown(e, 'rotate')}><circle cx={shape.width/2} cy="-30" r="6" class="fill-white stroke-blue-600 stroke-2 hover:fill-blue-100" /></g>
                {@const h = 6}
                {#if shape.type === 'arrow'}
                      <rect x={-h} y={centerY-h} width={h*2} height={h*2} class="fill-white stroke-blue-600 stroke-2 cursor-ew-resize" on:mousedown={(e) => handleMouseDown(e, 'resize', null, 'l')} />
                      <rect x={shape.width-h} y={centerY-h} width={h*2} height={h*2} class="fill-white stroke-blue-600 stroke-2 cursor-ew-resize" on:mousedown={(e) => handleMouseDown(e, 'resize', null, 'r')} />
                {:else}
                      <rect x={-h} y={-h} width={h*2} height={h*2} class="fill-white stroke-blue-600 stroke-2 cursor-nwse-resize" on:mousedown={(e) => handleMouseDown(e, 'resize', null, 'tl')} />
                      <rect x={shape.width-h} y={-h} width={h*2} height={h*2} class="fill-white stroke-blue-600 stroke-2 cursor-nesw-resize" on:mousedown={(e) => handleMouseDown(e, 'resize', null, 'tr')} />
                      <rect x={-h} y={shape.height-h} width={h*2} height={h*2} class="fill-white stroke-blue-600 stroke-2 cursor-nesw-resize" on:mousedown={(e) => handleMouseDown(e, 'resize', null, 'bl')} />
                      <rect x={shape.width-h} y={shape.height-h} width={h*2} height={h*2} class="fill-white stroke-blue-600 stroke-2 cursor-nwse-resize" on:mousedown={(e) => handleMouseDown(e, 'resize', null, 'br')} />
                {/if}
              {/if}
            </g> 
          {/each}
        </svg>
      </main>
  </div>
</div>

{#if showEmojiPicker}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" on:click={() => { showEmojiPicker = false; shapeIdToReplace = null; }}>
        <div class="bg-white rounded-xl shadow-2xl w-[32rem] max-w-full h-[60vh] flex flex-col overflow-hidden animate-fade-in ring-1 ring-gray-200" on:click|stopPropagation>
            <div class="p-3 border-b border-gray-100 flex flex-col gap-2 bg-gray-50/50">
                <div class="flex items-center justify-between">
                    <span class="font-bold text-gray-700 ml-2">{shapeIdToReplace ? 'Changer l\'émoji' : 'Choisir un émoji'}</span>
                    <button on:click={() => { showEmojiPicker = false; shapeIdToReplace = null; }} class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>
                </div>
                <input type="text" bind:value={emojiSearch} placeholder="Rechercher (ex: feu, chat, smile...)" class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all" autoFocus />
            </div>
            <div class="flex overflow-x-auto no-scrollbar border-b border-gray-100 bg-white">
                 <button class="flex-1 py-3 text-xl hover:bg-gray-50 transition-colors border-b-2 {activeCategory === 'all' ? 'border-blue-500 bg-blue-50/50' : 'border-transparent'}" on:click={() => activeCategory = 'all'} title="Tous">⭐</button>
                 {#each Object.keys(emojiCategories) as cat}
                    <button class="flex-1 py-3 text-xl hover:bg-gray-50 transition-colors border-b-2 {activeCategory === cat ? 'border-blue-500 bg-blue-50/50' : 'border-transparent'}" on:click={() => activeCategory = cat} title={cat}>{
                        // @ts-ignore
                        categoryIcons[cat]
                    }</button>
                 {/each}
            </div>
            <div class="flex-1 overflow-y-auto p-4 bg-gray-50/30">
                 <div class="grid grid-cols-8 gap-2">
                     {#each filteredEmojis as emoji}
                        <button on:click={() => handleEmojiSelect(emoji)} class="aspect-square flex items-center justify-center text-3xl hover:bg-white hover:shadow-md rounded-lg transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-200">{emoji}</button>
                     {/each}
                 </div>
                 {#if filteredEmojis.length === 0}
                    <div class="flex flex-col items-center justify-center h-full text-gray-400"><span class="text-4xl mb-2">🕵️</span><span>Aucun émoji trouvé pour "{emojiSearch}"</span></div>
                 {/if}
            </div>
        </div>
    </div>
{/if}