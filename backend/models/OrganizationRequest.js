const mongoose = require('mongoose');

const organizationRequestSchema = new mongoose.Schema({
  organizationRequestCode: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
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
  // status: {
  //     type: String,
  //     enum: ['requested', 'contacted', 'contacted1', 'contacted2', 'approved'],
  //     default: 'requested'
  // },

  status: {
    type: String,
    enum: [
      'pending_review',    // Submitted, waiting for review
      'in_contact',        // Currently in contact or multiple follow-ups happening
      'under_verification', // Verification documents / details being checked
      'approved',          // Successfully verified
      'rejected'           // (optional) If the org is not approved
    ],
    default: 'pending_review'
  },
  comments: String,
  statusHistory: [{
    status: String,
    comments: String,
    changedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' }
});

organizationRequestSchema.index({ tenantId: 1, ownerId: 1 }, { unique: true });


module.exports = mongoose.model('OrganizationRequest', organizationRequestSchema);
