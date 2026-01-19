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
  status: {
    type: String,
    enum: ['running', 'success', 'failed', 'canceled'],
    default: 'running',
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
  error: {
    message: String,
    nodeId: String,
    stack: String,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  duration: {
    type: Number, // milliseconds
  },
}, {
  timestamps: true,
});

// Calculate duration before saving if completed
executionSchema.pre('save', function(next) {
  if (this.completedAt && this.startedAt && !this.duration) {
    this.duration = this.completedAt - this.startedAt;
  }
  next();
});

// Indexes
executionSchema.index({ workflowId: 1, createdAt: -1 });
executionSchema.index({ orgId: 1, status: 1 });
executionSchema.index({ status: 1, createdAt: -1 });

const Execution = mongoose.model('Execution', executionSchema);

export default Execution;
