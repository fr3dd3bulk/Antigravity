import mongoose from 'mongoose';

const errorLogSchema = new mongoose.Schema({
  executionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Execution',
  },
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
  },
  nodeId: {
    type: String,
  },
  level: {
    type: String,
    enum: ['error', 'warning', 'info'],
    default: 'error',
  },
  message: {
    type: String,
    required: true,
  },
  stack: {
    type: String,
  },
  context: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  source: {
    type: String,
    default: 'execution',
  },
}, {
  timestamps: true,
});

// Indexes
errorLogSchema.index({ executionId: 1, createdAt: -1 });
errorLogSchema.index({ workflowId: 1, createdAt: -1 });
errorLogSchema.index({ orgId: 1, createdAt: -1 });
errorLogSchema.index({ level: 1, createdAt: -1 });

const ErrorLog = mongoose.model('ErrorLog', errorLogSchema);

export default ErrorLog;
