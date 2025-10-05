const mongoose = require('mongoose');

const CustomerSubscriptionSchema = new mongoose.Schema({
    tenantId: { type: String, ref: 'Tenant' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subscriptionPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: false },
    selectedBillingCycle: { type: String, enum: ['monthly', 'quarterly', 'annual'], required: true },
    startDate: { type: Date, default: Date.now },
    nextBillingDate: { type: Date, required: false },
    status: { type: String, enum: ['active', 'inactive', 'paused', 'cancelled','pending', 'failed', 'expired', 'created'], default: 'pending' },
    endDate: { type: Date, default: null },
    endReason: { type: String, enum: ['upgrade', 'downgrade', 'cancelled', 'renewal_failed'], default: null },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    features: [
        {
            name: { type: String, required: false },
            limit: { type: Number, default: null },
            description: { type: String, default: null }
        }
    ],
    totalAmount: { type: Number, required: true },
    receiptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Receipt', required: false },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    subPlanStatus: { type: Boolean, required: false },
    autoRenew: { type: Boolean, required: false },
    razorpayCustomerId: { type: String, required: false },
    razorpaySubscriptionId: { type: String, required: false },
    razorpayPaymentId: { type: String, required: false },
    lastPaymentId: { type: String, required: false },
    lastPaymentDate:{type: Date},
    lastRenewalCheck: { type: Date },
    // razorpaySubscriptionStatus: { type: String, enum: ['active', 'inactive', 'paused', 'cancelled','pending'], default: 'pending' },
    razorpayPlanId: { type: String, required: false }
    
}, { timestamps: true });


const CustomerSubscription = mongoose.model('CustomerSubscription', CustomerSubscriptionSchema);

module.exports = CustomerSubscription;