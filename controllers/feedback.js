
const FeedbackModel = require('../models/feedback')

const createFeedback =async(req,res)=>{
    try {
        const {tenantId,interviewId,candidateId,candidate,interviewerId,questionFeedback,generalComments,skills,overallImpression}= req.body
        const FeedbackInstance = await FeedbackModel({tenantId,interviewId,candidateId,candidate,interviewerId,questionFeedback,generalComments,skills,overallImpression})
        console.log('response',FeedbackInstance)
        await FeedbackInstance.save()

        return res.status(201).send({
            success:true,
            message:"Feedback added"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            message:"Failed to add Feedback",
            success:false,
            error:error.message,
        })
    }
}

module.exports={createFeedback}