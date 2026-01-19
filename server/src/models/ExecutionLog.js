import mongoose from 'mongoose';

const executionLogSchema = new mongoose.Schema({
  executionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Execution',
    required: true,
  },
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true,
  },
  nodeId: {
    type: String,
    required: true,
  },
  nodeName: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'success', 'error', 'skipped', 'canceled'],
    default: 'pending',
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
  inputData: {
    type: mongoose.Schema.Types.Mixed,
  },
  outputData: {
    type: mongoose.Schema.Types.Mixed,
  },
  errorData: {
    type: mongoose.Schema.Types.Mixed,
  },
  retryCount: {
    type: Number,
    default: 0,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: false,
});

// Indexes
executionLogSchema.index({ executionId: 1, nodeId: 1 });
executionLogSchema.index({ workflowId: 1, startedAt: -1 });
executionLogSchema.index({ status: 1 });

const ExecutionLog = mongoose.model('ExecutionLog', executionLogSchema);

export default ExecutionLog;
