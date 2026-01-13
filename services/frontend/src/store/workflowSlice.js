import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentWorkflow: null,
  nodes: [],
  edges: [],
  selectedNode: null,
  isDirty: false
};

const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    setCurrentWorkflow: (state, action) => {
      state.currentWorkflow = action.payload;
      state.nodes = action.payload?.nodes || [];
      state.edges = action.payload?.edges || [];
      state.isDirty = false;
    },
    setNodes: (state, action) => {
      state.nodes = action.payload;
      state.isDirty = true;
    },
    setEdges: (state, action) => {
      state.edges = action.payload;
      state.isDirty = true;
    },
    addNode: (state, action) => {
      state.nodes.push(action.payload);
      state.isDirty = true;
    },
    updateNode: (state, action) => {
      const index = state.nodes.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        state.nodes[index] = { ...state.nodes[index], ...action.payload };
        state.isDirty = true;
      }
    },
    deleteNode: (state, action) => {
      state.nodes = state.nodes.filter(n => n.id !== action.payload);
      state.edges = state.edges.filter(
        e => e.source !== action.payload && e.target !== action.payload
      );
      state.isDirty = true;
    },
    setSelectedNode: (state, action) => {
      state.selectedNode = action.payload;
    },
    clearWorkflow: (state) => {
      state.currentWorkflow = null;
      state.nodes = [];
      state.edges = [];
      state.selectedNode = null;
      state.isDirty = false;
    },
    markSaved: (state) => {
      state.isDirty = false;
    }
  }
});

export const {
  setCurrentWorkflow,
  setNodes,
  setEdges,
  addNode,
  updateNode,
  deleteNode,
  setSelectedNode,
  clearWorkflow,
  markSaved
} = workflowSlice.actions;

export default workflowSlice.reducer;
