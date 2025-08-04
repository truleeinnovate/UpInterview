
const mongoose = require("mongoose");
const FeedbackModel = require('../models/feedback.js')

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

const getFeedbackByTenantId = async (req, res) => {
    try {
      const { tenantId } = req.params;
  
      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: "Tenant ID is required"
        });
      }
  
      console.log("Received tenantId:", tenantId);
  
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(tenantId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Tenant ID format"
        });
      }
  
      const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
  
      const feedback = await FeedbackModel.find({ tenantId: tenantObjectId })
        .populate("candidateId", "firstName lastName email")
        .populate("interviewRoundId", "roundTitle interviewMode status")
        .populate("interviewerId", "firstName lastName email");
  
      if (!feedback || feedback.length === 0) {
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
      console.error("Error getting feedback by tenant ID:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error while getting feedback",
        error: error.message
      });
    }
  };
  

module.exports={createFeedback,getFeedbackByTenantId}