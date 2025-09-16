const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    FirstName: String,
    LastName: String,
    Email: String,
    Phone: String,
    CountryCode: String,
    Date_Of_Birth: Date,
    Gender: String,
    HigherQualification: String,
    UniversityCollege: String,
    CurrentExperience: Number,
    RelevantExperience: Number,
    CurrentRole: String,
    // PositionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Position' },
    // PositionId: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Position'
    // }],
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
      uploadDate:  Date,
    },
    resume: {
      filename: String,
      path: String,
      contentType: String,
      publicId: String,
      fileSize: Number,
      uploadDate:  Date,
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    // ownerId: String,
    // tenantId: String,
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
  },
  { timestamps: true }
);

// ✅ Indexes to speed up filtering
candidateSchema.index({ tenantId: 1 });
candidateSchema.index({ ownerId: 1 });

// If you often search by both
candidateSchema.index({ tenantId: 1, ownerId: 1 });

const Candidate = mongoose.models.Candidate || mongoose.model("Candidate", candidateSchema);

module.exports = { Candidate };
