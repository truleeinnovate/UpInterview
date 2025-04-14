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

const interviewRoundsSchema = new mongoose.Schema({
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview" },
    sequence: Number,
    roundTitle: String,
    interviewMode: String,
    interviewType: String, // instant or schedule later
    interviewerType: String, // internal or external
    duration: String,
    instructions: String,
    dateTime: String,
    interviewers: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Contacts' }
    ],
    status: String, // draft - if accept - scheduled, if request sent then (request sent)
    meetingId: String,
    meetLink: [
        { 
            type: String, // candidate, host, interviewers
            link: String
        }
    ],
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "assessment" },
    rejectionReason:String
});

const InterviewRounds = mongoose.model("InterviewRounds", interviewRoundsSchema);

module.exports = { InterviewRounds };
