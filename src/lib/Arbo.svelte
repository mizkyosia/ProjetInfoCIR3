<script>
  import { SvelteFlow, Background, Controls, MiniMap } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';

  const initialNodes = [
    { id: 'root', position: { x: 50, y: 0 }, data: { label: 'Project' }},
    
    { id: 'src', position: { x: 50, y: 100 }, data: { label: 'src' } },
    { id: 'routes', position: { x: 0, y: 200 }, data: { label: 'routes' } },
    { id: 'lib', position: { x: 100, y: 200 }, data: { label: 'lib' } },
    { id: 'home', position: { x: -20, y: 300 }, data: { label: 'home' } },
    { id: 'Arbo', position: { x: 80, y: 300 }, data: { label: 'Arborescence' } },
    { id: 'Forms', position: { x: 180, y: 300 }, data: { label: 'Forms' } },
    { id: 'Fullscreen ', position: { x: 280, y: 300 }, data: { label: 'Fullscreen' } },
    { id: 'Quizz', position: { x: 380, y: 300 }, data: { label: 'Quizz' } },
    {id: 'Resize', position: { x: 480, y: 300 }, data: { label: 'Resize' } },
  ];

  const initialEdges = [
    { id: 'e1', source: 'root', target: 'src' },
    { id: 'e2', source: 'src', target: 'routes' },
    { id: 'e3', source: 'src', target: 'lib' },
    { id: 'e4', source: 'routes', target: 'home' },
    { id: 'e5', source: 'lib', target: 'Arbo' },
    { id: 'e6', source: 'lib', target: 'Forms' },
    { id: 'e7', source: 'lib', target: 'Fullscreen ' },
    { id: 'e8', source: 'lib', target: 'Quizz' },
    { id: 'e9', source: 'lib', target: 'Resize' },

  ];
  
  let nodes = $state.raw(initialNodes);
  let edges = $state.raw(initialEdges);
</script>
 
<div style="width: 100%; height: 100%;">
  <SvelteFlow 
    bind:nodes 
    bind:edges 
    fitView
  >
    <MiniMap />
    <Background />
    <Controls />
  </SvelteFlow>
</div>