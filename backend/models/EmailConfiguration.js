const mongoose = require('mongoose');

const emailConfigurationSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    required: true
  },
  ownerId: {
    type: String,
    required: true
  },
  fromAddress: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  originHost: {
    type: String,
    required: true
  },
  appPassword: {
    type: String,
    required: true
  },
  defaultAddress: {
    type: String,
    required: true
  },
  useCustomEmail: {
    type: Boolean,
    default: false
  },
  isConfigured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Compound index to ensure one config per tenant and owner
emailConfigurationSchema.index({ tenantId: 1, ownerId: 1 }, { unique: true });

const EmailConfiguration = mongoose.model('EmailConfiguration', emailConfigurationSchema);

module.exports = EmailConfiguration;
