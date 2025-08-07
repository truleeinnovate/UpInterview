//<----v1.0.0---Venkatesh-----get feedback by tenant ID


const FeedbackModel = require('../models/feedback.js')
const mongoose = require('mongoose'); // Import mongoose to use ObjectId

const InterviewQuestions = require('../models/interviewQuestions.js');
const { InterviewRounds } = require('../models/InterviewRounds.js');
const CandidatePosition = require('../models/CandidatePosition.js');
const { Contacts } = require('../models/Contacts.js');

const createFeedback = async (req, res) => {
    try {
        console.log('📥 Received feedback data:', req.body);
        
        const {
            tenantId,
            ownerId,
            interviewRoundId,
            candidateId,
            positionId,
            interviewerId,
            skills,
            questionFeedback,
            generalComments,
            overallImpression,
            status
        } = req.body;

        //added by venkatesh------ Check for existing feedback to prevent duplicates
        if (interviewRoundId && candidateId && interviewerId) {
            const existingFeedback = await FeedbackModel.findOne({
                interviewRoundId,
                candidateId,
                interviewerId
            });
            if (existingFeedback) {
                console.log('❌ Duplicate feedback found for this interview round, candidate, and interviewer');
                return res.status(409).json({
                    success: false,
                    message: "Feedback already exists for this interview round and candidate from this interviewer",
                    existingFeedbackId: existingFeedback._id
                });
            }
        }

        // Simple validation - just check if basic data exists
        if (!skills || !Array.isArray(skills) || skills.length === 0) {
            console.log('❌ No skills provided');
            return res.status(400).json({
                success: false,
                message: "Skills are required"
            });
        }

        // Process questionFeedback to extract only question IDs
        const processedQuestionFeedback = (questionFeedback || []).map(qFeedback => {
            const question = qFeedback.questionId; // This is the full question object from frontend
            const questionId = question?.questionId || question?.id || question?._id || "";
            
            return {
                questionId: questionId, // Store only the question ID
                candidateAnswer: qFeedback.candidateAnswer || {
                    answerType: question?.isAnswered || "not answered",
                    submittedAnswer: ""
                },
                interviewerFeedback: qFeedback.interviewerFeedback || {
                    liked: question?.isLiked || "none",
                    note: question?.note || "",
                    dislikeReason: question?.whyDislike || ""
                }
            };
        });

        // Create feedback data with defaults
        const feedbackData = {
            skills: skills,
            questionFeedback: processedQuestionFeedback,
            generalComments: generalComments || "",
            overallImpression: overallImpression || {},
            status: status || 'submitted'
        };

        // Add fields only if they are not empty strings
        if (tenantId && tenantId.trim() !== "") {
            feedbackData.tenantId = tenantId;
        }
        
        if (ownerId && ownerId.trim() !== "") {
            feedbackData.ownerId = ownerId;
        }
        
        if (interviewRoundId && interviewRoundId.trim() !== "") {
            feedbackData.interviewRoundId = interviewRoundId;
        }
        
        if (candidateId && candidateId.trim() !== "") {
            feedbackData.candidateId = candidateId;
        }
        
        if (interviewerId && interviewerId.trim() !== "") {
            feedbackData.interviewerId = interviewerId;
        }

        // Add positionId if provided and not empty
        if (positionId && positionId.trim() !== "") {
            feedbackData.positionId = positionId;
        }

        console.log('💾 Saving feedback data:', feedbackData);

        const feedbackInstance = new FeedbackModel(feedbackData);
        await feedbackInstance.save();

        console.log('✅ Feedback saved successfully with ID:', feedbackInstance._id);

        // Save questions to InterviewQuestions collection
        if (processedQuestionFeedback && processedQuestionFeedback.length > 0) {
          console.log('📝 Saving questions to InterviewQuestions collection...');
          
          const questionsToSave = processedQuestionFeedback.map((qFeedback, index) => {
            // Get the original question object from the frontend data for additional details
            const originalQuestionFeedback = questionFeedback[index];
            const question = originalQuestionFeedback?.questionId; // This is the full question object from frontend
            console.log('📋 Processing question:', question);
            
            // Extract the actual question data from the nested structure
            const actualQuestion = question?.snapshot || question;
            const questionId = qFeedback.questionId; // Use the processed question ID
            
            return {
              interviewId: interviewRoundId, // Using interviewRoundId as interviewId
              roundId: interviewRoundId,
              order: index + 1,
              customizations: qFeedback.interviewerFeedback?.note || '',
              mandatory: question?.mandatory || actualQuestion?.mandatory || 'false',
              tenantId: tenantId || '',
              ownerId: interviewerId || '',
              questionId: questionId,
              source: question?.source || 'system',
              snapshot: actualQuestion || {},
              addedBy: 'interviewer'
            };
          });

          console.log('📋 Questions to save:', questionsToSave);

          // Save each question to InterviewQuestions collection
          const savedQuestions = await Promise.all(
            questionsToSave.map(async (questionData) => {
              try {
                const questionInstance = new InterviewQuestions(questionData);
                const savedQuestion = await questionInstance.save();
                console.log('✅ Question saved:', savedQuestion._id);
                return savedQuestion;
              } catch (error) {
                console.error('❌ Error saving question:', error);
                throw error;
              }
            })
          );

          console.log('✅ Questions saved successfully:', savedQuestions.length, 'questions');
        }

        return res.status(201).json({
            success: true,
            message: "Feedback submitted successfully",
            data: {
                feedbackId: feedbackInstance._id,
                submittedAt: feedbackInstance.createdAt
            }
        });

    } catch (error) {
        console.error("❌ Error creating feedback:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to submit feedback",
            error: error.message
        });
    }
};

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
 
    let feedbackWithQuestions;
    let feedback;
    try {
      // Convert tenantId string to ObjectId since database stores it as ObjectId
      //const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
      feedback = await FeedbackModel.find({ tenantId })
        .populate('candidateId', 'FirstName LastName Email Phone skills CurrentExperience')
        .populate('positionId', 'title companyname jobDescription Location')
        .populate('interviewRoundId', 'roundTitle interviewMode interviewType interviewerType duration instructions dateTime status')
        .populate('interviewerId','firstName lastName')
        // .populate('ownerId', 'firstName lastName email');
 

      // Fetch pre-selected questions for each feedback item
      feedbackWithQuestions = await Promise.all(feedback.map(async (item) => {
        const preSelectedQuestions = await InterviewQuestions.find({ roundId: item.interviewRoundId });
        return {
          ...item.toObject(),
          preSelectedQuestions
        };
      }));
     
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
        message: "Feedback not found for this tenant"
      });
    }
 
    return res.status(200).json({
      success: true,
      message: "Feedback retrieved successfully",
      data: feedbackWithQuestions
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

//<----v1.0.0---Venkatesh-----get feedback by interviewer ID

const getFeedbackByInterviewerId = async (req, res) => {
  try {
    const { ownerId } = req.params;
    console.log("ownerId",ownerId)

    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: "Owner ID is required"
      });
    }


    //console.log('Received interviewerId:', interviewerId);

    let feedbackWithQuestions;
    let feedback;
    let contactId;
    try {

      contactId = await Contacts.find({ ownerId })
      const interviewerId = contactId._id;
      console.log("contactId",contactId._id);
      // Convert interviewerId string to ObjectId since database stores it as ObjectId
      //const interviewerObjectId = new mongoose.Types.ObjectId(interviewerId);
      feedback = await FeedbackModel.find({  interviewerId })
        .populate('candidateId', 'FirstName LastName Email Phone skills CurrentExperience')
        .populate('positionId', 'title companyname jobDescription Location')
        .populate('interviewRoundId', 'roundTitle interviewMode interviewType interviewerType duration instructions dateTime status')
        .populate('interviewerId','firstName lastName');
      console.log("feedback",feedback)
      // Fetch pre-selected questions for each feedback item
      feedbackWithQuestions = await Promise.all(feedback.map(async (item) => {
        const preSelectedQuestions = await InterviewQuestions.find({ roundId: item.interviewRoundId });
        return {
          ...item.toObject(),
          preSelectedQuestions
        };
      }));
      
      //console.log('Feedback found:', feedback.length, 'documents');
    } catch (err) {
      console.error('Invalid ownerId format:', err.message);
      return res.status(400).json({
        success: false,
        message: "Invalid Owner ID format: " + err.message
      });
    }

    if (!feedback || feedback.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found for this interviewer"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Feedback retrieved successfully",
      data: feedbackWithQuestions
    });

  } catch (error) {
    //console.error("Error getting feedback by interviewer ID:", error);
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
          .populate('candidateId', 'FirstName LastName Email Phone')
          .populate('positionId', 'title companyname jobDescription')
          .populate('interviewRoundId', 'roundTitle interviewMode interviewType')
          .populate('interviewerId', 'firstName lastName')
          .populate('ownerId', 'firstName lastName email');
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
          .populate('candidateId', 'FirstName LastName Email Phone')
          .populate('positionId', 'title companyname jobDescription')
          .populate('interviewRoundId', 'roundTitle interviewMode interviewType')
          .populate('interviewerId', 'firstName lastName')
          .populate('ownerId', 'firstName lastName email');
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

const getFeedbackByRoundId = async (req, res) => {
  try {
    const { roundId } = req.params;
    console.log("📌 Requested Round ID:", roundId);

    // 1️⃣ Validate roundId
    if (!mongoose.Types.ObjectId.isValid(roundId)) {
      console.log("❌ Invalid roundId:", roundId);
      return res.status(400).json({ success: false, message: "Invalid round ID" });
    }

    // 2️⃣ Find InterviewRound
    console.log("🔍 Searching for InterviewRound with ID:", roundId);
    const interviewRound = await InterviewRounds.findById(roundId)
      .populate("interviewers", "FirstName LastName Email Phone");

    console.log("✅ InterviewRound Found:", interviewRound ? "Yes" : "No");
    if (interviewRound) {
      console.log("📋 InterviewRound Details:", {
        _id: interviewRound._id,
        interviewId: interviewRound.interviewId,
        roundTitle: interviewRound.roundTitle,
        status: interviewRound.status,
        interviewersCount: interviewRound.interviewers?.length || 0
      });
    }

    if (!interviewRound) {
      console.log("❌ InterviewRound not found for ID:", roundId);
      return res.status(404).json({ success: false, message: "Interview round not found" });
    }

         // 3️⃣ Find CandidatePosition using interviewId
     console.log("🔍 Searching for CandidatePosition with interviewId:", interviewRound.interviewId);
     
     // First, let's check if there are any CandidatePosition records at all
    const totalCandidatePositions = await CandidatePosition.countDocuments();
    console.log("📊 Total CandidatePosition records in database:", totalCandidatePositions);
    
    // Check if there are any CandidatePosition records with this interviewId
    const candidatePositionsWithInterviewId = await CandidatePosition.countDocuments({
      interviewId: interviewRound.interviewId
    });
    console.log("📊 CandidatePosition records with interviewId:", candidatePositionsWithInterviewId);
    
    const candidatePosition = await CandidatePosition.findOne({
      interviewId: interviewRound.interviewId,
    })
    
      .populate('candidateId', 'FirstName LastName Email Phone skills CurrentExperience')
      .populate("positionId", "title companyname jobDescription minexperience maxexperience Location minSalary maxSalary");

    console.log("✅ CandidatePosition Found:", candidatePosition ? "Yes" : "No");
    if (candidatePosition) {
      console.log("📋 CandidatePosition Details:", {
        _id: candidatePosition._id,
        candidateId: candidatePosition.candidateId?._id,
        positionId: candidatePosition.positionId?._id,
        status: candidatePosition.status
      });
      if (candidatePosition.candidateId) {
        console.log("👤 Candidate Details:", {
          name: `${candidatePosition.candidateId.FirstName} ${candidatePosition.candidateId.LastName}`,
          email: candidatePosition.candidateId.Email,
          phone: candidatePosition.candidateId.Phone
        });
      }
      if (candidatePosition.positionId) {
        console.log("💼 Position Details:", {
          title: candidatePosition.positionId.title,
          company: candidatePosition.positionId.companyname,
          location: candidatePosition.positionId.Location
        });
      }
    } else {
      console.log("❌ No CandidatePosition found for interviewId:", interviewRound.interviewId);
      // Let's check what CandidatePosition records exist
      const allCandidatePositions = await CandidatePosition.find().limit(5);
      console.log("📋 Sample CandidatePosition records:", allCandidatePositions.map(cp => ({
        _id: cp._id,
        interviewId: cp.interviewId,
        candidateId: cp.candidateId,
        positionId: cp.positionId,
        status: cp.status
      })));
    }

    // 4️⃣ Fetch Feedback linked with this round
    console.log("🔍 Searching for Feedbacks with interviewRoundId:", roundId);
    const feedbacks = await FeedbackModel.find({
      interviewRoundId: roundId,
    })
      .populate("candidateId", "FirstName LastName Email Phone")
      .populate("positionId", "title companyname jobDescription minexperience maxexperience Location minSalary maxSalary")
      .populate("interviewerId", "FirstName LastName Email Phone")
      .populate("ownerId", "firstName lastName email");

         console.log("✅ Feedbacks Found:", feedbacks.length, "documents");
     if (feedbacks.length > 0) {
       console.log("📋 First Feedback Details:", {
         _id: feedbacks[0]._id,
         candidateId: feedbacks[0].candidateId?._id,
         interviewerId: feedbacks[0].interviewerId?._id,
         skillsCount: feedbacks[0].skills?.length || 0
       });
     }

     // 4️⃣.5 Fetch Interview Questions for this round
     console.log("🔍 Searching for Interview Questions with roundId:", roundId);
     const interviewQuestionsList = await InterviewQuestions.find({ roundId: roundId });
     console.log("✅ Interview Questions Found:", interviewQuestionsList.length, "questions");

    // 5️⃣ Get position data from feedback if not available from CandidatePosition
    let positionData = null;
    if (candidatePosition?.positionId) {
      positionData = {
        _id: candidatePosition.positionId._id,
        title: candidatePosition.positionId.title,
        companyname: candidatePosition.positionId.companyname,
        jobDescription: candidatePosition.positionId.jobDescription,
        minexperience: candidatePosition.positionId.minexperience,
        maxexperience: candidatePosition.positionId.maxexperience,
        Location: candidatePosition.positionId.Location,
        minSalary: candidatePosition.positionId.minSalary,
        maxSalary: candidatePosition.positionId.maxSalary,
        NoofPositions: candidatePosition.positionId.NoofPositions,
        skills: candidatePosition.positionId.skills,
        additionalNotes: candidatePosition.positionId.additionalNotes
      };
      console.log("✅ Position data retrieved from CandidatePosition");
    } else if (feedbacks.length > 0 && feedbacks[0].positionId) {
      // Fallback: get position data from the first feedback
      positionData = {
        _id: feedbacks[0].positionId._id,
        title: feedbacks[0].positionId.title,
        companyname: feedbacks[0].positionId.companyname,
        jobDescription: feedbacks[0].positionId.jobDescription,
        minexperience: feedbacks[0].positionId.minexperience,
        maxexperience: feedbacks[0].positionId.maxexperience,
        Location: feedbacks[0].positionId.Location,
        minSalary: feedbacks[0].positionId.minSalary,
        maxSalary: feedbacks[0].positionId.maxSalary,
        NoofPositions: feedbacks[0].positionId.NoofPositions,
        skills: feedbacks[0].positionId.skills,
        additionalNotes: feedbacks[0].positionId.additionalNotes
      };
      console.log("✅ Position data retrieved from feedback records (fallback)");
    } else {
      console.log("❌ No position data available from any source");
    }

         // 6️⃣ Build Response with proper null checks and detailed position data
     const responseData = {
       interviewRound: {
         _id: interviewRound._id,
         interviewId: interviewRound.interviewId,
         sequence: interviewRound.sequence,
         roundTitle: interviewRound.roundTitle,
         interviewMode: interviewRound.interviewMode,
         interviewType: interviewRound.interviewType,
         interviewerType: interviewRound.interviewerType,
         duration: interviewRound.duration,
         instructions: interviewRound.instructions,
         dateTime: interviewRound.dateTime,
         status: interviewRound.status,
         meetingId: interviewRound.meetingId,
         meetLink: interviewRound.meetLink,
         assessmentId: interviewRound.assessmentId,
         questions: interviewRound.questions,
         rejectionReason: interviewRound.rejectionReason,
         interviewers: interviewRound.interviewers || []
       },
       candidate: candidatePosition?.candidateId || null,
       position: positionData,
       interviewers: interviewRound.interviewers || [],
       feedbacks: feedbacks || [],
       interviewQuestions: interviewQuestionsList || []
     };

         console.log("🎉 Sending successful response with data structure:", {
       hasInterviewRound: !!responseData.interviewRound,
       hasCandidate: !!responseData.candidate,
       hasPosition: !!responseData.position,
       interviewersCount: responseData.interviewers.length,
       feedbacksCount: responseData.feedbacks.length,
       interviewQuestionsCount: responseData.interviewQuestions.length
     });

    if (responseData.position) {
      console.log("✅ Position data included in response:", {
        title: responseData.position.title,
        company: responseData.position.companyname,
        location: responseData.position.Location
      });
    } else {
      console.log("❌ No position data found");
    }

    res.status(200).json({
      success: true,
      message: "Feedback retrieved successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("🔥 Error fetching feedback:", error);
    console.error("🔥 Error stack:", error.stack);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
};


// Update feedback by ID
const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Feedback ID is required"
      });
    }

    // Find and update the feedback
    const updatedFeedback = await FeedbackModel.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, // Return the updated document
        runValidators: true // Run schema validators
      }
    )
    .populate('candidateId', 'FirstName LastName Email Phone skills CurrentExperience')
    .populate('interviewerId', 'FirstName LastName Email Phone')
    .populate('positionId', 'title companyname')
    .populate('interviewRoundId');

    if (!updatedFeedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Feedback updated successfully",
      data: updatedFeedback
    });

  } catch (error) {
    console.error('Error updating feedback:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to update feedback",
      error: error.message
    });
  }
};

module.exports = {
  createFeedback,
  getFeedbackByTenantId,
  getFeedbackByInterviewerId,
  getfeedbackById,
  getFeedbackByRoundId,
  getAllFeedback,
  updateFeedback
};
