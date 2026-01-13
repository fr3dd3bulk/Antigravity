import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: String,
  logo: String,
  settings: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  isActive: {
    type: Boolean,
    default: true
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

organizationSchema.index({ slug: 1 });
organizationSchema.index({ ownerId: 1 });
organizationSchema.index({ deletedAt: 1 });

export default mongoose.model('Organization', organizationSchema);
