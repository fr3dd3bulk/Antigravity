import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetNodesQuery } from '../store/api';
import { addNode, updateNode } from '../store/workflowSlice';

export default function NodeSidebar() {
  const dispatch = useDispatch();
  const { selectedNode } = useSelector(state => state.workflow);
  const { data: availableNodes } = useGetNodesQuery();
  const [activeTab, setActiveTab] = useState('nodes');

  const handleAddNode = (nodeType) => {
    const nodeDef = availableNodes?.find(n => n.nodeType === nodeType);
    if (!nodeDef) return;

    const newNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: { x: Math.random() * 300, y: Math.random() * 300 },
      data: {
        label: nodeDef.name,
        color: nodeDef.color,
        shape: nodeDef.shape
      },
      style: {
        background: nodeDef.color,
        color: 'white',
        borderRadius: nodeDef.shape === 'circle' ? '50%' : '8px',
        padding: 10,
        minWidth: 150
      }
    };

    dispatch(addNode(newNode));
  };

  const handleUpdateNodeData = (field, value) => {
    if (!selectedNode) return;

    dispatch(updateNode({
      id: selectedNode.id,
      data: {
        ...selectedNode.data,
        [field]: value
      }
    }));
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4">
        <div className="flex border-b mb-4">
          <button
            className={`flex-1 py-2 ${activeTab === 'nodes' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}
            onClick={() => setActiveTab('nodes')}
          >
            Nodes
          </button>
          <button
            className={`flex-1 py-2 ${activeTab === 'config' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}
            onClick={() => setActiveTab('config')}
          >
            Configure
          </button>
        </div>

        {activeTab === 'nodes' && (
          <div>
            <h3 className="font-semibold mb-3">Available Nodes</h3>
            <div className="space-y-2">
              {availableNodes?.map(node => (
                <button
                  key={node.nodeType}
                  onClick={() => handleAddNode(node.nodeType)}
                  className="w-full p-3 text-left border rounded hover:bg-gray-50 transition"
                  style={{ borderLeftColor: node.color, borderLeftWidth: 4 }}
                >
                  <div className="font-medium">{node.name}</div>
                  <div className="text-xs text-gray-500">{node.category}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div>
            {selectedNode ? (
              <div>
                <h3 className="font-semibold mb-3">Node Configuration</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={selectedNode.data?.label || ''}
                      onChange={(e) => handleUpdateNodeData('label', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <input
                      type="text"
                      value={selectedNode.type || ''}
                      disabled
                      className="input bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Select a node to configure
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
