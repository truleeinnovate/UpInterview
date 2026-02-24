// v1.0.0 - Venkatesh - Added hold transaction tracking and settlement status fields for interview payment management
// Policy usage:
// This schema is the main source of truth for applying interview reschedule / cancellation / no-show policies
// during payout settlement. The WalletControllers.settleInterviewPayment function reads:
// - status (Completed / Cancelled / NoShow / InCompleted / Incomplete)
// - currentAction (e.g. Interviewer_NoShow)
// - history[] (schedule / reschedule / cancel timestamps)
// - dateTime (scheduled start)
// to decide which policy bracket should be applied for that round.
// Policy usage note:
// This model is the main source of truth for applying interview reschedule / cancellation / no-show policies
// during settlement. The WalletControllers.settleInterviewPayment function reads:
// - status (Completed / Cancelled / NoShow / InCompleted / Incomplete)
// - currentAction (e.g. Interviewer_NoShow)
// - history[] (schedule / reschedule / cancel timestamps)
// - dateTime (scheduled start)
// to determine the correct payout bracket and refund behaviour.

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
  { _id: false },
);

// Only schedule / reschedule / cancel info
// Each history entry represents one policy-relevant event (Scheduled / Rescheduled / Cancelled)
// and is used by settlement logic to calculate how many hours before the interview
// the change happened, so the correct time bracket (>24h, 12–24h, 2–12h, <2h) can be applied.
// Each entry here represents one policy-relevant event (Scheduled / Rescheduled / Cancelled)
// and is used by settlement logic to calculate how many hours before the interview
// a cancellation happened, so that the correct policy bracket can be applied.
const roundHistorySchema = new mongoose.Schema(
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
  },
);

// Main Interview Round Schema
const interviewRoundSchema = new mongoose.Schema(
  {
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview" },
    sequence: Number,
    roundTitle: String,
    interviewMode: String,
    interviewType: String, // instant or schedule later
    interviewerType: String, // Internal or External
    duration: String,
    instructions: String,

    participants: {
      type: [participantSchema],
      default: [],
    },

    // candidateJoined: { type: Boolean, default: false },
    // interviewerJoined: { type: Boolean, default: false },
    // participantSchema,
    // Current scheduled date/time
    // dateTime: { type: Date },

    // Current scheduled date/time

    dateTime: String,
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      // required: true,
    },
    interviewerViewType: String,
    // interviewerGroupName: String,
    // interviewerGroupId: String,
    interviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contacts" }],
    InterviewerTags: [
      { type: mongoose.Schema.Types.ObjectId, ref: "InterviewerTag" },
    ],
    TeamsIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "MyTeams" }],

    // Candidate (always one per round, included in participants too if needed)
    // candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },

    // Current lifecycle status
    status: {
      type: String,
      enum: [
        "Draft",
        "RequestSent",
        "Scheduled",
        "InProgress",
        "Rescheduled",
        "Completed",
        "InCompleted",
        "Incomplete",

        // "",
        // "Rejected",
        // "Selected",
        "Cancelled",
        // "Incomplete",
        // "MarkedIncomplete",
        "NoShow",
        "Skipped",
        "Evaluated",
        "FeedbackPending",
        "FeedbackSubmitted",
      ],
      default: "Draft",
    },

    // noShowJobId: {
    //   type: mongoose.Schema.Types.ObjectId, // Agenda job _id is ObjectId
    //   default: null,
    //   // sparse: true,
    // },

    noShowJobId: { type: String, default: null },

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

    /* ------------------------------------
     * History (append-only)
     * ---------------------------------- */
    history: [roundHistorySchema],

    /* ------------------------------------
     * Meeting / Assessment
     * ---------------------------------- */
    meetingId: String,
    meetPlatform: String,
    recordingUrl: String, // VideoSDK cloud recording download URL (latest)
    recordingUrls: [String], // All recording URLs for this round
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },
    scheduleAssessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ScheduledAssessment",
    },

    roundOutcome: String, //STRONG_YES | YES | NEUTRAL | NO | STRONG_NO
    roundScore: Number, //1–5

    // External system identifier
    externalId: { type: String, sparse: true, index: true }, // External system identifier

    // Wallet hold tracking for outsourced interviewer payments
    // holdTransactionId: { type: String },
    // heldAmount: { type: Number },
  },
  { timestamps: true },
);

