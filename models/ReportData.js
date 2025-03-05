const mongoose = require('mongoose');

const reportDataSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationReportTemplate',
        required: true
    },
    tenantId: {
        type: String,
        required: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    
    generatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient querying and automatic expiration
reportDataSchema.index({ templateId: 1, tenantId: 1 });

module.exports = mongoose.model('ReportData', reportDataSchema);
