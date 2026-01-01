const mongoose = require("mongoose");

const InterviewPolicySchema = new mongoose.Schema(
  {
    // Human-readable name / key for this policy row (also used for upserts)
    policyName: { type: String, required: true, unique: true },

    // Category of interview this policy applies to: normal vs mock interview
    // INTERVIEW = regular interview round, MOCK = mock interview session
    category: {
      type: String,
      enum: ["INTERVIEW", "MOCK"],
      required: true,
    },

    // Type of candidate action this policy represents
    // RESCHEDULE = candidate reschedules, CANCEL = candidate cancels / no-shows
    type: {
      type: String,
      //enum: ["RESCHEDULE", "CANCEL"],
      required: true,
    },

    // Inclusive lower bound of time window, in minutes before scheduled start
    timeBeforeInterviewMin: { type: Number, required: true },

    // Inclusive upper bound of time window, in minutes before scheduled start
    timeBeforeInterviewMax: { type: Number },

    // Total fee % charged for this action (for reporting/UI; not directly used in payout math yet)
    feePercentage: { type: Number, required: true, default: 0 },

    // % of the held amount that should be paid out to the interviewer
    interviewerPayoutPercentage: { type: Number, required: true, default: 0 },

    // % of the held amount representing platform fee (currently informational)
    platformFeePercentage: { type: Number, required: true, default: 0 },

    // If true, and this is a RESCHEDULE policy, the first reschedule in this window is free
    firstRescheduleFree: { type: Boolean, default: false },

    // Whether GST is already included in the above fee percentages
    gstIncluded: { type: Boolean, default: true },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
      required: true,
    },
  },
  { timestamps: true }
);

const InterviewPolicy = mongoose.model("InterviewPolicy", InterviewPolicySchema);

module.exports = { InterviewPolicy };
