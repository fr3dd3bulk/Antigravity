import { create } from 'zustand';
import { workflowsAPI } from '../api/index.js';

const useWorkflowStore = create((set, get) => ({
  workflows: [],
  currentWorkflow: null,
  executions: [],
  isLoading: false,
  error: null,

  fetchWorkflows: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await workflowsAPI.listWorkflows();
      set({ workflows: response.data.workflows, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch workflows', isLoading: false });
    }
  },

  fetchWorkflow: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await workflowsAPI.getWorkflow(id);
      set({ currentWorkflow: response.data.workflow, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch workflow', isLoading: false });
    }
  },

  createWorkflow: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await workflowsAPI.createWorkflow(data);
      const newWorkflow = response.data.workflow;
      set({
        workflows: [...get().workflows, newWorkflow],
        currentWorkflow: newWorkflow,
        isLoading: false,
      });
      return { success: true, workflow: newWorkflow };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create workflow';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateWorkflow: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await workflowsAPI.updateWorkflow(id, data);
      const updatedWorkflow = response.data.workflow;
      
      set({
        workflows: get().workflows.map(w => w._id === id ? updatedWorkflow : w),
        currentWorkflow: updatedWorkflow,
        isLoading: false,
      });
      
      return { success: true, workflow: updatedWorkflow };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update workflow';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  deleteWorkflow: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await workflowsAPI.deleteWorkflow(id);
      set({
        workflows: get().workflows.filter(w => w._id !== id),
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete workflow';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  executeWorkflow: async (id, triggerData = {}) => {
    try {
      const response = await workflowsAPI.executeWorkflow(id, triggerData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to execute workflow' };
    }
  },

  fetchExecutions: async (id, limit = 50) => {
    try {
      const response = await workflowsAPI.getExecutions(id, limit);
      set({ executions: response.data.executions });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch executions' });
    }
  },
}));

export default useWorkflowStore;
