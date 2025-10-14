const mongoose = require('mongoose');

const subscriptionHistorySchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  oldPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
  },
  oldPlanName: String,
  oldBillingCycle: String,
  oldPrice: Number,
  oldStatus: String,
  newPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
  },
  newPlanName: String,
  newBillingCycle: String,
  newPrice: Number,
  action: {
    type: String,
    enum: ['upgrade', 'downgrade', 'cancelled', 'switched'],
    required: true
  },
  reason: String,
  oldInvoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
  },
  newInvoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
  },
  razorpaySubscriptionId: String,
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: true,
});

module.exports = mongoose.model('SubscriptionHistory', subscriptionHistorySchema);
