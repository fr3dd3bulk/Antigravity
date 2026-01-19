import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const nodeDefinitionSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4(),
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  version: {
    type: Number,
    default: 1,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'trigger',
      'action',
      'condition',
      'utility',
      'ai',
      'database',
      'communication',
      'social',
      'marketing',
      'analytics',
      'storage',
      'transform',
    ],
  },
  type: {
    type: String,
    required: true,
    enum: ['trigger', 'action', 'condition', 'utility'],
  },
  shape: {
    type: String,
    enum: ['circle', 'rectangle', 'diamond', 'hexagon', 'custom'],
    default: 'rectangle',
  },
  color: {
    type: String,
    default: '#571B0A',
  },
  icon: {
    type: String,
    default: '',
  },
  logo: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  inputSchema: {
    type: Array,
    default: [],
    // Structure: [{ key, type, label, required, default, options, validation }]
  },
  outputSchema: {
    type: Array,
    default: [],
    // Structure: [{ key, type, description }]
  },
  apiConfig: {
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'INTERNAL'],
      default: 'POST',
    },
    url: {
      type: String,
      required: true,
    },
    headers: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    bodyTemplate: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    authType: {
      type: String,
      enum: ['none', 'api_key', 'oauth2', 'basic', 'bearer'],
      default: 'none',
    },
  },
  credentialTypes: [{
    type: String, // Types of credentials this node can use
  }],
  uiConfig: {
    displayName: String,
    subtitle: String,
    helpText: String,
    exampleValues: mongoose.Schema.Types.Mixed,
  },
  settings: {
    timeout: {
      type: Number,
      default: 30000, // milliseconds
    },
    retries: {
      enabled: {
        type: Boolean,
        default: false,
      },
      maxAttempts: {
        type: Number,
        default: 3,
      },
      retryDelay: {
        type: Number,
        default: 1000, // milliseconds
      },
    },
    continueOnFail: {
      type: Boolean,
      default: false,
    },
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isSystem: {
    type: Boolean,
    default: false, // System nodes cannot be edited/deleted
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Indexes
nodeDefinitionSchema.index({ key: 1 });
nodeDefinitionSchema.index({ category: 1, isPublished: 1 });
nodeDefinitionSchema.index({ type: 1, isPublished: 1 });
nodeDefinitionSchema.index({ isPublished: 1, isActive: 1 });

const NodeDefinition = mongoose.model('NodeDefinition', nodeDefinitionSchema);

export default NodeDefinition;
