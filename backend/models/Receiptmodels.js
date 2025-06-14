const mongoose = require('mongoose');

const ReceiptSchema = new mongoose.Schema({
    receiptCode:{type:String,unique:true},
    invoiceId: {type:mongoose.Schema.Types.ObjectId, ref: 'Invoice',required:true},
    tenantId: { type: String},
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planName: { type: String },
    amount: { type: Number, required: true },
    price: { type: Number }, // Original price before discount
    discount: { type: Number, default: 0 }, // Amount of discount applied
    paymentMethod: { type: String, required: true },
    transactionId: { type: String, required: true },
    status: { type: String, enum: ['success', 'failed', 'pending'], default: 'success' },
    paymentDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Receipt', ReceiptSchema);