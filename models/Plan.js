const mongoose = require('mongoose');

const OrganizationPricingSchema = new mongoose.Schema({
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    plan: { type: String, default: 'free' }
});

module.exports = mongoose.model('OrganizationPricing', OrganizationPricingSchema);