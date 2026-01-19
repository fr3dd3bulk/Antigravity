/**
 * Dashboard - List of Workflows
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useWorkflowStore from '../store/workflowStore.js';
import useAuthStore from '../store/authStore.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Plus, Play, Trash2, Edit, LogOut } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { workflows, fetchWorkflows, createWorkflow, deleteWorkflow, executeWorkflow } = useWorkflowStore();
  const { user, organization, logout } = useAuthStore();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDesc, setNewWorkflowDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleCreateWorkflow = async () => {
    if (!newWorkflowName.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    setIsCreating(true);
    const result = await createWorkflow({
      name: newWorkflowName,
      description: newWorkflowDesc,
    });

    setIsCreating(false);

    if (result.success) {
      setIsCreateModalOpen(false);
      setNewWorkflowName('');
      setNewWorkflowDesc('');
      navigate(`/workflows/${result.workflow._id}`);
    } else {
      alert(`Failed to create workflow: ${result.error}`);
    }
  };

  const handleDeleteWorkflow = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    const result = await deleteWorkflow(id);
    if (!result.success) {
      alert(`Failed to delete: ${result.error}`);
    }
  };

  const handleExecuteWorkflow = async (id, name) => {
    const result = await executeWorkflow(id);
    if (result.success) {
      alert(`Workflow "${name}" is executing! Job ID: ${result.data.jobId}`);
    } else {
      alert(`Failed to execute: ${result.error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Antigravity</h1>
              <p className="text-gray-200 mt-1">Meta-Driven Automation Platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs text-gray-200">{organization?.name}</div>
              </div>
              <button
                onClick={logout}
                className="p-2 hover:bg-primary-dark rounded-md transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">My Workflows</h2>
            <p className="text-gray-600 mt-1">{workflows.length} workflows</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            Create Workflow
          </Button>
        </div>

        {/* Workflows Grid */}
        {workflows.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">No workflows yet</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Create Your First Workflow
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <Card key={workflow._id} hover>
                <Card.Header>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {workflow.name}
                  </h3>
                  {workflow.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {workflow.description}
                    </p>
                  )}
                </Card.Header>
                
                <Card.Body>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Nodes:</span>
                      <span className="font-medium">{workflow.nodes?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={`font-medium ${workflow.active ? 'text-green-600' : 'text-gray-400'}`}>
                        {workflow.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Executions:</span>
                      <span className="font-medium">{workflow.executionCount || 0}</span>
                    </div>
                  </div>
                </Card.Body>

                <Card.Footer className="flex justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/workflows/${workflow._id}`)}
                      className="p-2 text-primary hover:bg-gray-100 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleExecuteWorkflow(workflow._id, workflow.name)}
                      className="p-2 text-green-600 hover:bg-gray-100 rounded transition-colors"
                      title="Execute"
                      disabled={!workflow.nodes || workflow.nodes.length === 0}
                    >
                      <Play size={18} />
                    </button>
                  </div>
                  <button
                    onClick={() => handleDeleteWorkflow(workflow._id, workflow.name)}
                    className="p-2 text-red-600 hover:bg-gray-100 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </Card.Footer>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Workflow Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setNewWorkflowName('');
          setNewWorkflowDesc('');
        }}
        title="Create New Workflow"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workflow Name *
            </label>
            <input
              type="text"
              value={newWorkflowName}
              onChange={(e) => setNewWorkflowName(e.target.value)}
              placeholder="e.g., Send Welcome Email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={newWorkflowDesc}
              onChange={(e) => setNewWorkflowDesc(e.target.value)}
              placeholder="What does this workflow do?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                setNewWorkflowName('');
                setNewWorkflowDesc('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateWorkflow}
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Workflow'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
