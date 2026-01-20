const MIN_WIDTH = 50;
const MIN_HEIGHT = 30;
const RESIZE_HANDLE_CLASS = 'resize-handle';

type DraggableOptions = {
    onMove: (x: number, y: number) => void;
    onResize: (width: number, height: number) => void;
};

type DragState = {
    isDragging: boolean;
    isResizing: boolean;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialWidth: number;
    initialHeight: number;
};

export function draggable(node: HTMLElement, { onMove, onResize }: DraggableOptions) {
    const state: DragState = {
        isDragging: false,
        isResizing: false,
        startX: 0,
        startY: 0,
        initialX: 0,
        initialY: 0,
        initialWidth: 0,
        initialHeight: 0
    };

    const handleMouseDown = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        state.isResizing = target.classList.contains(RESIZE_HANDLE_CLASS);
        state.isDragging = !state.isResizing;

        state.startX = e.clientX;
        state.startY = e.clientY;
        state.initialX = node.offsetLeft;
        state.initialY = node.offsetTop;
        state.initialWidth = node.offsetWidth;
        state.initialHeight = node.offsetHeight;

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - state.startX;
        const deltaY = e.clientY - state.startY;

        if (state.isDragging) {
            onMove(Math.max(0, state.initialX + deltaX), Math.max(0, state.initialY + deltaY));
        } else if (state.isResizing) {
            const newWidth = Math.max(MIN_WIDTH, state.initialWidth + deltaX);
            const newHeight = Math.max(MIN_HEIGHT, state.initialHeight + deltaY);
            onResize(newWidth, newHeight);
        }
    };

    const handleMouseUp = () => {
        state.isDragging = false;
        state.isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    node.addEventListener('mousedown', handleMouseDown);

    return {
        destroy() {
            node.removeEventListener('mousedown', handleMouseDown);
        }
    };
}
