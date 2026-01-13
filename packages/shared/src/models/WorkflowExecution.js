import mongoose from 'mongoose';

const workflowExecutionSchema = new mongoose.Schema({
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  mode: {
    type: String,
    enum: ['manual', 'trigger', 'webhook', 'scheduled'],
    required: true
  },
  status: {
    type: String,
    enum: ['running', 'success', 'error', 'waiting', 'canceled'],
    default: 'running'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  stoppedAt: Date,
  duration: Number,
  triggerData: mongoose.Schema.Types.Mixed,
  executionData: {
    nodes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  error: {
    message: String,
    stack: String,
    node: String
  },
  waitingData: mongoose.Schema.Types.Mixed,
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

workflowExecutionSchema.index({ workflowId: 1 });
workflowExecutionSchema.index({ organizationId: 1 });
workflowExecutionSchema.index({ status: 1 });
workflowExecutionSchema.index({ startedAt: -1 });
workflowExecutionSchema.index({ mode: 1 });
workflowExecutionSchema.index({ deletedAt: 1 });

export default mongoose.model('WorkflowExecution', workflowExecutionSchema);
