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
  nodes: {
    type: Array,
    default: [],
    // Structure: [{ id, type, position: {x, y}, data: {...inputs} }]
  },
  edges: {
    type: Array,
    default: [],
    // Structure: [{ id, source, target, sourceHandle, targetHandle }]
  },
  active: {
    type: Boolean,
    default: false,
  },
  trigger: {
    type: {
      type: String,
      enum: ['manual', 'webhook', 'schedule', 'event'],
      default: 'manual',
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  webhookId: {
    type: String,
    unique: true,
    sparse: true, // Allow null values
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
  executionCount: {
    type: Number,
    default: 0,
  },
  lastExecutedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Generate webhook ID before saving if trigger is webhook
workflowSchema.pre('save', function(next) {
  if (this.trigger.type === 'webhook' && !this.webhookId) {
    this.webhookId = `wh_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  }
  next();
});

// Indexes
workflowSchema.index({ orgId: 1, active: 1 });
workflowSchema.index({ webhookId: 1 });
workflowSchema.index({ createdBy: 1 });

const Workflow = mongoose.model('Workflow', workflowSchema);

export default Workflow;
