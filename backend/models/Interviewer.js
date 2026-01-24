// models/Interviewer.js - Interviewer panel member model
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ratingBreakdownSchema = new Schema({
    feedback_quality: { type: Number, min: 1, max: 5 },
    punctuality: { type: Number, min: 1, max: 5 },
    candidate_experience: { type: Number, min: 1, max: 5 },
    technical_accuracy: { type: Number, min: 1, max: 5 },
    hire_success_rate: { type: Number, min: 0, max: 100 }
}, { _id: false });

const interviewerSchema = new Schema({
    // NOTE: full_name, email, title, department, avatar_url are fetched from user_id (Contact)
    // full_name: {
    //     type: String,
    //     required: true,
    //     trim: true
    // },
    // email: {
    //     type: String,
    //     required: true,
    //     trim: true,
    //     lowercase: true
    // },
    contactId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contacts',
        required: true,
        description: 'Link to Contact entity - name/email fetched from here'
    },
    interviewer_type: {
        type: String,
        enum: ['internal', 'external'],
        default: 'internal',
        description: 'Whether internal employee or outsourced'
    },
    // title: {
    //     type: String,
    //     trim: true
    // },
    // department: {
    //     type: String,
    //     trim: true
    // },
    // avatar_url: {
    //     type: String,
    //     description: 'Profile picture URL'
    // },
    tag_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InterviewerTag'
    }],
    team_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MyTeams',
        description: 'Team this interviewer belongs to'
    },
    is_active: {
        type: Boolean,
        default: true,
        description: 'Whether interviewer is available'
    },
    interviews_conducted: {
        type: Number,
        default: 0,
        description: 'Total interviews conducted'
    },
    specializations: [{
        type: String,
        trim: true
    }],
    max_interviews_per_week: {
        type: Number,
        default: 5,
        description: 'Maximum interviews per week'
    },
    // External interviewer fields
    external_company: {
        type: String,
        trim: true,
        description: 'Company name if external interviewer'
    },
    hourly_rate: {
        type: Number,
        description: 'Hourly rate for external interviewers'
    },
    contract_end_date: {
        type: Date,
        description: 'Contract end date for external'
    },
    // Rating fields
    overall_rating: {
        type: Number,
        min: 1,
        max: 5,
        description: 'Calculated overall rating (1-5)'
    },
    rating_breakdown: ratingBreakdownSchema,
    // Multi-tenancy fields
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
interviewerSchema.index({ tenantId: 1 });
interviewerSchema.index({ email: 1, tenantId: 1 });
interviewerSchema.index({ full_name: 'text', email: 'text' });
interviewerSchema.index({ is_active: 1, tenantId: 1 });
interviewerSchema.index({ is_active: 1, tenantId: 1 });
interviewerSchema.index({ interviewer_type: 1, tenantId: 1 });
interviewerSchema.index({ tenantId: 1, createdAt: -1 });
interviewerSchema.index({ tenantId: 1, _id: -1 });

// Virtual for display name
interviewerSchema.virtual('displayName').get(function () {
    return this.full_name || this.email;
});

// Ensure virtuals are included in JSON output
interviewerSchema.set('toJSON', { virtuals: true });
interviewerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Interviewer', interviewerSchema);
