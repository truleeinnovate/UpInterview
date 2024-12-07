const mongoose = require('mongoose');

const OrganizationPaymentSchema = new mongoose.Schema({
    paymentId: String,
    invoiceId: String,
    amount: Number,
    date: Date,
    method: String
});

module.exports = mongoose.model('OrganizationPayment', OrganizationPaymentSchema);