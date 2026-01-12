// v1.0.0  -  Created Offer schema for tracking job offers

const mongoose = require("mongoose");

const OfferSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true,
        },

        // Links
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            index: true,
        },
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Candidate",
            required: true,
            index: true,
        },
        positionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Position",
            required: true,
            index: true,
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            index: true, // Important for agencies
        },
        interviewId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Interview",
            index: true, // Optional (interview that led to this offer)
        },

        // ATS Mapping
        atsProvider: {
            type: String, // Greenhouse, Lever, Workday, etc.
        },
        atsOfferId: {
            type: String, // Offer ID in ATS
        },
        atsApplicationId: {
            type: String,
        },

        // Offer State (SOURCE OF TRUTH = ATS)
        status: {
            type: String,
            enum: ["DRAFT", "OFFERED", "ACCEPTED", "DECLINED", "WITHDRAWN", "HIRED"],
            default: "DRAFT",
        },

        // Optional (for reporting, not legal)
        compensationMin: {
            type: Number,
        },
        compensationMax: {
            type: Number,
        },
        currency: {
            type: String,
            default: "USD",
        },
        employmentType: {
            type: String,
            enum: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"],
        },

        // Dates
        offeredAt: {
            type: Date,
        },
        respondedAt: {
            type: Date,
        },
        hiredAt: {
            type: Date,
        },

        // Audit
        lastSyncedAt: {
            type: Date,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
        },
        syncLog: {
            type: mongoose.Schema.Types.Mixed, // JSON of webhook payloads
        },

        ownerId: {
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
    }
);

// Indexes for efficient queries
OfferSchema.index({ tenantId: 1, status: 1 });
OfferSchema.index({ tenantId: 1, candidateId: 1 });
OfferSchema.index({ tenantId: 1, positionId: 1 });
OfferSchema.index({ atsProvider: 1, atsOfferId: 1 });

const Offer = mongoose.model("Offer", OfferSchema);

module.exports = { Offer };
