const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema({
    callbackUrl: { type: String, required: true },
    events: { type: [String], required: true },
    secret: { type: String }, // Optional, for HMAC signatures
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Webhook', webhookSchema);
