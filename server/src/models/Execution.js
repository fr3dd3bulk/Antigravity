import mongoose from 'mongoose';

const executionSchema = new mongoose.Schema({
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true,
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  triggeredBy: {
    type: String,
    enum: ['manual', 'webhook', 'schedule', 'event', 'api', 'retry'],
    required: true,
    default: 'manual',
  },
  startedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['queued', 'running', 'success', 'failed', 'error', 'canceled', 'waiting'],
    default: 'running',
  },
  mode: {
    type: String,
    enum: ['manual', 'production'],
    default: 'production',
  },
  triggerData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  stepResults: [{
    nodeId: String,
    nodeName: String,
    status: {
      type: String,
      enum: ['pending', 'running', 'success', 'failed', 'skipped'],
    },
    startedAt: Date,
    completedAt: Date,
    input: mongoose.Schema.Types.Mixed,
    output: mongoose.Schema.Types.Mixed,
    error: String,
    duration: Number, // milliseconds
  }],
  nodeResults: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map(),
  },
  currentNodeId: {
    type: String, // For partial resume
  },
  error: {
    message: String,
    nodeId: String,
    stack: String,
  },
  retryOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Execution',
  },
  retryCount: {
    type: Number,
    default: 0,
  },
  waitingFor: {
    type: String, // For human approval or external trigger
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  stoppedAt: {
    type: Date,
  },
  duration: {
    type: Number, // milliseconds
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Calculate duration before saving if completed
executionSchema.pre('save', function(next) {
  if (this.completedAt && this.startedAt && !this.duration) {
    this.duration = this.completedAt - this.startedAt;
  }
  if (this.stoppedAt && this.startedAt && !this.duration) {
    this.duration = this.stoppedAt - this.startedAt;
  }
  next();
});

// Indexes
executionSchema.index({ workflowId: 1, createdAt: -1 });
executionSchema.index({ orgId: 1, status: 1 });
executionSchema.index({ status: 1, createdAt: -1 });
executionSchema.index({ startedBy: 1, createdAt: -1 });
executionSchema.index({ triggeredBy: 1 });

const Execution = mongoose.model('Execution', executionSchema);

export default Execution;
