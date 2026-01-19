import { create } from 'zustand';
import { actionsAPI } from '../api/index.js';

const useActionsStore = create((set, get) => ({
  actions: [],
  categories: [],
  isLoading: false,
  error: null,

  fetchActions: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await actionsAPI.listActions(params);
      set({ actions: response.data.actions, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch actions', isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const response = await actionsAPI.getCategories();
      set({ categories: response.data.categories });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch categories' });
    }
  },

  createAction: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await actionsAPI.createAction(data);
      set({
        actions: [...get().actions, response.data.action],
        isLoading: false,
      });
      return { success: true, action: response.data.action };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create action';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateAction: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await actionsAPI.updateAction(id, data);
      set({
        actions: get().actions.map(a => a._id === id ? response.data.action : a),
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update action';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  deleteAction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await actionsAPI.deleteAction(id);
      set({
        actions: get().actions.filter(a => a._id !== id),
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete action';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },
}));

export default useActionsStore;
