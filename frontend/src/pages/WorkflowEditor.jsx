import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useGetWorkflowQuery, useUpdateWorkflowMutation, useExecuteWorkflowMutation } from '../store/api';
import { setCurrentWorkflow, markSaved } from '../store/workflowSlice';
import Navbar from '../components/Navbar';
import WorkflowEditor from '../components/WorkflowEditor';

export default function WorkflowEditorPage() {
  const { workflowId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { organizations } = useSelector(state => state.auth);
  const { nodes, edges, isDirty } = useSelector(state => state.workflow);
  const organizationId = organizations[0]?._id;

  const { data: workflow, isLoading } = useGetWorkflowQuery(
    { organizationId, workflowId },
    { skip: !organizationId || !workflowId }
  );

  const [updateWorkflow] = useUpdateWorkflowMutation();
  const [executeWorkflow] = useExecuteWorkflowMutation();

  useEffect(() => {
    if (workflow) {
      dispatch(setCurrentWorkflow(workflow));
    }
  }, [workflow, dispatch]);

  const handleSave = async () => {
    try {
      await updateWorkflow({
        organizationId,
        workflowId,
        nodes,
        edges
      }).unwrap();
      dispatch(markSaved());
      alert('Workflow saved successfully!');
    } catch (error) {
      alert('Failed to save workflow');
    }
  };

  const handleExecute = async () => {
    try {
      await executeWorkflow({
        organizationId,
        workflowId,
        triggerData: {}
      }).unwrap();
      alert('Workflow execution started!');
    } catch (error) {
      alert('Failed to execute workflow');
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="bg-gray-100 border-b px-4 py-2 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{workflow?.name || 'Untitled Workflow'}</h1>
          {isDirty && <span className="text-sm text-orange-500 ml-2">● Unsaved changes</span>}
        </div>
        <div className="space-x-2">
          <button onClick={handleSave} className="btn btn-primary" disabled={!isDirty}>
            Save
          </button>
          <button onClick={handleExecute} className="btn btn-secondary">
            Execute
          </button>
          <button onClick={() => navigate('/workflows')} className="btn btn-outline">
            Back
          </button>
        </div>
      </div>
      <WorkflowEditor />
    </div>
  );
}
