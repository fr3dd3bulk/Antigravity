/**
 * WorkflowEditor - The Main Canvas Page
 * React Flow-based visual workflow editor
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

import useWorkflowStore from '../store/workflowStore.js';
import useActionsStore from '../store/actionsStore.js';
import Sidebar from '../components/canvas/Sidebar.jsx';
import CustomNode from '../components/canvas/CustomNode.jsx';
import Modal from '../components/ui/Modal.jsx';
import DynamicNodeForm from '../components/forms/DynamicNodeForm.jsx';
import Button from '../components/ui/Button.jsx';
import { Save, Play, ArrowLeft } from 'lucide-react';

const nodeTypes = {
  actionNode: CustomNode,
};

const WorkflowEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const { currentWorkflow, fetchWorkflow, updateWorkflow, executeWorkflow } = useWorkflowStore();
  const { actions, categories, fetchActions, fetchCategories } = useActionsStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Load workflow and actions
  useEffect(() => {
    fetchActions();
    fetchCategories();
    
    if (id) {
      fetchWorkflow(id);
    }
  }, [id]);

  // Sync nodes and edges from workflow
  useEffect(() => {
    if (currentWorkflow) {
      setNodes(currentWorkflow.nodes || []);
      setEdges(currentWorkflow.edges || []);
    }
  }, [currentWorkflow]);

  // Handle node connection
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  // Handle drag over
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop - Add new node
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const data = JSON.parse(event.dataTransfer.getData('application/reactflow'));

      if (!reactFlowInstance) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `node_${Date.now()}`,
        type: 'actionNode',
        position,
        data: {
          ...data,
          inputs: {},
          onSettings: (nodeData) => {
            const node = nodes.find(n => n.data === nodeData);
            if (node) {
              setSelectedNode(node);
              setIsSettingsOpen(true);
            }
          },
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, nodes, setNodes]
  );

  // Handle node settings save
  const handleSaveNodeSettings = (updatedInputs) => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              inputs: updatedInputs,
            },
          };
        }
        return node;
      })
    );

    setIsSettingsOpen(false);
    setSelectedNode(null);
  };

  // Save workflow
  const handleSave = async () => {
    if (!currentWorkflow) return;

    setIsSaving(true);
    const result = await updateWorkflow(currentWorkflow._id, {
      nodes,
      edges,
    });

    setIsSaving(false);
    
    if (result.success) {
      alert('Workflow saved successfully!');
    } else {
      alert(`Failed to save: ${result.error}`);
    }
  };

  // Execute workflow
  const handleExecute = async () => {
    if (!currentWorkflow) return;

    setIsExecuting(true);
    const result = await executeWorkflow(currentWorkflow._id);
    setIsExecuting(false);

    if (result.success) {
      alert(`Workflow executed! Job ID: ${result.data.jobId}`);
    } else {
      alert(`Failed to execute: ${result.error}`);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar with Actions */}
      <Sidebar />

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {currentWorkflow?.name || 'Untitled Workflow'}
              </h1>
              <p className="text-sm text-gray-500">
                {nodes.length} nodes, {edges.length} connections
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={isSaving || !currentWorkflow}
            >
              <Save size={16} className="mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={handleExecute}
              disabled={isExecuting || !currentWorkflow || nodes.length === 0}
            >
              <Play size={16} className="mr-2" />
              {isExecuting ? 'Executing...' : 'Execute'}
            </Button>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap 
              nodeColor="#571B0A"
              maskColor="rgba(0, 0, 0, 0.1)"
            />
          </ReactFlow>
        </div>
      </div>

      {/* Node Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          setSelectedNode(null);
        }}
        title={`Configure: ${selectedNode?.data.actionName}`}
        size="lg"
      >
        {selectedNode && (
          <>
            <DynamicNodeForm
              inputSchema={selectedNode.data.inputSchema}
              values={selectedNode.data.inputs}
              onChange={(values) => {
                // Update in real-time
                setSelectedNode({
                  ...selectedNode,
                  data: {
                    ...selectedNode.data,
                    inputs: values,
                  },
                });
              }}
            />
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsSettingsOpen(false);
                  setSelectedNode(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleSaveNodeSettings(selectedNode.data.inputs)}
              >
                Save Configuration
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default WorkflowEditor;
