import mongoose from 'mongoose';
import crypto from 'crypto';

if (!process.env.CREDENTIAL_ENCRYPTION_KEY) {
  throw new Error('CREDENTIAL_ENCRYPTION_KEY environment variable is required');
}

const ENCRYPTION_KEY = process.env.CREDENTIAL_ENCRYPTION_KEY;
const IV_LENGTH = 16;

const credentialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['api_key', 'oauth2', 'basic_auth', 'custom'],
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  data: {
    type: String, // Encrypted JSON
    required: true,
  },
  nodeTypes: [{
    type: String, // Which node types can use this credential
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  lastUsedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Encrypt data before saving
credentialSchema.pre('save', function(next) {
  if (this.isModified('data') && typeof this.data === 'object') {
    try {
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
      let encrypted = cipher.update(JSON.stringify(this.data));
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      this.data = iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to decrypt data
credentialSchema.methods.getDecryptedData = function() {
  try {
    const parts = this.data.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return JSON.parse(decrypted.toString());
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

// Don't return encrypted data in JSON
credentialSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.data;
  return obj;
};

// Indexes
credentialSchema.index({ orgId: 1, isActive: 1 });
credentialSchema.index({ createdBy: 1 });
credentialSchema.index({ nodeTypes: 1 });

const Credential = mongoose.model('Credential', credentialSchema);

export default Credential;
