<script module>
    export function createShape(type: never) {
        return {
            shapeType: type,
            width: 0, 
            height: 0, 
            rotation: 0,
            fill: '#e0e7ff', 
            stroke: '#4338ca', 
            strokeWidth: 2, 
            opacity: 1
        };
    }
</script>

<script lang="ts">
	/**
	 * Forms.svelte
     * Svelte 5 component for managing Shapes in the sidebar (palette) 
     * and rendering them on the canvas.
	 */

	// --- TYPES ---
	export type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'star' | 'bubble' | 'heart' | 'arrow';
	
	export interface ShapeData {
		shapeType: ShapeType;
		width: number;
		height: number;
		rotation: number;
		fill: string;
		stroke: string;
		strokeWidth: number;
		opacity: number;
	}

	// --- PROPS ---
	let { 
		mode = 'sidebar', 
		data = $bindable(), 
        onSelect
	}: { 
		mode?: 'sidebar' | 'canvas'; 
		data?: ShapeData,
        onSelect?: (type: ShapeType) => void
	} = $props();

    // --- CONSTANTS ---
    const SHAPES: { type: ShapeType; icon: string; label: string }[] = [
        { type: 'rectangle', icon: '🟥', label: 'Rectangle' },
        { type: 'circle',    icon: '🔵', label: 'Cercle' },
        { type: 'triangle',  icon: '🔺', label: 'Triangle' },
        { type: 'star',      icon: '⭐', label: 'Étoile' },
        { type: 'heart',     icon: '❤️', label: 'Cœur' },
        { type: 'bubble',    icon: '💬', label: 'Bulle' },
        { type: 'arrow',     icon: '➡️', label: 'Flèche' },
    ];

	// --- SIDEBAR ACTIONS ---
    // No more drag handlers needed for sidebar buttons if we are clicking.
    
</script>

{#if mode === 'sidebar'}
    <!-- PALETTE MODE -->
    <div class="h-full flex flex-col bg-white">
        <div class="p-4 border-b border-gray-100">
            <h3 class="font-bold text-gray-800 text-sm uppercase tracking-wide">Formes</h3>
        </div>
        
        <div class="p-4 grid grid-cols-2 gap-3 overflow-y-auto">
            {#each SHAPES as shape}
                <button class="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-100 rounded-xl 
                    hover:bg-white hover:border-blue-400 hover:shadow-md cursor-pointer transition-all duration-200 group 
                    focus:ring-2 focus:ring-blue-200 focus:outline-none" onclick={() => onSelect?.(shape.type)} title={shape.label}>
                    <span class="text-3xl mb-2 group-hover:scale-110 transition-transform">{shape.icon}</span>
                    <span class="text-xs font-semibold text-gray-500 group-hover:text-blue-600">{shape.label}</span>
                </button>
            {/each}
        </div>
    </div>

{:else if mode === 'canvas' && data}
    <!-- CANVAS RENDER MODE -->
    <!-- 
        Pure SVG Renderer. 
        Mouse events (selection, drag) are handled externally by the parent. 
    -->
    <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${data.width} ${data.height}`} 
        class="block overflow-visible w-full h-full pointer-events-none" 
    >
        <g transform={`rotate(${data.rotation || 0}, ${data.width/2}, ${data.height/2})`} style:opacity={data.opacity}>
            
            {#if data.shapeType === 'rectangle'}
                <rect width={data.width} height={data.height} fill={data.fill} stroke={data.stroke} stroke-width={data.strokeWidth} rx="4" vector-effect="non-scaling-stroke" />
            
            {:else if data.shapeType === 'circle'}
                <ellipse cx={data.width/2} cy={data.height/2} rx={data.width/2} ry={data.height/2} fill={data.fill} stroke={data.stroke} stroke-width={data.strokeWidth} vector-effect="non-scaling-stroke"/>
            
            {:else if data.shapeType === 'triangle'}
                <polygon points={`${data.width/2},0 0,${data.height} ${data.width},${data.height}`} fill={data.fill} stroke={data.stroke} stroke-width={data.strokeWidth} stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
            
            {:else if data.shapeType === 'star'}
                <polygon points={`${data.width*0.5},0 ${data.width*0.63},${data.height*0.38} ${data.width},${data.height*0.38} ${data.width*0.69},${data.height*0.59} ${data.width*0.82},${data.height} ${data.width*0.5},${data.height*0.75} ${data.width*0.18},${data.height} ${data.width*0.31},${data.height*0.59} 0,${data.height*0.38} ${data.width*0.37},${data.height*0.38}`} fill={data.fill} stroke={data.stroke} stroke-width={data.strokeWidth} stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
            
            {:else if data.shapeType === 'heart'}
                 <path d={`M${data.width/2},${data.height*0.3} C${data.width/2},${data.height*0.1} ${data.width*0.2},${data.height*0.1} ${data.width*0.2},${data.height*0.4} C${data.width*0.2},${data.height*0.6} ${data.width/2},${data.height*0.9} ${data.width/2},${data.height*0.9} C${data.width/2},${data.height*0.9} ${data.width*0.8},${data.height*0.6} ${data.width*0.8},${data.height*0.4} C${data.width*0.8},${data.height*0.1} ${data.width/2},${data.height*0.1} ${data.width/2},${data.height*0.3}`} fill={data.fill} stroke={data.stroke} stroke-width={data.strokeWidth} vector-effect="non-scaling-stroke"/>

            {:else if data.shapeType === 'bubble'}
                 <path d={`M0,0 h${data.width} v${data.height*0.8} h-${data.width*0.4} l-${data.width*0.1},${data.height*0.2} l-${data.width*0.1},-${data.height*0.2} h-${data.width*0.4} z`} fill={data.fill} stroke={data.stroke} stroke-width={data.strokeWidth} vector-effect="non-scaling-stroke"/>

            {:else if data.shapeType === 'arrow'}
                {@const midY = data.height / 2}
                {@const stemThickness = data.height * 0.4}
                {@const headLength = Math.min(data.width, data.height)}
                
                <polygon 
                    points={`
                        0,${midY - stemThickness/2} 
                        ${data.width - headLength},${midY - stemThickness/2} 
                        ${data.width - headLength},${0} 
                        ${data.width},${midY} 
                        ${data.width - headLength},${data.height} 
                        ${data.width - headLength},${midY + stemThickness/2} 
                        0,${midY + stemThickness/2}
                    `} 
                    fill={data.fill} 
                    stroke={data.stroke} 
                    stroke-width={data.strokeWidth} 
                    stroke-linejoin="round"
                    vector-effect="non-scaling-stroke"
                />
            {/if}
        </g>
    </svg>
{/if}