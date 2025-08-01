
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




// v1.0.0  -  Ashraf  -  removed cretedat because we are already using timestamp
// v1.0.1  -  Ashraf  -  removed reschedule and added extended in enum

const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({ 
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'assessmentQuestions', required: true },
    answer: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        set: function(answer) {
            // If it's an object (like from interview questions), stringify it
            if (typeof answer === 'object' && answer !== null) {
                return JSON.stringify(answer);
            }
            // If it's already a string, return as is
            return answer;
        },
        get: function(answer) {
            try {
                // Try to parse the answer if it's a JSON string
                return JSON.parse(answer);
            } catch (e) {
                // If parsing fails, return as is
                return answer;
            }
        }
    },
    isCorrect: { type: Boolean, default: null },
    score: { type: Number, default: 0 },
    isAnswerLater: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now },
    notes: { type: String } // For backward compatibility with interview questions
},{ 
    timestamps: true,
    toJSON: { getters: true }, // Apply getters when converting to JSON
    toObject: { getters: true } // Apply getters when converting to object
});

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
        // <-------------------------------v1.0.1
        enum: ['pending', 'in_progress', 'completed', 'cancelled', 'failed','pass', 'extended',"expired"],
        // ------------------------------v1.0.1 >
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
       // <-------------------------------v1.0.0
    // createdAt: { type: Date, default: Date.now },   
 // ------------------------------v1.0.0 > 
    completionTime: { type: String },
    sections: [sectionSchema],
    remainingTime: { type: Number, default: null }, // Time left in seconds
    lastSelectedSection:{type:Number}

 
},{timestamps:true});


const CandidateAssessment = mongoose.model('CandidateAssessment', CandidateAssessmentSchema)

module.exports = {CandidateAssessment}