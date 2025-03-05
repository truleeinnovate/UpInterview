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
});

const sectionSchema = new mongoose.Schema({
    SectionName: String,
    Questions:[{type:mongoose.Schema.Types.ObjectId,ref:"assessmentQuestions"}],
    passScore:Number

});

const assessmentSchema = new mongoose.Schema({
    AssessmentTitle: String,
    AssessmentType: [String],
    Position: String,
    Duration: String,
    DifficultyLevel: String,
    NumberOfQuestions: Number,
    ExpiryDate: Date,
    Sections: [
        sectionSchema
    ],
    CandidateDetails: {
        includePosition: { type: Boolean, default: false },
        includePhone: { type: Boolean, default: false },
    },
    Instructions: String,
    AdditionalNotes: String,
    totalScore: Number,
    // shashank
    passScoreType:String,
    passScoreBy:String,
    passScore: Number,
    CreatedBy: String,
    ModifiedDate: Date,
    ModifiedBy: String,
    status:{type:String,enum:["Active","Inactive"]},
    ownerId: String,
    tenantId: String,
});



const Assessment = mongoose.model("assessment", assessmentSchema);
module.exports = Assessment