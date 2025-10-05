const mongoose = require("mongoose");

// Participants (Candidate + Interviewer + Scheduler)
const participantSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["Candidate", "Interviewer", "Scheduler"], required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Contacts" }, // optional for candidate
    joinedAt: { type: Date },
    status: { type: String, enum: ["Joined", "Not Joined"] },
  },
  { _id: false }
);

// Only schedule / reschedule / cancel info
const roundScheduleSchema = new mongoose.Schema(
  {
    scheduledAt: { type: Date, required: true },
    action: { type: String, enum: ["Scheduled", "Rescheduled"], required: true },
    reason: { type: String },
    participants: [participantSchema],
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Main Interview Round Schema
const MockInterviewRoundSchema = new mongoose.Schema({
  mockInterviewId: { type: mongoose.Schema.Types.ObjectId, ref: "MockInterview" },
  sequence: Number,
  roundTitle: String,
  interviewMode: String,
  interviewType: String, // instant or schedule later
  interviewerType: String, // internal or external
  duration: String,
  instructions: String,

  // Current scheduled date/time
  // dateTime: { type: Date },

  
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
      "Rescheduled",
      "Rejected",
      "Selected",
      "Cancelled",
      "Incomplete",
      "NoShow"
    ],
    default: "Draft",
  },

// Track last and current actions + reasons
currentAction: {
    type: String,
    enum: [
      "Candidate_NoShow",
      "Interviewer_NoShow",
      "Technical_Issue"
    ],
    default: null,
  },
  previousAction: {
    type: String,
    enum: [
      "Candidate_NoShow",
      "Interviewer_NoShow",
      "Technical_Issue"
    ],
    default: null,
  },
  currentActionReason: { type: String },
  previousActionReason: { type: String },
  supportTickets: [{ type: mongoose.Schema.Types.ObjectId, ref: "SupportUser" }],

  // Full history of all scheduling attempts
  history: [roundScheduleSchema],

  // Extra
  meetingId: String,
  rejectionReason: String,
});

const MockInterviewRound = mongoose.model("MockInterviewRound", MockInterviewRoundSchema);
module.exports = { MockInterviewRound };