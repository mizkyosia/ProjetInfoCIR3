<script lang="ts">
  import { SvelteFlow, Background, Controls, type Edge, type Node , MarkerType, addEdge, type Connection}  from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';
  import CustomNode from './Node/CustomNode.svelte';
  import CustomEdgeMarker from './Node/CustomEdgeMarker.svelte';
  const nodeTypes = {
    custom: CustomNode,
  };
  const edgeTypes = {
    customEdge: CustomEdgeMarker
    
  };
  let nodes = $state.raw([]);
  let edges = $state.raw([]);
  let showModal = $state(false);
  let newNodeData = $state({
      label: '',
      type: 'default',
      description: ''
  });

  function onConnect(connection: Connection) {
    edges = addEdge(connection, edges);
  }

// Functions to handle modal
  function openModal() {
      showModal = true;
      newNodeData = { label: '', type: 'default', description: '' };

  }

  function closeModal() {
      showModal = false;
  }

  function addNode() {
      const id = crypto.randomUUID();
      const newNode = {
          id,
          type: 'custom', 
          position: { x: Math.random() * 500, y: Math.random() * 300 },
          data: { ...newNodeData }
      };
      
      nodes = [...nodes, newNode];
      closeModal();
  }
</script>
 
<div style="width: 100%; height: 100%; position: relative;">
  <button class="add-btn" onclick={openModal}>Add Custom Node</button>

  {#if showModal}
    <div class="modal-overlay">
        <div class="modal">
            <h3>Add New Node</h3>
            
            <label>
                Type:
                <select bind:value={newNodeData.type}>
                    <option value="default">Default</option>
                    <option value="input">Input</option>
                    <option value="output">Output</option>
                    <option value="service">Service</option>
                </select>
            </label>

            <label>
                Name:
                <input type="text" bind:value={newNodeData.label} placeholder="Node Name" />
            </label>

            <label>
                Description:
                <textarea bind:value={newNodeData.description} placeholder="Description (optional)"></textarea>
            </label>

            <div class="modal-actions">
                <button onclick={closeModal}>Cancel</button>
                <button onclick={addNode}>Add</button>
            </div>
        </div>
    </div>
  {/if}

  <SvelteFlow 
    bind:nodes 
    bind:edges 
    {nodeTypes} 
    fitView
    onconnect={onConnect}
    defaultEdgeOptions={{
      markerStart: {
      type: MarkerType.ArrowClosed,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    }}
  >
      <CustomEdgeMarker />
      <Background />
      <Controls />
  </SvelteFlow>
</div>

<style>
.add-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  padding: 8px 16px;
  background: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  z-index: 20;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal label {
    display: flex;
    flex-direction: column;
    font-size: 14px;
    gap: 4px;
}

.modal input, .modal select, .modal textarea {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.modal-actions button {
    padding: 6px 12px;
    cursor: pointer;
}
</style>