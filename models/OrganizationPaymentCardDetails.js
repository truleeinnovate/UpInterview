const mongoose = require('mongoose');

const OrganizationPaymentCardDetailsSchema = new mongoose.Schema({
    cardType: String,
    cardNumber: String,
    expiryDate: String,
    cvv: String
});

module.exports = mongoose.model('OrganizationPaymentCardDetails', OrganizationPaymentCardDetailsSchema);