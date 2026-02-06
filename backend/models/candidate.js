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
    linkedInUrl: String,
    location: String,
    maxSalary: Number,
    minSalary: Number,
    languages: [String],
    certifications: [{
      name: String,
      issuingFrom: String, 
      issuingYear: Number, //max 4
    }],
    noticePeriod: String,
    ImageData: {
      filename: String,
      path: String,
      contentType: String,
      publicId: String,
      fileSize: Number,
      uploadDate: Date,
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
    // Mansoor: added external id for creating the external id only from the external hrms applications
    externalId: { type: String, sparse: true, index: true },
  },
  { timestamps: true },
);

// Add indexes to candidate schema
candidateSchema.index({ tenantId: 1, createdAt: -1 });
candidateSchema.index({ tenantId: 1, Email: 1 });

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
