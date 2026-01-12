// v1.0.0 - Ashok - Added value withdrawn at enum for status

const mongoose = require("mongoose");

const OutsourceInterviewRequestSchema = new mongoose.Schema(
  {
    interviewRequestCode: { type: String, unique: true },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
    },
    ownerId: {
      type: String,
    },
    scheduledInterviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
    },
    interviewerType: {
      type: String,
    },
    // interviewerIds: [{
    //     _id: false,
    //     id: { type: mongoose.Schema.Types.ObjectId, ref: 'Contacts' },
    //     status: { type: String, enum: ['inprogress', 'accepted', 'declined'], default: 'inprogress' }
    // }],
    interviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "Contacts" }, // Single interviewer per request
    dateTime: {
      type: String,
    },
    duration: {
      type: String,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
    }, //only for interviews
    isMockInterview: {
      type: Boolean,
      default: false,
    }, //is mock interview true use contactId else use candidateId
    // contactId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Contacts",
    // }, //from mockinterview candidate
    positionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Position",
    },
    status: {
      type: String,
      enum: [
        "inprogress",
        "accepted",
        "declined",
        "expired",
        "cancelled",
        "withdrawn",
      ],
      default: "inprogress",
    },
    // roundNumber: {
    //     type: String,
    // },
    roundId: {
      type: mongoose.Schema.Types.ObjectId,
      // ref: "InterviewRounds",
    }, //both mock and interviews saves here
    requestMessage: {
      type: String,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
    },
    expiryDateTime: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "InterviewRequest",
  OutsourceInterviewRequestSchema
);
