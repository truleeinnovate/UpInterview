
const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
    tenantId: { type: String },
    ownerId: String,
    balance: { type: Number, required: true, default: 0 },
    transactions: [
        {
            type: { type: String, enum: ['credit', 'debit'], required: true },
            amount: { type: Number, required: true },
            description: { type: String},
            relatedInvoiceId: { type: String, required:false },
            status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
            metadata: { type: mongoose.Schema.Types.Mixed },
            createdDate:{type:Date},
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });


module.exports = mongoose.model('Wallet', WalletSchema);
