const interviewQuestions = require("../models/interviewQuestions")


const AddQuestion = async(req,res)=>{
    try {
        const {tenantId,ownerId,questionId,source,snapshot,addedBy}=req.body 
        const questionInstance  = await interviewQuestions({
            tenantId,
            ownerId,
            questionId,
            source,
            snapshot,
            addedBy
        })
        await questionInstance.save()
        
        return res.status(201).send({
            success:true,
            message:"Question added",
            question:questionInstance
        })

    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success:false,
            message:"Failed to add question",
            message:error.message,
        })
    }
}

const GetQuestions = async(req,res)=>{
    try {
        const questions = await interviewQuestions.find()
        return res.status(200).send({
            message:"Questions retrieved",
            questions,
            success:true
        })
    } catch (error) {
        console.log(error)
        return res.status(200).send({
            message:"FailedGet retrieved",
            
            success:false 
        })
    }
}

const GetQuestionsBasedOnId = async(req,res)=>{
    try {
        const {id}=req.params
        const question = await interviewQuestions.findOne({questionId:id})
        if (!question) {
            return res.status(404).send({
              success: false,
              message: "Question not found",
            });
          }
      
        return res.status(200).send({
            success:true,
            question,
            message:"question retrieved"
        })
    } catch (error) {
        return res.status(500).send({
            success:false,
            message:"Failed to get question",
            error:error.message,
        })
    }
}

const DeleteQuestions = async(req,res)=>{
    try {
        const {id} = req.params
        await interviewQuestions.deleteOne({questionId:id})
        return res.status(200).send({
            message:"Question deleted ",
            success:true
        })
    } catch (error) {
        return res.status(200).send({
            message:"Failed to delete question",
            
            success:false 
        })
    }
}

module.exports = {AddQuestion,GetQuestions,DeleteQuestions,GetQuestionsBasedOnId}