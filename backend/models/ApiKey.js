const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    organization: {
      type: String,
      required: true,
      trim: true
    },
    permissions: [{
      type: String,
      enum: ['read', 'write', 'delete'],
      required: true
    }],
    enabled: {
      type: Boolean,
      default: true
    },
    lastUsed: {
      type: Date,
      default: null
    },
    usageCount: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Generate a unique API key
apiKeySchema.statics.generateKey = function() {
  return 'up_' + crypto.randomBytes(32).toString('hex');
};

// Method to mask the API key for display
apiKeySchema.methods.maskKey = function() {
  if (!this.key) return '';
  return this.key.substring(0, 8) + '•'.repeat(20) + this.key.substring(this.key.length - 4);
};

// Method to update usage
apiKeySchema.methods.updateUsage = function() {
  this.lastUsed = new Date();
  this.usageCount += 1;
  return this.save();
};

// Index for efficient queries
apiKeySchema.index({ organization: 1 });
apiKeySchema.index({ createdBy: 1 });
apiKeySchema.index({ enabled: 1 });
apiKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const ApiKey = mongoose.model('ApiKey', apiKeySchema);

module.exports = ApiKey;
