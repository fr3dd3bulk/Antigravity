import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Workflows', 'Executions', 'Organizations', 'Nodes', 'Credentials', 'WorkflowActions'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials
      })
    }),
    register: builder.mutation({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data
      })
    }),
    getMe: builder.query({
      query: () => '/auth/me'
    }),
    getOrganizations: builder.query({
      query: () => '/organizations',
      providesTags: ['Organizations']
    }),
    getWorkflows: builder.query({
      query: ({ organizationId, ...params }) => ({
        url: `/organizations/${organizationId}/workflows`,
        params
      }),
      providesTags: ['Workflows']
    }),
    getWorkflow: builder.query({
      query: ({ organizationId, workflowId }) => 
        `/organizations/${organizationId}/workflows/${workflowId}`,
      providesTags: ['Workflows']
    }),
    createWorkflow: builder.mutation({
      query: ({ organizationId, ...data }) => ({
        url: `/organizations/${organizationId}/workflows`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Workflows']
    }),
    updateWorkflow: builder.mutation({
      query: ({ organizationId, workflowId, ...data }) => ({
        url: `/organizations/${organizationId}/workflows/${workflowId}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['Workflows']
    }),
    deleteWorkflow: builder.mutation({
      query: ({ organizationId, workflowId }) => ({
        url: `/organizations/${organizationId}/workflows/${workflowId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Workflows']
    }),
    executeWorkflow: builder.mutation({
      query: ({ organizationId, workflowId, triggerData }) => ({
        url: `/organizations/${organizationId}/executions/workflows/${workflowId}/execute`,
        method: 'POST',
        body: { triggerData }
      }),
      invalidatesTags: ['Executions']
    }),
    getExecutions: builder.query({
      query: ({ organizationId, ...params }) => ({
        url: `/organizations/${organizationId}/executions`,
        params
      }),
      providesTags: ['Executions']
    }),
    getExecution: builder.query({
      query: ({ organizationId, executionId }) => 
        `/organizations/${organizationId}/executions/${executionId}`,
      providesTags: ['Executions']
    }),
    getNodes: builder.query({
      query: () => '/nodes',
      providesTags: ['Nodes']
    }),
    getCredentials: builder.query({
      query: ({ organizationId }) => `/organizations/${organizationId}/credentials`,
      providesTags: ['Credentials']
    }),
    createCredential: builder.mutation({
      query: ({ organizationId, ...data }) => ({
        url: `/organizations/${organizationId}/credentials`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Credentials']
    }),
    getPlans: builder.query({
      query: () => '/admin/plans'
    }),
    getSystemStats: builder.query({
      query: () => '/admin/stats'
    }),
    getWorkflowActions: builder.query({
      query: (params = {}) => ({
        url: '/admin/workflow-actions',
        params
      }),
      providesTags: ['WorkflowActions']
    }),
    getWorkflowActionStats: builder.query({
      query: () => '/admin/workflow-actions/stats',
      providesTags: ['WorkflowActions']
    }),
    disableWorkflowAction: builder.mutation({
      query: ({ actionId, reason }) => ({
        url: `/admin/workflow-actions/${actionId}/disable`,
        method: 'POST',
        body: { reason }
      }),
      invalidatesTags: ['WorkflowActions']
    }),
    enableWorkflowAction: builder.mutation({
      query: ({ actionId }) => ({
        url: `/admin/workflow-actions/${actionId}/enable`,
        method: 'POST'
      }),
      invalidatesTags: ['WorkflowActions']
    }),
    syncWorkflowActions: builder.mutation({
      query: () => ({
        url: '/admin/workflow-actions/sync',
        method: 'POST'
      }),
      invalidatesTags: ['WorkflowActions']
    })
  })
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useGetOrganizationsQuery,
  useGetWorkflowsQuery,
  useGetWorkflowQuery,
  useCreateWorkflowMutation,
  useUpdateWorkflowMutation,
  useDeleteWorkflowMutation,
  useExecuteWorkflowMutation,
  useGetExecutionsQuery,
  useGetExecutionQuery,
  useGetNodesQuery,
  useGetCredentialsQuery,
  useCreateCredentialMutation
} = api;
