const mongoose = require('mongoose');

const OrganizationReportTemplateSchema = new mongoose.Schema({
    reportName: {
        type: String,
        enum: ['Completed_interviews', 'Candidate_pipeline', 'Position_pipeline', 'Interviews_in_progress'],
        required: true
    },
    category: {
        type: String,
        required: true
    },
    objectType: {
        type: String,
        required: true
    },
    objectName: {
        type: String,
        required: true
    },
    defaultFilters: {
        type: Map,
        of: String,
        required: true
    },
    defaultDashboardParams: {
        type: Object,
        required: true,
        default: () => ({
            layout: 'default',
            widgets: [],
            preferences: {},
            dateRange: '30d',
            chartPreferences: {},
            rightBarPosition: 'right',
            theme: 'light',
            refreshInterval: 15
        })
    },
    defaultColumns:[{
        type: String
    }],
    displayColumns:[{
        type: String
    }],
    planIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubscriptionPlan',
        required: true
    }],
    description: { type: String, default: '' },
    isActive: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

module.exports = mongoose.model('OrganizationReportTemplate', OrganizationReportTemplateSchema);


// const OrganizationReportTemplateSchema = new mongoose.Schema({
//     reportName: {
//         type: String,
//         enum: ['completed_interviews', 'candidate_pipeline', 'total_hires', 'interviews_in_progress'],
//         required: true
//     },
//     category: {
//         type: String,
//         required: true
//     },
//     objectType: {
//         type: String,
//         required: true
//     },
//     objectName: {
//         type: String,
//         required: true
//     },
//     defaultFilters: {
//         type: Map,
//         of: String,
//         required: true
//     },
//     defaultDashboardParams: {
//         type: Map,
//         of: String,
//         required: true
//     },
//     defaultColumns:[{
//          type: mongoose.Schema.Types.Mixed,
//         // required: true
//     }],
//     planIds: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'SubscriptionPlan',
//         required: true
//     }],
//     description: { type: String, default: '' },
//     isActive: {
//         type: Boolean,
//         default: true
//     },
// }, { timestamps: true });

// module.exports = mongoose.model('OrganizationReportTemplate', OrganizationReportTemplateSchema);
