import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  key: {
    type: String,
    required: true,
    unique: true,
    enum: ['free', 'starter', 'pro', 'enterprise', 'custom'],
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    monthly: {
      type: Number,
      default: 0,
    },
    yearly: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
  },
  stripePriceId: {
    monthly: String,
    yearly: String,
  },
  limits: {
    maxWorkflows: {
      type: Number,
      default: 10,
    },
    maxActiveWorkflows: {
      type: Number,
      default: 5,
    },
    maxExecutionsPerMonth: {
      type: Number,
      default: 1000,
    },
    maxConcurrentExecutions: {
      type: Number,
      default: 5,
    },
    maxNodesPerWorkflow: {
      type: Number,
      default: 50,
    },
    maxTriggersPerWorkflow: {
      type: Number,
      default: 1,
    },
    executionTimeout: {
      type: Number,
      default: 300, // seconds
    },
    retentionDays: {
      type: Number,
      default: 30,
    },
  },
  features: [{
    key: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  }],
  isPublished: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  trialDays: {
    type: Number,
    default: 14,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes
planSchema.index({ key: 1 });
planSchema.index({ isPublished: 1, isActive: 1 });
planSchema.index({ sortOrder: 1 });

const Plan = mongoose.model('Plan', planSchema);

export default Plan;
