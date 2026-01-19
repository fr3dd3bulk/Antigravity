import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  key: {
    type: String,
    required: true,
    unique: true,
    enum: ['super_admin', 'org_owner', 'org_admin', 'org_member', 'org_viewer'],
  },
  description: {
    type: String,
    default: '',
  },
  permissions: [{
    resource: {
      type: String,
      required: true,
      enum: ['workflows', 'executions', 'credentials', 'members', 'billing', 'settings', 'nodes', 'plans'],
    },
    actions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'execute', 'publish'],
    }],
  }],
  isSystemRole: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes
roleSchema.index({ key: 1 });
roleSchema.index({ isSystemRole: 1 });

const Role = mongoose.model('Role', roleSchema);

export default Role;
