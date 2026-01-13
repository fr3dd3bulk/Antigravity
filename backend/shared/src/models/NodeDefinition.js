import mongoose from 'mongoose';

const nodeDefinitionSchema = new mongoose.Schema({
  nodeType: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  version: {
    type: Number,
    default: 1
  },
  category: {
    type: String,
    required: true,
    enum: ['trigger', 'action', 'condition', 'utility', 'ai', 'integration']
  },
  description: String,
  icon: String,
  color: {
    type: String,
    default: '#4CAF50'
  },
  shape: {
    type: String,
    enum: ['circle', 'rectangle', 'diamond', 'hexagon'],
    default: 'rectangle'
  },
  inputs: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  outputs: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  properties: [{
    name: String,
    displayName: String,
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'json', 'options', 'credentials', 'multiOptions']
    },
    default: mongoose.Schema.Types.Mixed,
    required: Boolean,
    options: [mongoose.Schema.Types.Mixed],
    description: String,
    placeholder: String
  }],
  credentials: [{
    name: String,
    required: Boolean
  }],
  code: String,
  isEnabled: {
    type: Boolean,
    default: true
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

nodeDefinitionSchema.index({ nodeType: 1 });
nodeDefinitionSchema.index({ category: 1 });
nodeDefinitionSchema.index({ isEnabled: 1 });
nodeDefinitionSchema.index({ deletedAt: 1 });

export default mongoose.model('NodeDefinition', nodeDefinitionSchema);
