
// v1.0.0 - Venkatesh - Added hold transaction tracking and settlement status fields for interview payment management

const mongoose = require("mongoose");

// Participants (Candidate + Interviewer + Scheduler)
const participantSchema = new mongoose.Schema(
    {
        role: { type: String, enum: ["Candidate", "Interviewer", "Scheduler"], required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "Contacts" }, // optional for candidate
        joinedAt: { type: Date },
        status: { type: String, enum: ["Joined", "Not Joined"] },
    },
    { _id: false }
);

// Only schedule / reschedule / cancel info
const roundHistorySchema = new mongoose.Schema(
    {
        scheduledAt: { type: Date, required: true },
        action: { type: String, enum: ["Scheduled", "Rescheduled", "Cancelled"], required: true },
        // reason: { type: String },
        reasonCode: { type: String },      // e.g. "candidate_requested"
        comment: { type: String },         // only when reasonCode === "other"
        participants: [participantSchema],
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        updatedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

// Main Interview Round Schema
const interviewRoundSchema = new mongoose.Schema({
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview" },
    sequence: Number,
    roundTitle: String,
    interviewMode: String,
    interviewType: String, // instant or schedule later
    interviewerType: String, // Internal or External
    duration: String,
    instructions: String,

    // Current scheduled date/time
    // dateTime: { type: Date },


    // Current scheduled date/time

    dateTime: String,

    interviewerViewType: String,
    // interviewerGroupName: String,
    interviewerGroupId: String,
    interviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contacts" }],

    // Candidate (always one per round, included in participants too if needed)
    // candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },

    // Current lifecycle status
    status: {
        type: String,
        enum: [
            "Draft",
            "RequestSent",
            "Scheduled",
            "InProgress",
            "Completed",
            "InCompleted",
            "Rescheduled",
            "Rejected",
            "Selected",
            "Cancelled",
            "Incomplete",
            "NoShow"
        ],
        default: "Draft",
    },

    // Track last and current actions + reasons
 /* ------------------------------------
     * Current Action Tracking
     * ---------------------------------- */
    currentAction: { type: String },          // e.g. Rescheduled
    currentActionReason: { type: String },    // reasonCode
    comments: { type: String },               // only for "other"

    /* ------------------------------------
     * History (append-only)
     * ---------------------------------- */
    history: [roundHistorySchema],

    /* ------------------------------------
     * Meeting / Assessment
     * ---------------------------------- */
    meetingId: String,
    meetPlatform: String,
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },

    scheduleAssessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "ScheduledAssessment" },
    rejectionReason: String,

    // Settlement tracking
    settlementStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    settlementDate: { type: Date },

    // External system identifier
    externalId: { type: String, sparse: true, index: true }, // External system identifier
}, { timestamps: true });

// Add middleware to track status changes for internal interview usage
const { handleInterviewStatusChange } = require('../../services/interviewUsageService');

// Pre-save hook to track status changes
interviewRoundSchema.pre('save', async function (next) {
    try {
        // Check if status has changed
        if (this.isModified('status') && !this.isNew) {
            const oldStatus = this._original_status || 'Draft';
            const newStatus = this.status;

            // Only track for Internal interviews
            if (this.interviewerType === 'Internal') {
                const Interview = require('../Interview/Interview').Interview;
                const interview = await Interview.findById(this.interviewId);

                if (interview) {
                    const result = await handleInterviewStatusChange(
                        this._id,
                        oldStatus,
                        newStatus,
                        {
                            tenantId: interview.tenantId,
                            ownerId: interview.ownerId
                        }
                    );

                    if (!result.success && newStatus === 'Scheduled') {
                        // If scheduling fails due to usage limit, prevent the save
                        return next(new Error(result.message || 'Usage limit exceeded'));
                    }
                }
            }
        }

        next();
    } catch (error) {
        console.error('[InterviewRounds] Error in pre-save hook:', error);
        next(error);
    }
});

// Pre-findOneAndUpdate hook to track the original status
interviewRoundSchema.pre('findOneAndUpdate', async function () {
    const docToUpdate = await this.model.findOne(this.getQuery());
    if (docToUpdate) {
        this._originalDoc = docToUpdate;
    }
});

// Post-findOneAndUpdate hook to handle status change
interviewRoundSchema.post('findOneAndUpdate', async function (doc) {
    try {
        if (!doc || !this._originalDoc) return;

        const oldStatus = this._originalDoc.status;
        const newStatus = doc.status;

        // Check if status changed and it's an Internal interview
        if (oldStatus !== newStatus && doc.interviewerType === 'Internal') {
            const Interview = require('../Interview/Interview').Interview;
            const interview = await Interview.findById(doc.interviewId);

            if (interview) {
                await handleInterviewStatusChange(
                    doc._id,
                    oldStatus,
                    newStatus,
                    {
                        tenantId: interview.tenantId,
                        ownerId: interview.ownerId
                    }
                );
            }
        }
    } catch (error) {
        console.error('[InterviewRounds] Error in post-findOneAndUpdate hook:', error);
    }
});

const InterviewRounds = mongoose.model("InterviewRounds", interviewRoundSchema);
module.exports = { InterviewRounds };
