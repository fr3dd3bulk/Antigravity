import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  action: {
    type: String,
    required: true,
    enum: [
      'workflow_created',
      'workflow_updated',
      'workflow_deleted',
      'workflow_published',
      'workflow_unpublished',
      'workflow_executed',
      'workflow_failed',
      'workflow_canceled',
      'workflow_retried',
      'credential_created',
      'credential_updated',
      'credential_deleted',
      'member_invited',
      'member_removed',
      'plan_changed',
      'subscription_started',
      'subscription_canceled',
    ],
  },
  description: {
    type: String,
    default: '',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
}, {
  timestamps: true,
});

// Indexes
activityLogSchema.index({ workflowId: 1, createdAt: -1 });
activityLogSchema.index({ orgId: 1, createdAt: -1 });
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
