import mongoose from 'mongoose';

const workflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  settings: {
    errorWorkflow: String,
    timezone: String,
    saveExecutionProgress: {
      type: Boolean,
      default: true
    },
    saveManualExecutions: {
      type: Boolean,
      default: true
    },
    saveExecutionOnError: {
      type: Boolean,
      default: true
    },
    saveExecutionOnSuccess: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: false
  },
  tags: [String],
  currentVersionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkflowVersion'
  },
  versionNumber: {
    type: Number,
    default: 1
  },
  lastExecutedAt: Date,
  executionCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: Date
}, {
  timestamps: true
});

workflowSchema.index({ organizationId: 1 });
workflowSchema.index({ createdBy: 1 });
workflowSchema.index({ isActive: 1 });
workflowSchema.index({ tags: 1 });
workflowSchema.index({ deletedAt: 1 });

export default mongoose.model('Workflow', workflowSchema);
