import mongoose from 'mongoose';

const workflowVersionSchema = new mongoose.Schema({
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true,
  },
  version: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  nodes: {
    type: Array,
    default: [],
  },
  edges: {
    type: Array,
    default: [],
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  changeLog: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
  }],
}, {
  timestamps: true,
});

// Ensure unique version per workflow
workflowVersionSchema.index({ workflowId: 1, version: 1 }, { unique: true });
workflowVersionSchema.index({ workflowId: 1, createdAt: -1 });

const WorkflowVersion = mongoose.model('WorkflowVersion', workflowVersionSchema);

export default WorkflowVersion;
