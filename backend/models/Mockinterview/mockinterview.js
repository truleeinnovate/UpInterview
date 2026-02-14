// v1.0.0  -  Ashraf  -  fixed mock interview code unique issue
const mongoose = require("mongoose");
const mockInterviewSchema = new mongoose.Schema(
  {
    // <------------------------------- v1.0.0
    mockInterviewCode: { type: String },
    // ------------------------------ v1.0.0 >
    skills: [String],

    jobDescription: String,
    currentRole: String,
    candidateName: String,
    higherQualification: String,
    currentExperience: String,
    // technology: String,

    resume: {
      // Added by Ashok
      filename: String,
      path: String,
      contentType: String,
      publicId: String,
      fileSize: Number,
      uploadDate: Date,
    }, //in future we have to work on resume saving functionality
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    // ownerId: String,
    ownerId: mongoose.Schema.Types.ObjectId,
    // tenantId: String,
    tenantId: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);

const MockInterview =
  mongoose.models.MockInterview ||
  mongoose.model("MockInterview", mockInterviewSchema);

module.exports = { MockInterview };
