
const mongoose = require('mongoose')

const assessmentQuestionsSchema = new mongoose.Schema({
    assessmentId:{type:mongoose.Schema.Types.ObjectId,ref:"Assessment",required:true},
    questionId:{type:mongoose.Schema.Types.ObjectId,required:true},
    source:{type:String,enum:["system","custom"],required:true},
    snapshot:{type:mongoose.Schema.Types.Mixed,required:true},
    order:Number,
    customizations:{type:mongoose.Schema.Types.Mixed,default:null}
},{timestamps:true})

module.exports  = mongoose.model("assessmentQuestions",assessmentQuestionsSchema)


