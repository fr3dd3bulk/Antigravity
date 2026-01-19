import mongoose from 'mongoose';

const actionDefinitionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Social', 'Google', 'Marketing', 'Productivity', 'Utilities', 'Communication', 'Storage', 'Analytics'],
  },
  logo: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  apiConfig: {
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      default: 'POST',
    },
    url: {
      type: String,
      required: true,
    },
    headers: {
      type: Map,
      of: String,
      default: {},
    },
    bodyTemplate: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  inputSchema: [{
    key: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'textarea', 'number', 'boolean', 'select', 'multiselect'],
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: '',
    },
    required: {
      type: Boolean,
      default: false,
    },
    options: [{
      label: String,
      value: String,
    }],
    defaultValue: mongoose.Schema.Types.Mixed,
  }],
  outputSchema: [{
    key: String,
    type: String,
    description: String,
  }],
  isPublished: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Index for faster queries
actionDefinitionSchema.index({ category: 1, isPublished: 1 });
actionDefinitionSchema.index({ name: 'text' });

const ActionDefinition = mongoose.model('ActionDefinition', actionDefinitionSchema);

export default ActionDefinition;
