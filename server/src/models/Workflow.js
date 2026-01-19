import mongoose from 'mongoose';

const workflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  version: {
    type: Number,
    default: 1,
  },
  nodes: {
    type: Array,
    default: [],
    // Structure: [{ id, type, position: {x, y}, data: {...inputs}, nodeDefId, settings }]
  },
  edges: {
    type: Array,
    default: [],
    // Structure: [{ id, source, target, sourceHandle, targetHandle, label, type }]
  },
  active: {
    type: Boolean,
    default: false,
  },
  triggers: [{
    type: {
      type: String,
      enum: ['manual', 'webhook', 'schedule', 'event'],
      required: true,
    },
    nodeId: {
      type: String,
      required: true,
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    webhookId: {
      type: String,
      sparse: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  }],
  settings: {
    executionOrder: {
      type: String,
      enum: ['v0', 'v1'],
      default: 'v1', // v1 uses DAG topological sort
    },
    errorWorkflow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    saveExecutionProgress: {
      type: Boolean,
      default: true,
    },
    saveManualExecutions: {
      type: Boolean,
      default: true,
    },
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tags: [{
    type: String,
  }],
  executionCount: {
    type: Number,
    default: 0,
  },
  lastExecutedAt: {
    type: Date,
  },
  lastExecutionStatus: {
    type: String,
    enum: ['success', 'error', 'canceled'],
  },
}, {
  timestamps: true,
});

// Generate webhook IDs for webhook triggers before saving
workflowSchema.pre('save', function(next) {
  if (this.triggers && this.triggers.length > 0) {
    this.triggers.forEach(trigger => {
      if (trigger.type === 'webhook' && !trigger.webhookId) {
        trigger.webhookId = `wh_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      }
    });
  }
  next();
});

// Indexes
workflowSchema.index({ orgId: 1, active: 1 });
workflowSchema.index({ 'triggers.webhookId': 1 }, { sparse: true });
workflowSchema.index({ createdBy: 1 });
workflowSchema.index({ tags: 1 });

const Workflow = mongoose.model('Workflow', workflowSchema);

export default Workflow;
