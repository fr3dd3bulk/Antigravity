import mongoose from 'mongoose';

const executionLogSchema = new mongoose.Schema({
  executionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkflowExecution',
    required: true
  },
  nodeId: String,
  nodeName: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  level: {
    type: String,
    enum: ['info', 'warn', 'error', 'debug'],
    default: 'info'
  },
  message: String,
  data: mongoose.Schema.Types.Mixed
}, {
  timestamps: false
});

executionLogSchema.index({ executionId: 1, timestamp: -1 });
executionLogSchema.index({ timestamp: -1 });

export default mongoose.model('ExecutionLog', executionLogSchema);
