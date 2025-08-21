// v1.0.0  -  mansoor  -  added total statuses to the enum

// const mongoose = require('mongoose');

// const interviewRoundsSchema = new mongoose.Schema({
//     interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview" },
//     rounds: [
//         {
//             sequence: Number,
//             roundTitle: String,
//             interviewMode: String,
//             interviewType: String, // instant or schedule later
//             interviewerType: String, // internal or external
//             duration: String,
//             instructions: String,
//             dateTime: String,
//             interviewers: [
//                 { type: mongoose.Schema.Types.ObjectId, ref: 'Contacts' }
//             ],
//             status: String, // draft - if accept - scheduled, if request sent then (request sent)
//             questions: [
//                 { type: mongoose.Schema.Types.ObjectId, ref: "InterviewQuestions" }
//             ],
//             meetingId: String,
//             meetLink:[
//                 { type: String,//candidate,host,interviwers
//                     link: String
//                  }
//             ],
//             assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },
//         }
//     ],
// });

// const InterviewRounds = mongoose.model("InterviewRounds", interviewRoundsSchema);

// module.exports = { InterviewRounds };


const mongoose = require('mongoose');

const interviewRoundSchema = new mongoose.Schema({
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview" },
    sequence: Number,
    roundTitle: { type: String },
    interviewMode: { type: String },
    interviewType: { type: String }, // instant or schedule later
    interviewerType: { type: String }, // internal or external
    duration: { type: String },
    instructions: { type: String },
    dateTime: { type: String },
    interviewerViewType: { type: String },
    interviewerGroupName: { type: String },
    interviewers: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Contacts' }
    ],
    // <------------------------ v1.0.0
    // Round lifecycle status
    status: {
        type: String,
        enum: [
            "Draft",
            "RequestSent",
            "Scheduled",
            "InProgress",
            "Completed",
            "Rescheduled",
            "Rejected",
            "Selected",
            "Cancelled"
        ],
        default: "Draft"
    },

    // Current event (latest only)
    event: {
        type: String,
        enum: [
            null,
            "Candidate_NoShow",
            "Interviewer_NoShow",
            "Technical_Issue"
        ],
        default: null
    },

    // Reason for current event
    eventReason: { type: String },

    // Count how many times this round was rescheduled
    rescheduleCount: { type: Number, default: 0 },

    // Event history with attempt tracking
    eventHistory: [{
        rescheduleAttempt: { type: Number }, // links event to attempt
        action: { type: String },            // Candidate_NoShow, Cancelled, etc.
        reason: { type: String },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now }
    }],
    // v1.0.0------------------------->
    meetingId: String,
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "assessment" },
    scheduleAssessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "ScheduledAssessment" },
    
    questions: [{
        questionId: { type: mongoose.Schema.Types.Mixed },
        snapshot: { type: mongoose.Schema.Types.Mixed }
    }],

    rejectionReason: String
});

const InterviewRounds = mongoose.model("InterviewRounds", interviewRoundSchema);

module.exports = { InterviewRounds };
