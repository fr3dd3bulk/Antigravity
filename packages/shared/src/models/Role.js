import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  permissions: [{
    resource: {
      type: String,
      required: true
    },
    actions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'execute', 'manage']
    }]
  }],
  isSystem: {
    type: Boolean,
    default: false
  },
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

roleSchema.index({ slug: 1, organizationId: 1 }, { unique: true });
roleSchema.index({ organizationId: 1 });
roleSchema.index({ deletedAt: 1 });

export default mongoose.model('Role', roleSchema);
