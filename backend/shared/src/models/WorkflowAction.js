import mongoose from 'mongoose';

/**
 * WorkflowAction Schema
 * 
 * Manages workflow actions that can be enabled/disabled by super admin.
 * When an action is disabled, all workflows using that action will be
 * automatically deactivated.
 */
const workflowActionSchema = new mongoose.Schema({
  // Unique identifier for the action (e.g., 'http-request', 'send-email')
  actionId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  
  // Display name for the action
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // Action category (trigger, action, condition, utility, ai)
  category: {
    type: String,
    required: true,
    enum: ['trigger', 'action', 'condition', 'utility', 'ai'],
    index: true
  },
  
  // Description of what this action does
  description: {
    type: String,
    default: ''
  },
  
  // Whether this action is currently enabled
  enabled: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // Reason for disabling (if disabled)
  disableReason: {
    type: String,
    default: ''
  },
  
  // Whether this is a core action that cannot be disabled
  isCore: {
    type: Boolean,
    default: false
  },
  
  // Usage statistics
  usageCount: {
    type: Number,
    default: 0
  },
  
  // Last time this action was used
  lastUsedAt: {
    type: Date,
    default: null
  },
  
  // Super admin who last modified this action
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Metadata for additional configuration
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for querying enabled actions
workflowActionSchema.index({ enabled: 1, category: 1 });

// Virtual to get affected workflows count
workflowActionSchema.virtual('affectedWorkflows', {
  ref: 'Workflow',
  localField: 'actionId',
  foreignField: 'definition.nodes.type',
  count: true
});

/**
 * Check if action can be disabled
 */
workflowActionSchema.methods.canDisable = function() {
  return !this.isCore;
};

/**
 * Disable this action
 */
workflowActionSchema.methods.disable = async function(reason, adminId) {
  if (!this.canDisable()) {
    throw new Error('Cannot disable core action');
  }
  
  this.enabled = false;
  this.disableReason = reason || '';
  this.modifiedBy = adminId;
  await this.save();
  
  return this;
};

/**
 * Enable this action
 */
workflowActionSchema.methods.enable = async function(adminId) {
  this.enabled = true;
  this.disableReason = '';
  this.modifiedBy = adminId;
  await this.save();
  
  return this;
};

/**
 * Update usage statistics
 */
workflowActionSchema.methods.updateUsage = async function() {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  await this.save();
};

/**
 * Static method to check if action is enabled
 */
workflowActionSchema.statics.isActionEnabled = async function(actionId) {
  const action = await this.findOne({ actionId });
  if (!action) return true; // If not tracked, assume enabled
  return action.enabled;
};

/**
 * Static method to get all enabled actions
 */
workflowActionSchema.statics.getEnabledActions = async function(category = null) {
  const query = { enabled: true };
  if (category) query.category = category;
  return this.find(query).sort({ name: 1 });
};

/**
 * Static method to get disabled actions
 */
workflowActionSchema.statics.getDisabledActions = async function() {
  return this.find({ enabled: false }).sort({ name: 1 });
};

const WorkflowAction = mongoose.model('WorkflowAction', workflowActionSchema);

export default WorkflowAction;
