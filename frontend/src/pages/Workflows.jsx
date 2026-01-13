import React from 'react';
import { Link } from 'react-router-dom';
import { useGetWorkflowsQuery, useDeleteWorkflowMutation, useCreateWorkflowMutation } from '../store/api';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';

export default function WorkflowsPage() {
  const { organizations } = useSelector(state => state.auth);
  const organizationId = organizations[0]?._id;

  const { data, isLoading, refetch } = useGetWorkflowsQuery(
    { organizationId },
    { skip: !organizationId }
  );

  const [deleteWorkflow] = useDeleteWorkflowMutation();
  const [createWorkflow] = useCreateWorkflowMutation();

  const handleDelete = async (workflowId) => {
    if (!window.confirm('Are you sure you want to delete this workflow?')) return;

    try {
      await deleteWorkflow({ organizationId, workflowId }).unwrap();
      refetch();
    } catch (error) {
      alert('Failed to delete workflow');
    }
  };

  const handleCreate = async () => {
    const name = window.prompt('Enter workflow name:');
    if (!name) return;

    try {
      const result = await createWorkflow({
        organizationId,
        name,
        description: ''
      }).unwrap();
      
      window.location.href = `/workflows/${result._id}`;
    } catch (error) {
      alert('Failed to create workflow');
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-light p-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-dark">Workflows</h1>
            <button onClick={handleCreate} className="btn btn-primary">
              + New Workflow
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.workflows?.map(workflow => (
              <div key={workflow._id} className="card hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{workflow.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    workflow.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {workflow.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                {workflow.description && (
                  <p className="text-gray-600 text-sm mb-4">{workflow.description}</p>
                )}
                
                <div className="text-xs text-gray-500 mb-4">
                  <div>Nodes: {workflow.nodes?.length || 0}</div>
                  <div>Executions: {workflow.executionCount || 0}</div>
                  <div>Updated: {new Date(workflow.updatedAt).toLocaleDateString()}</div>
                </div>

                <div className="flex space-x-2">
                  <Link
                    to={`/workflows/${workflow._id}`}
                    className="flex-1 btn btn-primary text-center text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(workflow._id)}
                    className="btn btn-outline text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {!data?.workflows?.length && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 mb-4">No workflows yet</p>
                <button onClick={handleCreate} className="btn btn-primary">
                  Create Your First Workflow
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
