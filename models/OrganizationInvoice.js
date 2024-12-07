const mongoose = require('mongoose');

const OrganizationInvoiceSchema = new mongoose.Schema({
    invoiceId: String,
    customerId: String,
    invoiceDate: Date,
    dueDate: Date,
    status: String,
    totalAmount: Number,
    subtotal: Number,
    taxAmount: Number,
    discount: Number,
    currency: String,
    paymentStatus: String,
    paymentMethod: String,
    notes: String
});

module.exports = mongoose.model('OrganizationInvoice', OrganizationInvoiceSchema);