import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  stripeCustomerId: {
    type: String,
    default: null,
  },
  subscriptionStatus: {
    type: String,
    enum: ['trial', 'active', 'past_due', 'canceled', 'unpaid'],
    default: 'trial',
  },
  subscriptionId: {
    type: String,
    default: null,
  },
  planType: {
    type: String,
    enum: ['free', 'starter', 'professional', 'enterprise'],
    default: 'free',
  },
  credits: {
    type: Number,
    default: 1000,
  },
  maxWorkflows: {
    type: Number,
    default: 10,
  },
  maxExecutionsPerMonth: {
    type: Number,
    default: 1000,
  },
  trialEndsAt: {
    type: Date,
    default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Generate slug from name before validation
organizationSchema.pre('validate', function(next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Indexes
organizationSchema.index({ slug: 1 });
organizationSchema.index({ stripeCustomerId: 1 });

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;
