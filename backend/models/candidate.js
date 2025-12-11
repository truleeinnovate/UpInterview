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
    CurrentExperience: Number, //  CurrentExperience is related to total experience in Ui mentioned.
    RelevantExperience: Number,
    //  mongoose.Schema.Types.ObjectId
    CurrentRole: { type: String, ref: "rolemasters" }, // ✅ UPDATED

    // CurrentRole: String,
    // Technology: String,
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

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    // ownerId: String,
    // tenantId: String,
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
    // Mansoor: added external id for creating the external id only from the external hrms applications
    externalId: { type: String, sparse: true, index: true },
  },
  { timestamps: true }
);

// Add indexes to candidate schema
candidateSchema.index({ tenantId: 1, createdAt: -1 });
candidateSchema.index({ tenantId: 1, Email: 1 });
candidateSchema.index({ tenantId: 1, "skills.skill": 1 });
candidateSchema.index({ tenantId: 1, CurrentExperience: 1 });
candidateSchema.index({ tenantId: 1, HigherQualification: 1 });

// For text search
candidateSchema.index({
  FirstName: "text",
  LastName: "text",
  Email: "text",
  Phone: "text",
});

// // ✅ Indexes to speed up filtering
// candidateSchema.index({ tenantId: 1 });
// candidateSchema.index({ ownerId: 1 });

// // If you often search by both
// candidateSchema.index({ tenantId: 1, ownerId: 1 });

const Candidate =
  mongoose.models.Candidate || mongoose.model("Candidate", candidateSchema);

module.exports = { Candidate };
