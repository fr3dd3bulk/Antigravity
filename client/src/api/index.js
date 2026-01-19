import apiClient from './client.js';

export const authAPI = {
  register: (data) => apiClient.post('/api/auth/register', data),
  login: (data) => apiClient.post('/api/auth/login', data),
  getCurrentUser: () => apiClient.get('/api/auth/me'),
};

export const actionsAPI = {
  listActions: (params) => apiClient.get('/api/actions', { params }),
  getAction: (id) => apiClient.get(`/api/actions/${id}`),
  createAction: (data) => apiClient.post('/api/actions', data),
  updateAction: (id, data) => apiClient.put(`/api/actions/${id}`, data),
  deleteAction: (id) => apiClient.delete(`/api/actions/${id}`),
  getCategories: () => apiClient.get('/api/actions/categories'),
};

export const workflowsAPI = {
  listWorkflows: () => apiClient.get('/api/workflows'),
  getWorkflow: (id) => apiClient.get(`/api/workflows/${id}`),
  createWorkflow: (data) => apiClient.post('/api/workflows', data),
  updateWorkflow: (id, data) => apiClient.put(`/api/workflows/${id}`, data),
  deleteWorkflow: (id) => apiClient.delete(`/api/workflows/${id}`),
  executeWorkflow: (id, triggerData) => apiClient.post(`/api/workflows/${id}/execute`, { triggerData }),
  getExecutions: (id, limit) => apiClient.get(`/api/workflows/${id}/executions`, { params: { limit } }),
};

export const orgsAPI = {
  getOrganization: () => apiClient.get('/api/orgs'),
  updateOrganization: (data) => apiClient.put('/api/orgs', data),
  getMembers: () => apiClient.get('/api/orgs/members'),
};
