
// const mongoose = require('mongoose');

// const AnswerSchema = new mongoose.Schema({ 
//     questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'assessmentQuestions', required: true },
//     // answer: { typeaa: mongoose.Schema.Types.Mixed, required: true },
//     answer:{type:String},
//     isCorrect: { type: Boolean, default: null },
//     score: { type: Number, default: 0 },
//     isAnswerLater: { type: Boolean, default: false },
//     submittedAt: { type: Date, default: Date.now }
// },{timestamps:true});

// const questionSnapshotSchema = new mongoose.Schema({
//     questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'assessmentQuestions' },
//     source: String,
//     snapshot: {
//       correctAnswer: String,
//       autoAssessment: mongoose.Schema.Types.Mixed,
//       difficultyLevel: String,
//     },
//     hints: [String],
//     isActive: Boolean,
//     isAdded: Boolean,
//     isAutoAssessment: Boolean, 
//     isInterviewQuestionOnly: Boolean,
//     options: [String],
//     programming: mongoose.Schema.Types.Mixed,
//     questionNo: String,
//     questionText: String,
//     questionType: String,
//     skill: [String],
//     tags: [String],
//     technology: [String],
//     score: Number,
//     order: Number,
//     customizations: mongoose.Schema.Types.Mixed,
//   }, { _id: false }); // prevent MongoDB from adding _id inside each


// const sectionSchema = new mongoose.Schema({
//     SectionName: String,    
//     Answers: [AnswerSchema],
//     questions: [questionSnapshotSchema],
//     totalScore: Number,
//     passScore: Number,
//     sectionResult: { type: String, enum: ['pass', 'fail'] },
    
// });

// const CandidateAssessmentSchema = new mongoose.Schema({
//     scheduledAssessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScheduledAssessment', required: true },
//     candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
//     status: {
//         type: String,
//         // enum: ['pending', 'in_progress', 'completed', 'cancelled', 'failed','pass', 'rescheduled'],
//         enum: ['pending', 'in_progress', 'completed', 'cancelled', 'failed','pass', 'rescheduled',"expired"],
//         default: 'pending'
//     },
//     isActive: { type: Boolean, default: true }, // Control individual schedules
//     assessmentLink: { type: String},
//     expiryAt: { type: Date, required: true },
//     startedAt: { type: Date },
//     endedAt: { type: Date },
//     progress: { type: Number, default: 0 },
//     totalScore: { type: Number, default: 0 },
//     rescheduledTo: { type: mongoose.Schema.Types.ObjectId, ref: 'CandidateAssessment' },
//     createdAt: { type: Date, default: Date.now },    
//     completionTime: { type: String },
//     sections: [sectionSchema],
//     remainingTime: { type: Number, default: null }, // Time left in seconds
//     lastSelectedSection:{type:Number}

 
// },{timestamps:true});


// const CandidateAssessment = mongoose.model('CandidateAssessment', CandidateAssessmentSchema)

// module.exports = {CandidateAssessment}

const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({ 
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'assessmentQuestions', required: true },
    // answer: { typeaa: mongoose.Schema.Types.Mixed, required: true },
    answer:{type:String},
    isCorrect: { type: Boolean, default: null },
    score: { type: Number, default: 0 },
    isAnswerLater: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now }
},{timestamps:true});


const sectionSchema = new mongoose.Schema({
    SectionName: String,
    Answers: [AnswerSchema],
    totalScore: Number,
    passScore: Number,
    sectionResult: { type: String, enum: ['pass', 'fail'] },
    
});

const CandidateAssessmentSchema = new mongoose.Schema({
    scheduledAssessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScheduledAssessment', required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
    status: {
        type: String,
        // enum: ['pending', 'in_progress', 'completed', 'cancelled', 'failed','pass', 'rescheduled'],
        enum: ['pending', 'in_progress', 'completed', 'cancelled', 'failed','pass', 'rescheduled',"expired"],
        default: 'pending'
    },
    isActive: { type: Boolean, default: true }, // Control individual schedules
    assessmentLink: { type: String},
    expiryAt: { type: Date, required: true },
    startedAt: { type: Date },
    endedAt: { type: Date },
    progress: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    rescheduledTo: { type: mongoose.Schema.Types.ObjectId, ref: 'CandidateAssessment' },
    createdAt: { type: Date, default: Date.now },    
    completionTime: { type: String },
    sections: [sectionSchema],
    remainingTime: { type: Number, default: null }, // Time left in seconds
    lastSelectedSection:{type:Number}

 
},{timestamps:true});


const CandidateAssessment = mongoose.model('CandidateAssessment', CandidateAssessmentSchema)

module.exports = {CandidateAssessment}