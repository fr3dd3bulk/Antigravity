import React from 'react';
import { Link } from 'react-router-dom';
import { useGetWorkflowsQuery, useGetExecutionsQuery } from '../store/api';
import { useSelector } from 'react-redux';

export default function Dashboard() {
  const { organizations } = useSelector(state => state.auth);
  const organizationId = organizations[0]?._id;

  const { data: workflows } = useGetWorkflowsQuery(
    { organizationId },
    { skip: !organizationId }
  );

  const { data: executions } = useGetExecutionsQuery(
    { organizationId, limit: 5 },
    { skip: !organizationId }
  );

  return (
    <div className="min-h-screen bg-light p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-dark">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h3 className="text-xl font-semibold mb-2">Total Workflows</h3>
            <p className="text-4xl font-bold text-primary">
              {workflows?.total || 0}
            </p>
          </div>
          
          <div className="card">
            <h3 className="text-xl font-semibold mb-2">Active Workflows</h3>
            <p className="text-4xl font-bold text-secondary">
              {workflows?.workflows?.filter(w => w.isActive).length || 0}
            </p>
          </div>
          
          <div className="card">
            <h3 className="text-xl font-semibold mb-2">Recent Executions</h3>
            <p className="text-4xl font-bold text-accent">
              {executions?.total || 0}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Recent Workflows</h2>
              <Link to="/workflows" className="text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {workflows?.workflows?.slice(0, 5).map(workflow => (
                <div key={workflow._id} className="border-b pb-3 last:border-b-0">
                  <Link 
                    to={`/workflows/${workflow._id}`}
                    className="font-medium hover:text-primary"
                  >
                    {workflow.name}
                  </Link>
                  <p className="text-sm text-gray-600">
                    {workflow.isActive ? '🟢 Active' : '⚪ Inactive'}
                  </p>
                </div>
              ))}
              {!workflows?.workflows?.length && (
                <p className="text-gray-500">No workflows yet</p>
              )}
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Recent Executions</h2>
              <Link to="/executions" className="text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {executions?.executions?.map(execution => (
                <div key={execution._id} className="border-b pb-3 last:border-b-0">
                  <div className="font-medium">{execution.workflowId?.name}</div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span className={
                      execution.status === 'success' ? 'text-green-600' :
                      execution.status === 'error' ? 'text-red-600' :
                      'text-yellow-600'
                    }>
                      {execution.status}
                    </span>
                    <span>{new Date(execution.startedAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {!executions?.executions?.length && (
                <p className="text-gray-500">No executions yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
