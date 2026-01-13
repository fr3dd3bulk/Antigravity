import React, { useState } from 'react';
import { api } from '../store/api';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('plans');
  const { data: plans, refetch: refetchPlans } = api.endpoints.getPlans.useQuery();
  const { data: stats } = api.endpoints.getSystemStats?.useQuery() || {};

  return (
    <div className="min-h-screen bg-light p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-dark">Admin Panel</h1>

        <div className="flex border-b mb-6">
          <button
            className={`px-6 py-3 ${activeTab === 'stats' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}
            onClick={() => setActiveTab('stats')}
          >
            Statistics
          </button>
          <button
            className={`px-6 py-3 ${activeTab === 'plans' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}
            onClick={() => setActiveTab('plans')}
          >
            Plans
          </button>
          <button
            className={`px-6 py-3 ${activeTab === 'actions' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}
            onClick={() => setActiveTab('actions')}
          >
            Workflow Actions
          </button>
        </div>

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="text-xl font-semibold mb-2">Total Users</h3>
              <p className="text-4xl font-bold text-primary">{stats?.totalUsers || 0}</p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-2">Organizations</h3>
              <p className="text-4xl font-bold text-secondary">{stats?.totalOrganizations || 0}</p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-2">Active Subscriptions</h3>
              <p className="text-4xl font-bold text-accent">{stats?.activeSubscriptions || 0}</p>
            </div>
          </div>
        )}

        {activeTab === 'plans' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans?.map(plan => (
                <div key={plan._id} className="card">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      plan.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {plan.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  
                  <p className="text-3xl font-bold mb-4">
                    ${plan.price}
                    <span className="text-sm text-gray-600">/{plan.billingInterval}</span>
                  </p>
                  
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  
                  <div className="space-y-1 text-sm">
                    <div>Max Workflows: {plan.limits.maxWorkflows === -1 ? '∞' : plan.limits.maxWorkflows}</div>
                    <div>Active: {plan.limits.maxActiveWorkflows === -1 ? '∞' : plan.limits.maxActiveWorkflows}</div>
                    <div>Executions/mo: {plan.limits.maxExecutionsPerMonth === -1 ? '∞' : plan.limits.maxExecutionsPerMonth.toLocaleString()}</div>
                    <div>Concurrent: {plan.limits.maxConcurrentExecutions}</div>
                    <div>Trial: {plan.trialDays} days</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'actions' && <WorkflowActionsTab />}
      </div>
    </div>
  );
}

function WorkflowActionsTab() {
  const getWorkflowActionsQuery = api.endpoints.getWorkflowActions?.useQuery() || {};
  const { data: actions, isLoading, refetch } = getWorkflowActionsQuery;
  
  const getWorkflowActionStatsQuery = api.endpoints.getWorkflowActionStats?.useQuery() || {};
  const { data: actionStats } = getWorkflowActionStatsQuery;
  
  const disableWorkflowActionMutation = api.endpoints.disableWorkflowAction?.useMutation() || [];
  const [disableAction] = disableWorkflowActionMutation;
  
  const enableWorkflowActionMutation = api.endpoints.enableWorkflowAction?.useMutation() || [];
  const [enableAction] = enableWorkflowActionMutation;
  
  const syncWorkflowActionsMutation = api.endpoints.syncWorkflowActions?.useMutation() || [];
  const [syncActions] = syncWorkflowActionsMutation;
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const handleToggle = async (action) => {
    if (!disableAction || !enableAction) {
      alert('Workflow action management is not available');
      return;
    }
    
    if (action.enabled) {
      const reason = prompt('Please provide a reason for disabling this action:');
      if (!reason) return;
      
      try {
        await disableAction({ actionId: action.actionId, reason }).unwrap();
        if (refetch) refetch();
        alert(`Action disabled. ${action.workflowCount || 0} workflows have been deactivated.`);
      } catch (error) {
        alert('Error disabling action: ' + (error.data?.message || error.message));
      }
    } else {
      try {
        await enableAction({ actionId: action.actionId }).unwrap();
        if (refetch) refetch();
        alert('Action enabled successfully');
      } catch (error) {
        alert('Error enabling action: ' + (error.data?.message || error.message));
      }
    }
  };

  const handleSync = async () => {
    if (!syncActions) {
      alert('Workflow action sync is not available');
      return;
    }
    
    try {
      const result = await syncActions().unwrap();
      if (refetch) refetch();
      alert(result.message || 'Workflow actions synced successfully');
    } catch (error) {
      alert('Error syncing actions: ' + (error.data?.message || error.message));
    }
  };

  const filteredActions = actions?.filter(action => {
    if (selectedCategory !== 'all' && action.category !== selectedCategory) return false;
    if (selectedStatus === 'enabled' && !action.enabled) return false;
    if (selectedStatus === 'disabled' && action.enabled) return false;
    return true;
  }) || [];

  if (isLoading) {
    return <div className="text-center py-8">Loading workflow actions...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-4">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="all">All Categories</option>
            <option value="trigger">Triggers</option>
            <option value="action">Actions</option>
            <option value="condition">Conditions</option>
            <option value="utility">Utilities</option>
            <option value="ai">AI/LLM</option>
          </select>

          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="all">All Status</option>
            <option value="enabled">Enabled Only</option>
            <option value="disabled">Disabled Only</option>
          </select>
        </div>

        <button 
          onClick={handleSync}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Sync Actions
        </button>
      </div>

      {actionStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card">
            <h4 className="text-sm text-gray-600">Total Actions</h4>
            <p className="text-2xl font-bold">{actionStats.total}</p>
          </div>
          <div className="card">
            <h4 className="text-sm text-gray-600">Enabled</h4>
            <p className="text-2xl font-bold text-green-600">{actionStats.enabled}</p>
          </div>
          <div className="card">
            <h4 className="text-sm text-gray-600">Disabled</h4>
            <p className="text-2xl font-bold text-red-600">{actionStats.disabled}</p>
          </div>
          <div className="card">
            <h4 className="text-sm text-gray-600">Categories</h4>
            <p className="text-2xl font-bold">{actionStats.byCategory?.length || 0}</p>
          </div>
        </div>
      )}

      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Category</th>
              <th className="text-left py-3 px-4">Usage</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredActions.map(action => (
              <tr key={action._id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div>
                    <div className="font-semibold">{action.name}</div>
                    <div className="text-sm text-gray-600">{action.actionId}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {action.category}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm">
                    <div>{action.usageCount || 0} executions</div>
                    {action.lastUsedAt && (
                      <div className="text-gray-500">
                        Last: {new Date(action.lastUsedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    action.enabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {action.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  {!action.enabled && action.disableReason && (
                    <div className="text-xs text-gray-500 mt-1">
                      Reason: {action.disableReason}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleToggle(action)}
                    disabled={action.isCore && action.enabled}
                    className={`px-3 py-1 rounded text-sm ${
                      action.isCore && action.enabled
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : action.enabled
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {action.isCore && action.enabled ? 'Core Action' : action.enabled ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredActions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No workflow actions found
          </div>
        )}
      </div>
    </div>
  );
}
