// Action pour gérer le drag et resize des boutons
export function draggable(node, { onMove, onResize }) {
    let isDragging = false;
    let isResizing = false;
    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;
    let initialWidth = 0;
    let initialHeight = 0;

    function handleMouseDown(e) {
        if (e.target.classList.contains('resize-handle')) {
            isResizing = true;
        } else {
            isDragging = true;
        }
        startX = e.clientX;
        startY = e.clientY;
        initialX = node.offsetLeft;
        initialY = node.offsetTop;
        initialWidth = node.offsetWidth;
        initialHeight = node.offsetHeight;

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    function handleMouseMove(e) {
        if (isDragging) {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            onMove(Math.max(0, initialX + deltaX), Math.max(0, initialY + deltaY));
        }
        if (isResizing) {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            const newWidth = Math.max(50, initialWidth + deltaX);
            const newHeight = Math.max(30, initialHeight + deltaY);
            onResize(newWidth, newHeight);
        }
    }

    function handleMouseUp() {
        isDragging = false;
        isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }

    node.addEventListener('mousedown', handleMouseDown);

    return {
        destroy() {
            node.removeEventListener('mousedown', handleMouseDown);
        }
    };
}
