<script lang="ts">
    import { Handle, Position } from "@xyflow/svelte";

    let { data, isConnectable } = $props();
</script>

<div
    class="custom-node"
    ondblclick={() => (window.location.href += `/${data.slideId}`)}
    role="button"
    tabindex="0"
>
    <!-- Top Handles -->
    <Handle
        type="target"
        position={Position.Top}
        id="target-top"
        style="left: 50%; background: #555;"
        {isConnectable}
    />
    <Handle
        type="source"
        position={Position.Top}
        id="source-top"
        style="left: 50%; background: #555;"
        {isConnectable}
    />

    <!-- Left Handles -->
    <Handle
        type="target"
        position={Position.Left}
        id="target-left"
        style="top: 50%; background: #555;"
        {isConnectable}
    />
    <Handle
        type="source"
        position={Position.Left}
        id="source-left"
        style="top: 50%; background: #555;"
        {isConnectable}
    />

    <div class="node-content">
        {#if data.thumbnail}
            <img src={data.thumbnail} alt={data.title} class="node-thumbnail" />
        {/if}
        <strong class="node-title">{data.title}</strong>
        <div class="node-elements">{data.elementCount} elements</div>
    </div>

    <!-- Right Handle -->
    <Handle
        type="target"
        position={Position.Right}
        id="target-right"
        style="top: 50%; background: #555;"
        {isConnectable}
    />
    <Handle
        type="source"
        position={Position.Right}
        id="source-right"
        style="top: 50%; background: #555;"
        {isConnectable}
    />

    <!-- Bottom Handles -->
    <Handle
        type="target"
        position={Position.Bottom}
        id="target-bottom"
        style="left: 50%; background: #555;"
        {isConnectable}
    />
    <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
        style="left: 50%; background: #555;"
        {isConnectable}
    />
</div>

<style>
    .custom-node {
        padding: 10px;
        border-radius: 5px;
        background: #fff;
        border: 1px solid #777;
        min-width: 140px;
        font-size: 12px;
        text-align: center;
    }

    .node-thumbnail {
        width: 100%;
        height: 80px;
        object-fit: cover;
        border-radius: 4px;
        margin-bottom: 8px;
    }

    .node-title {
        display: block;
        font-weight: bold;
        margin-bottom: 4px;
        word-break: break-word;
    }

    .node-elements {
        font-size: 10px;
        color: #666;
    }

    .node-type {
        font-size: 10px;
        color: #555;
        margin-top: 4px;
    }
</style>