// Add middleware to track status changes for internal interview usage
const {
  handleInterviewStatusChange,
} = require("../../services/interviewUsageService");

// Pre-save hook to track status changes
interviewRoundSchema.pre("save", async function (next) {
  try {
    // Check if status has changed
    if (this.isModified("status") && !this.isNew) {
      const oldStatus = this._original_status || "Draft";
      const newStatus = this.status;

      // Only track for Internal interviews
      if (this.interviewerType === "Internal") {
        const Interview = require("../Interview/Interview").Interview;
        const interview = await Interview.findById(this.interviewId);

        if (interview) {
          const result = await handleInterviewStatusChange(
            this._id,
            oldStatus,
            newStatus,
            {
              tenantId: interview.tenantId,
              ownerId: interview.ownerId,
            },
          );

          if (!result.success && newStatus === "Scheduled") {
            // If scheduling fails due to usage limit, prevent the save
            return next(new Error(result.message || "Usage limit exceeded"));
          }
        }
      }
    }

    next();
  } catch (error) {
    console.error("[InterviewRounds] Error in pre-save hook:", error);
    next(error);
  }
});

// Pre-findOneAndUpdate hook to track the original status
interviewRoundSchema.pre("findOneAndUpdate", async function () {
  const docToUpdate = await this.model.findOne(this.getQuery());
  if (docToUpdate) {
    this._originalDoc = docToUpdate;
  }
});

// Post-findOneAndUpdate hook to handle status change
interviewRoundSchema.post("findOneAndUpdate", async function (doc) {
  try {
    if (!doc || !this._originalDoc) return;

    const oldStatus = this._originalDoc.status;
    const newStatus = doc.status;

    // Check if status changed and it's an Internal interview
    if (oldStatus !== newStatus && doc.interviewerType === "Internal") {
      const Interview = require("../Interview/Interview").Interview;
      const interview = await Interview.findById(doc.interviewId);

      if (interview) {
        await handleInterviewStatusChange(doc._id, oldStatus, newStatus, {
          tenantId: interview.tenantId,
          ownerId: interview.ownerId,
        });
      }
    }
  } catch (error) {
    console.error(
      "[InterviewRounds] Error in post-findOneAndUpdate hook:",
      error,
    );
  }
});

const {
  scheduleOrRescheduleNoShow,
} = require("../../services/interviews/roundNoShowScheduler");

// After create
interviewRoundSchema.post("save", async function (doc) {
  // Skip if this is just a noShowJobId update
  if (
    this.isModified("noShowJobId") &&
    !this.isModified("dateTime") &&
    !this.isModified("status")
  ) {
    return;
  }

  if (doc.isNew || doc.isModified("dateTime") || doc.isModified("status")) {
    await scheduleOrRescheduleNoShow(doc);
  }
});

// After update
interviewRoundSchema.post("findOneAndUpdate", async function (doc) {
  // if (doc) {
  //   await scheduleOrRescheduleNoShow(doc);
  // }

  if (!doc) return;

  // Check if the update was for scheduling-relevant fields
  const update = this.getUpdate();
  const isSchedulingUpdate =
    update.$set?.dateTime ||
    update.$set?.status ||
    update.$set?.interviewerType;

  // Skip if only noShowJobId was updated
  if (!isSchedulingUpdate && update.$set?.noShowJobId) {
    return;
  }

  if (isSchedulingUpdate) {
    await scheduleOrRescheduleNoShow(doc);
  }
});

const InterviewRounds = mongoose.model("InterviewRounds", interviewRoundSchema);
module.exports = { InterviewRounds };
