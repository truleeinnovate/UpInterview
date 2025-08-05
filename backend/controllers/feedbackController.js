//<----v1.0.0---Venkatesh-----get feedback by tenant ID


const FeedbackModel = require('../models/feedback.js')
const mongoose = require('mongoose'); // Import mongoose to use ObjectId

const createFeedback =async(req,res)=>{
    try {
        const {tenantId,interviewId,candidateId,candidate,interviewerId,questionFeedback,generalComments,skills,overallImpression}= req.body
        const FeedbackInstance = await FeedbackModel({tenantId,interviewId,candidateId,candidate,interviewerId,questionFeedback,generalComments,skills,overallImpression})
        await FeedbackInstance.save()

        return res.status(201).send({
            success:true,
            message:"Feedback added"
        })
    } catch (error) {
        return res.status(500).send({
            message:"Failed to add Feedback",
            success:false,
            error:error.message,
        })
    }
}

//<----v1.0.0---
// Get feedback by tenant ID
const getFeedbackByTenantId = async (req, res) => {
  try {
    const { tenantId } = req.params;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: "Tenant ID is required"
      });
    }

    //console.log('Received tenantId:', tenantId);

    let feedback;
    try {
      // Convert tenantId string to ObjectId since database stores it as ObjectId
      //const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
      feedback = await FeedbackModel.find({ tenantId })
        .populate('candidateId', 'FirstName LastName Email Phone skills')
        .populate('positionId', 'title companyname jobDescription Location')
        .populate('interviewRoundId', 'roundTitle interviewMode interviewType interviewerType duration instructions dateTime status')
        .populate('interviewerId','firstName lastName');

      //console.log('Feedback found:', feedback.length, 'documents');
    } catch (err) {
      console.error('Invalid tenantId format:', err.message);
      return res.status(400).json({
        success: false,
        message: "Invalid Tenant ID format: " + err.message
      });
    }

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "No feedback found for this tenant"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Feedback retrieved successfully",
      data: feedback
    });

  } catch (error) {
    //console.error("Error getting feedback by tenant ID:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while getting feedback",
      error: error.message
    });
  }
};

const getfeedbackById =async(req,res)=>{
    try {
        const {id} = req.params
        const feedback = await FeedbackModel.findById(id)
        if(!feedback){
            return res.status(404).json({
                success:false,
                message:"Feedback not found"
            })
        }
        return res.status(200).json({
            success:true,
            message:"Feedback retrieved successfully",
            data:feedback
        })
    } catch (error) {
        console.error("Error getting feedback by ID:", error);
        return res.status(500).json({
            success:false,
            message:"Internal server error while getting feedback",
            error:error.message
        })
    }
}

const getAllFeedback = async(req,res)=>{
    try {
        const feedback = await FeedbackModel.find()
        if(!feedback){
            return res.status(404).json({
                success:false,
                message:"Feedback not found"
            })
        }
        return res.status(200).json({
            success:true,
            message:"Feedback retrieved successfully",
            data:feedback
        })
    } catch (error) {
        console.error("Error getting feedback by ID:", error);
        return res.status(500).json({
            success:false,
            message:"Internal server error while getting feedback",
            error:error.message
        })
    }
}


//----v1.0.0--->

module.exports={createFeedback, getFeedbackByTenantId,getfeedbackById,getAllFeedback}