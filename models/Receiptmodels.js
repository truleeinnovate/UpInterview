const mongoose = require('mongoose');

const ReceiptSchema = new mongoose.Schema({
    invoiceId: {type:mongoose.Schema.Types.ObjectId, ref: 'Invoice',required:true},
    tenantId: { type: String},
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    transactionId: { type: String, required: true },
    status: { type: String, enum: ['success', 'failed', 'pending'], default: 'success' },
    paymentDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Receipt', ReceiptSchema);



