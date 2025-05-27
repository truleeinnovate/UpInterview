const mongoose = require('mongoose');


const InvoiceSchema = new mongoose.Schema({
    tenantId: { 
        type: String,
    }, 
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    planId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SubscriptionPlan', 
        required: false 
    }, 
    type: { 
        type: String, 
        enum: ['subscription', 'wallet', 'payout', 'custom'], 
        required: true 
    },
    price: { type: Number }, // Original price before discount
    discount: { type: Number, default: 0 }, // Amount of discount applied
    totalAmount: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    outstandingAmount: { type: Number, default: function() { return this.totalAmount - this.amountPaid; } },
    status: { 
        type: String, 
        enum: ['pending', 'paid', 'partially_paid', 'failed', 'overdue'], 
        default: 'pending' 
    },
    relatedObjectId: { type: mongoose.Schema.Types.ObjectId, required: false }, 
    metadata: { type: mongoose.Schema.Types.Mixed },
    dueDate: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    startDate: { type: Date,  function() { return this.type === 'subscription'; },
    default:null, },
    endDate: { 
        type: Date, 
        required: function() { return this.type === 'subscription' && this.status === 'paid'; }, 
        default: null 
      },
    lineItems: [
        {
            description: { type: String, required: true },
            amount: { type: Number, required: true },
            quantity: { type: Number, default: 1 },
            tax: { type: Number, default: 0 }
        }
    ],
    comments: { type: String, default: '' },
}, { timestamps: true });




module.exports = mongoose.model('Invoice', InvoiceSchema);
