/**
 * Admin Actions Page - Super Admin Dashboard for Managing Action Definitions
 */

import { useEffect, useState } from 'react';
import useActionsStore from '../store/actionsStore.js';
import useAuthStore from '../store/authStore.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminActions = () => {
  const navigate = useNavigate();
  const { actions, categories, fetchActions, fetchCategories, createAction, deleteAction } = useActionsStore();
  const { user } = useAuthStore();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Check if user is super admin
  useEffect(() => {
    if (user && user.role !== 'super_admin') {
      alert('Access denied. Super Admin only.');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchActions();
    fetchCategories();
  }, []);

  const filteredActions = selectedCategory 
    ? actions.filter(a => a.category === selectedCategory)
    : actions;

  const handleDeleteAction = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    await deleteAction(id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-primary-dark rounded">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Action Definitions</h1>
              <p className="text-gray-200 mt-1">Super Admin Dashboard</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Manage Actions</h2>
            <p className="text-gray-600 mt-1">{actions.length} total actions</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            Create Action
          </Button>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Categories ({actions.length})</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat} ({actions.filter(a => a.category === cat).length})
              </option>
            ))}
          </select>
        </div>

        {/* Actions List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActions.map(action => (
            <Card key={action._id}>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {action.logo && (
                      <img src={action.logo} alt="" className="w-6 h-6 rounded" />
                    )}
                    <h3 className="font-semibold text-gray-900 text-sm">{action.name}</h3>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <span className="ml-2 font-medium">{action.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Inputs:</span>
                    <span className="ml-2 font-medium">{action.inputSchema?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Method:</span>
                    <span className="ml-2 font-medium">{action.apiConfig?.method}</span>
                  </div>
                </div>
              </Card.Body>
              <Card.Footer className="flex justify-end space-x-2">
                <button
                  onClick={() => handleDeleteAction(action._id, action.name)}
                  className="p-2 text-red-600 hover:bg-gray-100 rounded"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </Card.Footer>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminActions;
