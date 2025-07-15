// SUPER ADMIN added by Ashok ------------------------------------------------------>
const mongoose = require("mongoose");

const recentActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    user: { type: String, required: true }, // e.g., "Ashok"
    action: { type: String, default: "custom" }, // e.g., "update_tenant"
    details: { type: String, required: true }, // e.g., "Updated company name"
    entityId: { type: mongoose.Schema.Types.ObjectId },
    entityType: {
      type: String,
      enum: [
        "Tenant",
        "Users",
        "Invoice",
        "OutsourceInterviewerRequest",
        "InterviewRequest",
        "InternalLog",
        "IntegrationLogs",
        "SupportUser",
      ],
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecentActivity", recentActivitySchema);
