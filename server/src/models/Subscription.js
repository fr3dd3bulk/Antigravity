import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true,
  },
  stripeSubscriptionId: {
    type: String,
    sparse: true,
  },
  stripeCustomerId: {
    type: String,
    sparse: true,
  },
  status: {
    type: String,
    enum: ['trial', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete'],
    default: 'trial',
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly',
  },
  currentPeriodStart: {
    type: Date,
    default: Date.now,
  },
  currentPeriodEnd: {
    type: Date,
  },
  trialStart: {
    type: Date,
  },
  trialEnd: {
    type: Date,
  },
  canceledAt: {
    type: Date,
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false,
  },
  usage: {
    workflowsCreated: {
      type: Number,
      default: 0,
    },
    activeWorkflows: {
      type: Number,
      default: 0,
    },
    executionsThisMonth: {
      type: Number,
      default: 0,
    },
    lastResetAt: {
      type: Date,
      default: Date.now,
    },
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Indexes
subscriptionSchema.index({ orgId: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 }, { sparse: true });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });

// Method to check if subscription allows action
subscriptionSchema.methods.canPerformAction = async function(action, currentValue) {
  const Plan = mongoose.model('Plan');
  const plan = await Plan.findById(this.planId);
  
  if (!plan) return false;
  
  // Check if subscription is active
  if (this.status !== 'active' && this.status !== 'trial') {
    return false;
  }
  
  // Check trial expiration
  if (this.status === 'trial' && this.trialEnd && new Date() > this.trialEnd) {
    return false;
  }
  
  // Check limits
  const limits = plan.limits;
  switch (action) {
    case 'create_workflow':
      return this.usage.workflowsCreated < limits.maxWorkflows;
    case 'activate_workflow':
      return this.usage.activeWorkflows < limits.maxActiveWorkflows;
    case 'execute_workflow':
      return this.usage.executionsThisMonth < limits.maxExecutionsPerMonth;
    case 'concurrent_execution':
      return currentValue < limits.maxConcurrentExecutions;
    default:
      return true;
  }
};

// Reset monthly usage
subscriptionSchema.methods.resetMonthlyUsage = function() {
  this.usage.executionsThisMonth = 0;
  this.usage.lastResetAt = new Date();
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
