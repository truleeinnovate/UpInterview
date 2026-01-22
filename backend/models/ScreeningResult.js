// v1.0.0  -  Created ScreeningResult schema for resume screening results

const mongoose = require("mongoose");

const ScreeningResultSchema = new mongoose.Schema(
    {
        resumeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resume",
            required: true,
            index: true,
        },
        positionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Position",
            required: true,
            index: true,
        },
        // candidateId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "Candidate",
        //     index: true,
        // },
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            required: true,
            index: true,
        },

        metadata: {
            type: Object,
        },
        // Recommendation
        recommendation: {
            type: String,
            enum: ["PROCEED", "HOLD", "REJECT"],
            required: true,
        },


        ats: { type: String },

        // Audit
        screenedAt: {
            type: Date,
            default: Date.now,
        },
        screenedBy: {
            type: String, // Can be "AI", "Manual", or a user reference
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
        },
    },
    {
        timestamps: true,
        collection: "screeningresult"
    }
);

// Compound index for unique screening per resume-position pair
ScreeningResultSchema.index({ resumeId: 1, positionId: 1 }, { unique: true });

// Index for efficient queries
ScreeningResultSchema.index({ tenantId: 1, recommendation: 1 });
ScreeningResultSchema.index({ positionId: 1, recommendation: 1 });

const ScreeningResult = mongoose.model("ScreeningResult", ScreeningResultSchema);

module.exports = { ScreeningResult };
