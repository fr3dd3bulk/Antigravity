import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useDispatch, useSelector } from 'react-redux';
import { setNodes, setEdges, setSelectedNode } from '../store/workflowSlice';
import NodeSidebar from './NodeSidebar';

export default function WorkflowEditor() {
  const dispatch = useDispatch();
  const { nodes: storeNodes, edges: storeEdges } = useSelector(state => state.workflow);

  const [nodes, setNodesState, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdgesState, onEdgesChange] = useEdgesState(storeEdges);

  useEffect(() => {
    setNodesState(storeNodes);
    setEdgesState(storeEdges);
  }, [storeNodes, storeEdges]);

  const onConnect = useCallback((params) => {
    const newEdges = addEdge(params, edges);
    setEdgesState(newEdges);
    dispatch(setEdges(newEdges));
  }, [edges, dispatch]);

  const onNodeClick = useCallback((event, node) => {
    dispatch(setSelectedNode(node));
  }, [dispatch]);

  const onNodesChangeWrapper = useCallback((changes) => {
    onNodesChange(changes);
    const updatedNodes = nodes.map(node => {
      const change = changes.find(c => c.id === node.id);
      if (change && change.type === 'position' && change.position) {
        return { ...node, position: change.position };
      }
      return node;
    });
    dispatch(setNodes(updatedNodes));
  }, [nodes, onNodesChange, dispatch]);

  return (
    <div className="flex h-screen">
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChangeWrapper}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
      <NodeSidebar />
    </div>
  );
}
