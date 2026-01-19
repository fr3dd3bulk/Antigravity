import { create } from 'zustand';
import { authAPI } from '../api/index.js';

const useAuthStore = create((set) => ({
  user: null,
  organization: null,
  token: localStorage.getItem('authToken'),
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(credentials);
      const { token, user, organization } = response.data;
      
      localStorage.setItem('authToken', token);
      set({
        user,
        organization,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register(userData);
      const { token, user, organization } = response.data;
      
      localStorage.setItem('authToken', token);
      set({
        user,
        organization,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    set({
      user: null,
      organization: null,
      token: null,
      isAuthenticated: false,
    });
  },

  fetchCurrentUser: async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      set({ isAuthenticated: false });
      return;
    }

    set({ isLoading: true });
    try {
      const response = await authAPI.getCurrentUser();
      const { user, organization } = response.data;
      
      set({
        user,
        organization,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      localStorage.removeItem('authToken');
      set({
        user: null,
        organization: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));

export default useAuthStore;
