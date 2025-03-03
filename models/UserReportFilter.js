const mongoose = require('mongoose');

const userReportFilterSchema = new mongoose.Schema({
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
    filters: {
        type: Object,
        default:{}
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient querying
userReportFilterSchema.index({ userId: 1, templateId: 1 });

module.exports = mongoose.model('UserReportFilter', userReportFilterSchema);
