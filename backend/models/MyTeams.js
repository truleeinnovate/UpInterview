// models/MyTeams.js - Renamed from InterviewerGroup to MyTeams
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    department: {
        type: String,
        trim: true
    },
    lead_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contacts'
    },
    member_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contacts'
    }],
    is_active: {
        type: Boolean,
        default: true
    },
    color: {
        type: String,
        default: 'Teal'
    },
    // Keep for backward compatibility
    numberOfUsers: {
        type: Number,
        default: 0
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId
    },
}, { timestamps: true });

// Update numberOfUsers before saving
teamSchema.pre('save', function (next) {
    this.numberOfUsers = this.member_ids ? this.member_ids.length : 0;
    next();
});

// Virtual for getting member count
teamSchema.virtual('memberCount').get(function () {
    return this.member_ids ? this.member_ids.length : 0;
});

// Ensure virtuals are included in JSON output
teamSchema.set('toJSON', { virtuals: true });
teamSchema.set('toObject', { virtuals: true });

// Indexes for efficient querying
teamSchema.index({ tenantId: 1, createdAt: -1 });
teamSchema.index({ tenantId: 1, _id: -1 });

// Keep model name as MyTeams for backward compatibility with existing collections
module.exports = mongoose.model('MyTeams', teamSchema);