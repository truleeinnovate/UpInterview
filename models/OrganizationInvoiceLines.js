const mongoose = require('mongoose');

const OrganizationInvoiceLinesSchema = new mongoose.Schema({
    invoiceId: String,
    lineId: String,
    description: String,
    amount: Number
});

module.exports = mongoose.model('OrganizationInvoiceLines', OrganizationInvoiceLinesSchema);