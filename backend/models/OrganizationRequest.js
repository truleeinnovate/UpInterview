const mongoose = require('mongoose');

const organizationRequestSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contacts',  // Changed from 'Contact' to 'Contacts' to match the model name
    required: true
  },
  status: {
    type: String,
    enum: ['Requested', 'Contacted', 'Contacted1', 'Contacted2', 'Approved'],
    default: 'Requested'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create a compound index to ensure one request per tenant and owner
organizationRequestSchema.index({ tenantId: 1, ownerId: 1 }, { unique: true });

module.exports = mongoose.model('OrganizationRequest', organizationRequestSchema);
