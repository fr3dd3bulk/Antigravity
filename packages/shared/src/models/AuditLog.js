import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    required: true
  },
  resourceId: String,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

auditLogSchema.index({ organizationId: 1, timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
