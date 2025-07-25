// v1.0.0  -  Ashraf  -  fixed scheduled assessment code unique issue
// v1.0.1 -   removed cretedat because we wre already using timestamp
const mongoose = require("mongoose");

const ScheduledAssessmentSchema = new mongoose.Schema(
  {
    // <------------------------------- v1.0.0 
    scheduledAssessmentCode: { type: String },
    // ------------------------------ v1.0.0 >
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "assessment",
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    expiryAt: { type: Date },
    status: {
      type: String,
      enum: ["scheduled", "cancelled", "completed"],
      default: "scheduled",
    },
    rescheduledFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ScheduledAssessment",
    },
    proctoringEnabled: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    
    // <-------------------------------v1.0.1
    // createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date, default: Date.now },
 // ------------------------------v1.0.1 > 
    
    isActive: { type: Boolean, default: true },
    order: { type: String, default: "Assessment 1" }, // New field for display name
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "ScheduledAssessment",
  ScheduledAssessmentSchema
);
