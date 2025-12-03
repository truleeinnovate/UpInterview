// v1.0.0  -  Ashraf  -  fixed scheduled assessment code unique issue
// v1.0.1 -   removed cretedat because we wre already using timestamp
// v1.0.2 -   added expired and failed statuses to enum
// v1.0.3 -   added index to calculate the total number of scheduled assessments
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
    // organizationId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Organization",
    //   required: true,
    // },
    expiryAt: { type: Date },
    status: {
      type: String,
      enum: ["scheduled", "cancelled", "completed", "expired", "failed"],
      default: "scheduled",
    },
    rescheduledFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ScheduledAssessment",
    },
    proctoringEnabled: { type: Boolean, default: false },

    // <-------------------------------v1.0.1
    // createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date, default: Date.now },
    // ------------------------------v1.0.1 > 

    isActive: { type: Boolean, default: true },
    order: { type: String, default: "Assessment 1" }, // New field for display name

    // External system identifier
    // externalId: { type: String, sparse: true, index: true }, // External system identifier

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
  },
  { timestamps: true }
);
// <-------------------------------v1.0.3


// Add index for scheduledAssessmentCode to support potential sorting operations
ScheduledAssessmentSchema.index({ scheduledAssessmentCode: -1 });

// ------------------------------v1.0.3 >
module.exports = mongoose.model(
  "ScheduledAssessment",
  ScheduledAssessmentSchema
);
