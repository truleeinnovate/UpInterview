const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
    {
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Candidate",
            required: true,
            index: true,
        },
        fileUrl: String,

        // Professional/Education details moved from Candidate
        HigherQualification: String,
        UniversityCollege: String,
        CurrentExperience: Number, // CurrentExperience is related to total experience in UI mentioned.
        RelevantExperience: Number,
        CurrentRole: { type: String, ref: "rolemasters" },

        skills: [
            {
                skill: String,
                experience: String,
                expertise: String,
            },
        ],

        ImageData: {
            filename: String,
            path: String,
            contentType: String,
            publicId: String,
            fileSize: Number,
            uploadDate: Date,
        },

        resume: {
            filename: String,
            path: String,
            contentType: String,
            publicId: String,
            fileSize: Number,
            uploadDate: Date,
        },

        // Additional parsed resume data
        // parsedJson: mongoose.Schema.Types.Mixed,
        // experienceYears: Number,
        // education: String,

        source: {
            type: String,
            enum: ["UPLOAD", "AGENCY", "ATS", "MANUAL"],
            default: "MANUAL",
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        uploadedAt: {
            type: Date,
            default: Date.now,
        },

        // Ownership fields
        ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
        tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    },
    { timestamps: true, collection: "resume" }
);

// Add indexes for efficient queries
resumeSchema.index({ candidateId: 1, isActive: 1 });
resumeSchema.index({ tenantId: 1, isActive: 1 });
resumeSchema.index({ candidateId: 1, tenantId: 1 });

const Resume =
    mongoose.models.Resume || mongoose.model("Resume", resumeSchema);

module.exports = { Resume };
