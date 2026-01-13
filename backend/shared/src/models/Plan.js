import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  price: {
    type: Number,
    required: true,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  billingInterval: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  stripePriceId: String,
  limits: {
    maxWorkflows: {
      type: Number,
      default: -1
    },
    maxActiveWorkflows: {
      type: Number,
      default: -1
    },
    maxExecutionsPerMonth: {
      type: Number,
      default: -1
    },
    maxConcurrentExecutions: {
      type: Number,
      default: 5
    },
    maxNodesPerWorkflow: {
      type: Number,
      default: -1
    },
    maxTriggersPerWorkflow: {
      type: Number,
      default: -1
    },
    executionTimeout: {
      type: Number,
      default: 300000
    }
  },
  features: {
    type: Map,
    of: Boolean,
    default: {}
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  trialDays: {
    type: Number,
    default: 0
  },
  sortOrder: {
    type: Number,
    default: 0
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

planSchema.index({ slug: 1 });
planSchema.index({ isPublished: 1 });
planSchema.index({ deletedAt: 1 });

export default mongoose.model('Plan', planSchema);
