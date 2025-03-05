const mongoose = require('mongoose');

const DashboardSchema = new mongoose.Schema({
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationReportTemplate',
        required: true
    },
    tenantId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Tenant', 
        required: true 
    },
    layout: { 
        type: String, 
        enum: ['default', 'custom'], 
        default: 'default' 
    },
    widgets: [{
        widgetType: {
            type: String,
            required: true
        },
        position: {
            type: String,
            required: true
        },
        size: {
            type: String,
            default: 'medium'
        },
        isVisible: {
            type: Boolean,
            default: true
        }
    }],
    preferences: {
        type: Object,
        default: {
            showGraph: "true",
            theme: "dark",
            dashboardColumns: "3",
            rightBarPosition: "left",
            showNotifications: "true",
            notificationFrequency: "weekly",
            chartType: "bar",
            timeRange: "7d"
        }
    },
    chartPreferences: {
        type: Object,
        default: {}
    },
    dateRange: { 
        type: String, 
        enum: ['7d', '30d', '90d', 'all'], 
        default: '30d' 
    },
    rightBarPosition: { 
        type: String, 
        enum: ['left', 'right'], 
        default: 'right' 
    },
    theme: { 
        type: String, 
        enum: ['light', 'dark'], 
        default: 'light' 
    },
    refreshInterval: { 
        type: Number, 
        default: 15 
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true 
});

// Index for efficient querying
DashboardSchema.index({ templateId: 1, tenantId: 1 });

module.exports = mongoose.model('Dashboard', DashboardSchema);



// const DashboardSchema = new mongoose.Schema({
//     templateId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'OrganizationReportTemplate',
//             required: true
//         },
//     tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', 
//         //required: true 
//     },
//     layout: { type: String, enum: ['default', 'custom'], default: 'default' },
//     widgets: [{
//         widgetType: {
//             type: String,
//             enum: ['graph', 'table', 'chart', 'list', 'notifications', 'activityFeed'],
//             required: true
//         },
//         position: {
//             type: String,
//             enum: ['left', 'right', 'top', 'bottom'],
//             required: true
//         },
//         size: {
//             type: String,
//             enum: ['small', 'medium', 'large'],
//             default: 'medium'
//         },
//         isVisible: {
//             type: Boolean,
//             default: true
//         }
//     }],
//     preferences: {
//         type: Map,
//         of: String,
//         default: {
//             showGraph: "true",
//             theme: "dark",
//             dashboardColumns: "3",
//             rightBarPosition: "left",
//             showNotifications: "true",
//             notificationFrequency: "weekly",
//             chartType: "bar",
//             timeRange: "7d"
//         }
//     },
//     dateRange: { type: String, enum: ['7d', '30d', '90d', 'all'], default: '30d' },
//     chartPreferences: { type: Map, of: String, default: {} },
//     rightBarPosition: { type: String, enum: ['left', 'right'], default: 'right' },
//     theme: { type: String, enum: ['light', 'dark'], default: 'light' },
//     refreshInterval: { type: Number, default: 15 },
// }, { timestamps: true });

// DashboardSchema.index({ tenantId: 1 });
// module.exports = mongoose.model('Dashboard', DashboardSchema);
