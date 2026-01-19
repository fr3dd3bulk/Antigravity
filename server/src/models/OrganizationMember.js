import mongoose from 'mongoose';

const organizationMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  invitedAt: {
    type: Date,
    default: Date.now,
  },
  joinedAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'removed'],
    default: 'pending',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Ensure a user can only have one role per organization
organizationMemberSchema.index({ userId: 1, orgId: 1 }, { unique: true });
organizationMemberSchema.index({ orgId: 1, status: 1 });
organizationMemberSchema.index({ userId: 1 });

const OrganizationMember = mongoose.model('OrganizationMember', organizationMemberSchema);

export default OrganizationMember;
