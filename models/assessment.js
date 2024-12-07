const mongoose = require('mongoose');
const questionSchema = new mongoose.Schema({
    Question: String,
    QuestionType: String,
    DifficultyLevel: String,
    Score: Number,
    Options: [String],
    Answer: String,
    ProgrammingDetails: [{
        language: String,
        code: String,
        testCases: [{
            name: String,
            input: String,
            output: String,
            marks: Number
        }]
    }],
    Hint: String,
    AutoAssessment: {
        enabled: Boolean,
        matching: {
            type: String,
            enum: ['Exact', 'Contains'],
            default: 'Exact'
        }
    },
    CharLimits: { 
        min: Number,
        max: Number
    },
    // CreatedBy: String,
    // CreatedDate: {
    //     type: Date,
    //     default: Date.now
    // },
    // ModifiedDate: Date,
    // ModifiedBy: String,
});

const sectionSchema = new mongoose.Schema({
    Category: String,
    SectionName: String,
    Questions: [questionSchema],
    // passScore: Number,
    // CreatedDate: {
    //     type: Date,
    //     default: Date.now
    // },
    // CreatedById: String,
    // LastModifiedById: String,
    // OwnerId: String,
});

const assessmentSchema = new mongoose.Schema({
    AssessmentTitle: String,
    AssessmentType: [String],
    Position: String,
    Duration: String,
    DifficultyLevel: String,
    NumberOfQuestions: Number,
    ExpiryDate: Date,
    Sections: {
        type: [sectionSchema],
        default: undefined 
      },
    CandidateDetails: {
        includePosition: { type: Boolean, default: false },
        includePhone: { type: Boolean, default: false },
        // includeSkills: { type: Boolean, default: false },
    },
    Instructions: String,
    AdditionalNotes: String,
    totalScore: Number,
    passScore: Number,
    CreatedBy: String,
    ModifiedDate: Date,
    ModifiedBy: String,
    CandidateIds: {
        type: [mongoose.Schema.Types.ObjectId],
        default: undefined
      },
    OwnerId: String,
    orgId: String,
});

const assessmentHistorySchema = new mongoose.Schema({
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
    AssessmentTitle: String,
    AssessmentType: [String],
    Position: String,
    Duration: String,
    TotalScore: Number,
    DifficultyLevel: String,
    NumberOfQuestions: Number,
    ExpiryDate: Date,
    Sections: [sectionSchema],
    CreatedBy: String,
    CandidateIds: [mongoose.Schema.Types.ObjectId],
    OwnerId: String,
    orgId: String,
    ModifiedDate: { type: Date, default: Date.now },
    ModifiedBy: String,
});

const Assessment = mongoose.model("Assessment", assessmentSchema);
const AssessmentHistory = mongoose.model("AssessmentHistory", assessmentHistorySchema);

module.exports = { Assessment, AssessmentHistory };