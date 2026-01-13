import mongoose from 'mongoose';

const workflowVersionSchema = new mongoose.Schema({
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true
  },
  versionNumber: {
    type: Number,
    required: true
  },
  nodes: [{
    id: String,
    type: String,
    position: {
      x: Number,
      y: Number
    },
    data: mongoose.Schema.Types.Mixed
  }],
  edges: [{
    id: String,
    source: String,
    target: String,
    sourceHandle: String,
    targetHandle: String,
    data: mongoose.Schema.Types.Mixed
  }],
  settings: mongoose.Schema.Types.Mixed,
  changeNote: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

workflowVersionSchema.index({ workflowId: 1, versionNumber: 1 }, { unique: true });
workflowVersionSchema.index({ workflowId: 1 });

export default mongoose.model('WorkflowVersion', workflowVersionSchema);
