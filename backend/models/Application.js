// v1.0.0  -  Created Application schema for tracking candidate applications

const mongoose = require("mongoose");
const { generateUniqueId } = require("../services/uniqueIdGeneratorService");

const ApplicationSchema = new mongoose.Schema(
    {
        applicationNumber: {
            type: String,
            unique: true,
            sparse: true,
        },
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true,
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
        },
        positionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Position",
            required: true,
            index: true,
        },
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Candidate",
            required: true,
            index: true,
        },
        interviewId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Interview",
            index: true,
        },
        status: {
            type: String,
            enum: [
                "APPLIED",
                "SCREENED",
                "INTERVIEWING",
                "OFFERED",
                "HIRED",
                "REJECTED",
                "WITHDRAWN",
            ],
            default: "INTERVIEWING",
        },
        screeningScore: {
            type: Number,
        },
        screeningDecision: {
            type: String,
        },
        currentStage: {
            type: String,
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
        },
    },
    {
        timestamps: true,
        collection: "application"
    }
);

// Compound index for unique application per candidate-position
ApplicationSchema.index({ candidateId: 1, positionId: 1 }, { unique: true });

// Index for efficient queries
ApplicationSchema.index({ tenantId: 1, status: 1 });
ApplicationSchema.index({ tenantId: 1, positionId: 1 });

// Pre-save hook to generate application number
ApplicationSchema.pre("save", async function (next) {
    if (this.isNew && !this.applicationNumber) {
        try {
            this.applicationNumber = await generateUniqueId(
                "APP",
                mongoose.model("Application"),
                "applicationNumber",
                this.tenantId
            );
        } catch (error) {
            console.error("Error generating application number:", error);
        }
    }
    next();
});

const Application = mongoose.model("Application", ApplicationSchema);

module.exports = { Application };
