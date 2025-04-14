// const questionSchema = new mongoose.Schema({
//     Question: String,
//     QuestionType: String,
//     DifficultyLevel: String,
//     Score: Number,
//     Options: [String],
//     Answer: String,
//     ProgrammingDetails: [{
//         language: String,
//         code: String,
//         testCases: [{
//             name: String,
//             input: String,
//             output: String,
//             marks: Number
//         }]
//     }],
//     Hint: String,
//     AutoAssessment: {
//         enabled: Boolean,
//         matching: {
//             type: String,
//             enum: ['Exact', 'Contains'],
//             default: 'Exact'
//         }
//     },
//     CharLimits: { 
//         min: Number,
//         max: Number
//     },
// });
const mongoose = require('mongoose');
// const sectionSchema = new mongoose.Schema({
//     SectionName: String,
//     Questions:[{type:mongoose.Schema.Types.ObjectId,ref:"assessmentQuestions"}],
//     passScore:Number

// });

const assessmentSchema = new mongoose.Schema({
    AssessmentTitle: String,
    // AssessmentType: [String],
    Position: String,
    Duration: String,
    DifficultyLevel: String,
    NumberOfQuestions: Number,
    ExpiryDate: Date,
    // Sections: [
    //     sectionSchema
    // ],
    CandidateDetails: {
        includePosition: { type: Boolean, default: false },
        includePhone: { type: Boolean, default: false },
    },
    Instructions: String,
    AdditionalNotes: String,
    totalScore: { 
        type: Number, 
        // required: function() { return this.passScoreBy === "Overall"; } // Required only for Overall
    },
    passScore: { 
        type: Number, 
        // required: function() { return this.passScoreBy === "Overall"; } // Required only for Overall
    },
    passScoreType: { 
        type: String, 
        enum: ["Percentage", "Number"], 
        // required: true 
    },
    passScoreBy: { 
        type: String, 
        enum: ["Overall", "Each Section"], 
        // required: true 
    },
    CreatedBy: String,
    ModifiedDate: Date,
    ModifiedBy: String,
    status:{type:String,enum:["Active","Inactive"]},
    ownerId: String,
    tenantId: String,
});



const Assessment = mongoose.model("assessment", assessmentSchema);
module.exports = Assessment