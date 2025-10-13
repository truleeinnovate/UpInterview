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
  status: {
    type: String,
    enum: ['Requested', 'Contacted', 'Contacted1', 'Contacted2', 'Approved'],
    default: 'Requested'
  },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' }
});

organizationRequestSchema.index({ tenantId: 1, ownerId: 1 }, { unique: true });

module.exports = mongoose.model('OrganizationRequest', organizationRequestSchema);
