
// const mongoose = require('mongoose');

// const interviewRoundSchema = new mongoose.Schema({
//     interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview" },
//     sequence: Number,
//     roundTitle: { type: String },
//     interviewMode: { type: String },
//     interviewType: { type: String }, // instant or schedule later
//     interviewerType: { type: String }, // internal or external
//     duration: { type: String },
//     instructions: { type: String },
//     dateTime: { type: String },
//     interviewerViewType: { type: String },
//     interviewerGroupName: { type: String },
//     interviewers: [
//         { type: mongoose.Schema.Types.ObjectId, ref: 'Contacts' }
//     ],
//     // <------------------------ v1.0.0
//     // Round lifecycle status
//     status: {
//         type: String,
//         enum: [
//             "Draft",
//             "RequestSent",
//             "Scheduled",
//             "InProgress",
//             "Completed",
//             "InCompleted",
//             "Rescheduled",
//             "Rejected",
//             "Selected",
//             "Cancelled",
//             "Incomplete",
//         ],
//         default: "Draft"
//     },

//     // Current event (latest only)
//     event: {
//         type: String,
//         enum: [
//             null,
//             "Candidate_NoShow",
//             "Interviewer_NoShow",
//             "Technical_Issue"
//         ],
//         default: null
//     },

//     // Reason for current event
//     eventReason: { type: String },

//     // Count how many times this round was rescheduled
//     rescheduleCount: { type: Number, default: 0 },

//     // Event history with attempt tracking
//     eventHistory: [{
//         rescheduleAttempt: { type: Number }, // links event to attempt
//         action: { type: String },            // Candidate_NoShow, Cancelled, etc.
//         reason: { type: String },
//         createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//         createdAt: { type: Date, default: Date.now }
//     }],

//     participants: [{
//         role: { type: String, enum: ["Candidate", "Interviewer"] },
//         // interviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "Contacts" },
//         joinedAt: { type: Date, default: Date.now }, // only track join time
//         status: { 
//             type: String, 
//             enum: ["Joined", "Not Joined"], 
//             default: "Not Joined" 
//         }
//     }],
    
//     // v1.0.0------------------------->
//     meetingId: String,
//     assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "assessment" },
//     scheduleAssessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "ScheduledAssessment" },
    
//     // questions: [{
//     //     questionId: { type: mongoose.Schema.Types.Mixed },
//     //     snapshot: { type: mongoose.Schema.Types.Mixed }
//     // }],

//     rejectionReason: String
// });

// const InterviewRounds = mongoose.model("InterviewRounds", interviewRoundSchema);

// module.exports = { InterviewRounds };


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
const interviewRoundSchema = new mongoose.Schema({
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview" },
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
  // interviewerGroupName: String,
  interviewerGroupId: String,
  interviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contacts" }],

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
  meetPlatform: String,
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },
  
  scheduleAssessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "ScheduledAssessment" },
  rejectionReason: String,
}, { timestamps: true });

// Add middleware to track status changes for internal interview usage
const { handleInterviewStatusChange } = require('../../services/interviewUsageService');

// Pre-save hook to track status changes
interviewRoundSchema.pre('save', async function(next) {
  try {
    // Check if status has changed
    if (this.isModified('status') && !this.isNew) {
      const oldStatus = this._original_status || 'Draft';
      const newStatus = this.status;
      
      // Only track for internal interviews
      if (this.interviewerType === 'internal') {
        // Get the interview details for tenantId and ownerId
        const Interview = require('../Interview/Interview').Interview;
        const interview = await Interview.findById(this.interviewId);
        
        if (interview) {
          const result = await handleInterviewStatusChange(
            this._id,
            oldStatus,
            newStatus,
            {
              tenantId: interview.tenantId,
              ownerId: interview.ownerId
            }
          );
          
          if (!result.success && newStatus === 'Scheduled') {
            // If scheduling fails due to usage limit, prevent the save
            return next(new Error(result.message || 'Usage limit exceeded'));
          }
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('[InterviewRounds] Error in pre-save hook:', error);
    next(error);
  }
});

// Pre-findOneAndUpdate hook to track the original status
interviewRoundSchema.pre('findOneAndUpdate', async function() {
  const docToUpdate = await this.model.findOne(this.getQuery());
  if (docToUpdate) {
    this._originalDoc = docToUpdate;
  }
});

// Post-findOneAndUpdate hook to handle status change
interviewRoundSchema.post('findOneAndUpdate', async function(doc) {
  try {
    if (!doc || !this._originalDoc) return;
    
    const oldStatus = this._originalDoc.status;
    const newStatus = doc.status;
    
    // Check if status changed and it's an internal interview
    if (oldStatus !== newStatus && doc.interviewerType === 'internal') {
      const Interview = require('../Interview/Interview').Interview;
      const interview = await Interview.findById(doc.interviewId);
      
      if (interview) {
        await handleInterviewStatusChange(
          doc._id,
          oldStatus,
          newStatus,
          {
            tenantId: interview.tenantId,
            ownerId: interview.ownerId
          }
        );
      }
    }
  } catch (error) {
    console.error('[InterviewRounds] Error in post-findOneAndUpdate hook:', error);
  }
});

const InterviewRounds = mongoose.model("InterviewRounds", interviewRoundSchema);
module.exports = { InterviewRounds };
