
const mongoose = require("mongoose")

const interviewQuestionSchema = new mongoose.Schema({
    tenantId:{type:String,required:true} ,//tenant reference
    ownerId:{type:String,required:true} ,//User who added the question
    questionId:{type:mongoose.Schema.Types.Mixed,required:false},
    source:{type:String,enum:["system","tenant","custom"],required:true} ,//source of the question
    snapshot:{type:mongoose.Schema.Types.Mixed,required:true},
    addedBy:{type:String,enum:["scheduler","interviewer"],required:true}, //Role who added the question
},{timestamps:true})

module.exports = mongoose.model("InterviewQuestions",interviewQuestionSchema) 
