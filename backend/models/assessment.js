const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    AssessmentTitle: String,
    // AssessmentType: [String],
    AssessmentCode: { type: String, unique: true },
    Position: String,
    Duration: String,
    DifficultyLevel: String,
    NumberOfQuestions: Number,
    ExpiryDate: Date,
    linkExpiryDays: Number,
    CandidateDetails: {
      includePosition: { type: Boolean, default: false },
      includePhone: { type: Boolean, default: false },
    },
    Instructions: String,
    AdditionalNotes: String,
    totalScore: {
      type: Number,
    },
    passScore: {
      type: Number,
    },
    passScoreType: {
      type: String,
      enum: ["Percentage", "Number"],
      // required: true
    },
    passScoreBy: {
      type: String,
      enum: ["Overall", "Each Section"],
      // required: true
    },
    CreatedBy: String,
    ModifiedDate: Date,
    ModifiedBy: String,
    status: { type: String, enum: ["Active", "Inactive"] },
    ownerId: String,
    tenantId: String,
  },
  { timestamps: true }
);

const Assessment = mongoose.model("assessment", assessmentSchema);
module.exports = Assessment;
