// v1.0.0  -  Ashraf  -  fixed assessment code unique issue
// v1.0.1  -  Ashraf  -  added index to calculate the total number of assessments
// v1.0.2  -  Ashok   -  added type field
// v1.0.3  -  Ashok   -  added templateListId field

const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    AssessmentTitle: String,
    // AssessmentType: [String],
    // <------------------------------- v1.0.0
    AssessmentCode: { type: String },
    // ------------------------------ v1.0.0 >
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
    type: {
      type: String,
      enum: ["custom", "standard"],
      default: "custom",
    },
    assessmentTemplateList: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssessmentList",
    },
    ownerId: String,
    tenantId: String,
  },
  { timestamps: true }
);
// <-------------------------------v1.0.1

// Add index for AssessmentCode sorting within tenantId
assessmentSchema.index({ tenantId: 1, AssessmentCode: -1 });
// ------------------------------v1.0.1 >

const Assessment = mongoose.model("assessment", assessmentSchema);
module.exports = Assessment;
