const mongoose = require("mongoose")

const interviewQuestionSchema = new mongoose.Schema({
      interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
      roundId: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewRounds' },
    //no need of interviewId because this schema id we are saving in parent schema(interview)
      order: { type: Number },
      customizations: { type: String },
      mandatory: { type: String },

    //   mende
    tenantId:{type:String} ,//tenant reference
    ownerId:{type:String} ,//User who added the question
    questionId:{type:mongoose.Schema.Types.Mixed,required:false},
    source:{type:String,enum:["system","tenant","custom"]} ,//source of the question
    snapshot:{type:mongoose.Schema.Types.Mixed,required:true},
    addedBy:{type:String,enum:["scheduler","interviewer"]}, //Role who added the question
},{timestamps:true})

module.exports = mongoose.models.InterviewQuestions || mongoose.model("SelectedInterviewQuestion",interviewQuestionSchema) 
