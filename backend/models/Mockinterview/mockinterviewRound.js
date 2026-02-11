// v1.0.0 - Venkatesh - Added hold transaction tracking and settlement status fields for mock interview payment management
// Policy usage note:
// MockInterviewRound is used by the same settlement pipeline as normal InterviewRounds.
// WalletControllers.settleInterviewPayment loads this model when isMockInterview=true
// and applies the mock-specific policy brackets (>12h: 0%, 2-12h: 25%, <2h/NoShow: 50%).
// The settlementStatus/settlementDate fields track the final outcome for each mock round.

const mongoose = require("mongoose");

// Participants (Candidate + Interviewer + Scheduler)
const participantSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["Candidate", "Interviewer", "Scheduler"],
      // required: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Contacts" }, // optional for candidate
    joinedAt: { type: Date },
    status: { type: String, enum: ["Joined", "Not_Joined"] },
  },
  { _id: false }
);

// Only schedule / reschedule / cancel info
const roundScheduleSchema = new mongoose.Schema(
  {
    // scheduledAt: { type: Date, required: true },
    scheduledAt: { type: String },
    action: {
      type: String,
      //   enum: ["Scheduled", "Rescheduled", "Cancelled"],
      //   required: true,
    },
    // reason: { type: String },
    reasonCode: { type: String }, // e.g. "candidate_requested"
    comment: { type: String }, // only when reasonCode === "other"
    // participants: [participantSchema], //this will track participants joined or not in video call or interview
    interviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contacts" }], //when user select outsource or internal this will track

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    // updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Main Interview Round Schema
const MockInterviewRoundSchema = new mongoose.Schema(
  {
    mockInterviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MockInterview",
    },
    sequence: Number,
    roundTitle: String,
    interviewMode: String,
    interviewType: String, // instant or schedule later
    interviewerType: String, // Internal or External
    duration: String,
    instructions: String,

    // Current scheduled date/time
    dateTime: String,

    interviewerViewType: String,
    interviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contacts" }],

    // Current lifecycle status
    status: {
      type: String,
      enum: [
        "Draft",
        "RequestSent",
        "Scheduled",
        "InProgress",
        "Completed",
        "InCompleted",
        "Cancelled",
        "NoShow",
        "FeedbackPending",
        "FeedbackSubmitted",
      ],
      default: "Draft",
    },

    // Track last and current actions + reasons
    /* ------------------------------------
     * Current Action Tracking
     * ---------------------------------- */
    currentAction: { type: String }, // e.g. Rescheduled
    previousAction: {
      type: String,
    },
    currentActionReason: { type: String }, // reasonCode
    comments: { type: String }, // only for "other"

    // Full history of all scheduling attempts
    history: [roundScheduleSchema],

    participants: {
      type: [participantSchema],
      default: [],
    },

    // Extra
    meetingId: String,
    meetPlatform: String,
  },
  { timestamps: true }
);

// Check if model is already defined to avoid overwriting
const MockInterviewRound =
  mongoose.models.MockInterviewRound ||
  mongoose.model("MockInterviewRound", MockInterviewRoundSchema);

module.exports = { MockInterviewRound };
