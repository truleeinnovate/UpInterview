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
    enum: ['requested', 'contacted', 'contacted1', 'contacted2', 'approved'],
    default: 'requested'
  },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' }
});

organizationRequestSchema.index({ tenantId: 1, ownerId: 1 }, { unique: true });

module.exports = mongoose.model('OrganizationRequest', organizationRequestSchema);
