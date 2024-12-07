const mongoose = require('mongoose');

const integrationLogSchema = new mongoose.Schema({
    endpoint: String,
    requestBody: mongoose.Schema.Types.Mixed,
    responseStatus: Number,
    responseBody: mongoose.Schema.Types.Mixed,
    message: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('IntegrationLog', integrationLogSchema);
