import React from 'react';
import { useGetExecutionsQuery } from '../store/api';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function ExecutionHistory() {
  const { organizations } = useSelector(state => state.auth);
  const organizationId = organizations[0]?._id;

  const { data, isLoading } = useGetExecutionsQuery(
    { organizationId },
    { skip: !organizationId }
  );

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-light p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-dark">Execution History</h1>
        
        <div className="card">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Workflow</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Mode</th>
                <th className="text-left py-3 px-4">Started</th>
                <th className="text-left py-3 px-4">Duration</th>
              </tr>
            </thead>
            <tbody>
              {data?.executions?.map(execution => (
                <tr key={execution._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Link 
                      to={`/executions/${execution._id}`}
                      className="text-primary hover:underline"
                    >
                      {execution.workflowId?.name || 'Unknown'}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      execution.status === 'success' ? 'bg-green-100 text-green-800' :
                      execution.status === 'error' ? 'bg-red-100 text-red-800' :
                      execution.status === 'running' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {execution.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{execution.mode}</td>
                  <td className="py-3 px-4">
                    {new Date(execution.startedAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    {execution.duration ? `${(execution.duration / 1000).toFixed(2)}s` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
