<script>
    import { Handle, Position } from "@xyflow/svelte";

    export let data;
    export let isConnectable;
</script>

<div class="custom-node">
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
        <strong>{data.label}</strong>
        {#if data.type}
            <div class="node-type">{data.type}</div>
        {/if}
        {#if data.description}
            <div class="node-desc">{data.description}</div>
        {/if}
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
        min-width: 100px;
        font-size: 12px;
        text-align: center;
    }

    .node-type {
        font-size: 10px;
        color: #555;
        margin-top: 4px;
    }
</style>
