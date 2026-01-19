// models/InterviewerTag.js - Tag model for categorizing interviewers
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const interviewerTagSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        description: 'Tag name'
    },
    description: {
        type: String,
        trim: true,
        description: 'Tag description'
    },
    color: {
        type: String,
        trim: true,
        default: '#94a3b8',
        description: 'Tag color (hex code)'
    },
    category: {
        type: String,
        enum: ['skill', 'level', 'department', 'certification', 'language', 'other'],
        default: 'skill',
        description: 'Tag category'
    },
    is_active: {
        type: Boolean,
        default: true
    },
    // Multi-tenancy fields
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
interviewerTagSchema.index({ tenantId: 1 });
interviewerTagSchema.index({ name: 1, tenantId: 1 });
interviewerTagSchema.index({ category: 1, tenantId: 1 });
interviewerTagSchema.index({ is_active: 1, tenantId: 1 });

// Ensure virtuals are included in JSON output
interviewerTagSchema.set('toJSON', { virtuals: true });
interviewerTagSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('InterviewerTag', interviewerTagSchema);
