//<----v1.0.0---Venkatesh-----get feedback by tenant ID


const FeedbackModel = require('../models/feedback.js')
const mongoose = require('mongoose'); // Import mongoose to use ObjectId

const InterviewQuestions = require('../models/InterviewQuestions.js');
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
            feedbackCode,
            positionId,
            
            interviewerId,
            skills,
            questionFeedback,
            generalComments,
            overallImpression,
            status
        } = req.body;

        // Validate required fields
        if (!interviewerId) {
            console.log('❌ interviewerId is required');
            return res.status(400).json({
                success: false,
                message: "Interviewer ID is required"
            });
        }

        if (!interviewRoundId) {
            console.log('❌ interviewRoundId is required');
            return res.status(400).json({
                success: false,
                message: "Interview Round ID is required"
            });
        }

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

             // ===========================================
        // ✅ Generate feedbackCode sequence per round
        // ===========================================
        let finalFeedbackCode = feedbackCode || "";
        if (interviewRoundId && feedbackCode) {
            const existingCount = await FeedbackModel.countDocuments({ interviewRoundId });
            const sequenceNumber = existingCount + 1;
            finalFeedbackCode = `${feedbackCode}_${sequenceNumber}`;
            console.log(`🆕 Generated feedbackCode for round ${interviewRoundId}:`, finalFeedbackCode);
        }

        // Create feedback data with defaults
        const feedbackData = {
            skills: skills,
            questionFeedback: processedQuestionFeedback,
            generalComments: generalComments || "",
            overallImpression: overallImpression || {},
            status: status || 'submitted',
            feedbackCode: finalFeedbackCode || ""
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

        // Save questions to InterviewQuestions collection ONLY for question bank questions
        let questionBankQuestions = [];
        let successfulSaves = [];
        if (processedQuestionFeedback && processedQuestionFeedback.length > 0) {
          console.log('📝 Checking for question bank questions to save...');
          
          // Filter only questions that are from question bank (type="feedback" or source="system")
          questionBankQuestions = processedQuestionFeedback.filter((qFeedback, index) => {
            const originalQuestionFeedback = questionFeedback[index];
            const question = originalQuestionFeedback?.questionId;
            
            // Check if this is a question bank question
            const isQuestionBankQuestion = question?.type === "feedback" || 
                                         question?.source === "system" || 
                                         question?.source === "questionbank" ||
                                         (question?.snapshot && question?.snapshot.type === "feedback");
            
            console.log(`📋 Question ${index + 1}:`, {
              questionId: qFeedback.questionId,
              type: question?.type,
              source: question?.source,
              isQuestionBank: isQuestionBankQuestion
            });
            
            return isQuestionBankQuestion;
          });
          
          console.log(`📊 Found ${questionBankQuestions.length} question bank questions out of ${processedQuestionFeedback.length} total questions`);
          
          if (questionBankQuestions.length > 0) {
            const questionsToSave = questionBankQuestions.map((qFeedback, index) => {
              // Get the original question object from the frontend data for additional details
              const originalIndex = processedQuestionFeedback.indexOf(qFeedback);
              const originalQuestionFeedback = questionFeedback[originalIndex];
              const question = originalQuestionFeedback?.questionId; // This is the full question object from frontend
              console.log('📋 Processing question bank question:', question);
              
              // Extract the actual question data from the nested structure
              const actualQuestion = question?.snapshot || question;
              const questionId = qFeedback.questionId; // Use the processed question ID
              
              return {
                interviewId: interviewerId, // Using interviewRoundId as interviewId
                roundId: interviewRoundId,
                order: index + 1,
                // customizations: qFeedback.interviewerFeedback?.note || '',
                mandatory: question?.mandatory || actualQuestion?.mandatory || 'false',
                tenantId: tenantId || '',
                ownerId: feedbackData.ownerId, // Store the interviewerId as ownerId to track who added the question
                questionId: questionId,
                source: 'system', // Question bank questions have source as 'system'
                snapshot: actualQuestion || {},
                addedBy: 'interviewer' // Questions are added by interviewer during feedback
              };
            });

            console.log('📋 Question bank questions to save:', questionsToSave.length);

            // Save each question bank question to InterviewQuestions collection
            successfulSaves = await Promise.all(
              questionsToSave.map(async (questionData) => {
                try {
                  const questionInstance = new InterviewQuestions(questionData);
                  const savedQuestion = await questionInstance.save();
                  console.log('✅ Question bank question saved for interviewer:', interviewerId, 'Question ID:', savedQuestion._id);
                  return savedQuestion;
                } catch (error) {
                  console.error('❌ Error saving question bank question for interviewer:', interviewerId, 'Error:', error);
                  // Don't throw error, just log it and continue
                  console.log('⚠️ Skipping question save due to error, continuing with feedback submission');
                  return null;
                }
              })
            );

            // Filter out null values from failed saves
            successfulSaves = successfulSaves.filter(question => question !== null);
            console.log('✅ Question bank questions saved successfully for interviewer:', interviewerId, 'Count:', successfulSaves.length);
          } else {
            console.log('ℹ️ No question bank questions found to save');
          }
        }

        return res.status(201).json({
            success: true,
            message: "Feedback submitted successfully",
            data: {
                feedbackId: feedbackInstance._id,
                submittedAt: feedbackInstance.createdAt,
                interviewerId: interviewerId,
                totalQuestions: processedQuestionFeedback?.length || 0,
                questionBankQuestionsSaved: successfulSaves?.length || 0
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
    const { interviewerId } = req.query; // Get interviewerId from query parameters
    console.log("📌 Requested Round ID:", roundId);
    console.log("👤 Requested Interviewer ID:", interviewerId);

    // 1️⃣ Validate roundId
    if (!mongoose.Types.ObjectId.isValid(roundId)) {
      console.log("❌ Invalid roundId:", roundId);
      return res.status(400).json({ success: false, message: "Invalid round ID" });
    }

    // 1️⃣.5 Validate interviewerId if provided
    if (interviewerId && !mongoose.Types.ObjectId.isValid(interviewerId)) {
      console.log("❌ Invalid interviewerId:", interviewerId);
      return res.status(400).json({ success: false, message: "Invalid interviewer ID" });
    }

    // 2️⃣ Find InterviewRound
    console.log("🔍 Searching for InterviewRound with ID:", roundId);
    const interviewRound = await InterviewRounds.findById(roundId)
    .populate({
      path: "interviewId",
      select: "interviewCode" // ✅ Only fetch interviewCode (you can add other fields if needed)
    })
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
    
    // Build feedback query
    const feedbackQuery = { interviewRoundId: roundId };
    
    // If interviewerId is provided, filter by that specific interviewer
    if (interviewerId) {
      feedbackQuery.interviewerId = interviewerId;
      console.log("🔍 Filtering feedbacks by interviewerId:", interviewerId);
    }
    
    const feedbacks = await FeedbackModel.find(feedbackQuery)
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

     // Separate questions by type
     const preselectedQuestions = interviewQuestionsList.filter(question => 
       question.addedBy !== "interviewer" || !question.addedBy
     );
     const interviewerAddedQuestions = interviewQuestionsList.filter(question => 
       question.addedBy === "interviewer"
     );

     console.log("📋 Question separation:", {
       totalQuestions: interviewQuestionsList.length,
       preselectedQuestions: preselectedQuestions.length,
       interviewerAddedQuestions: interviewerAddedQuestions.length
     });

     // If interviewerId is provided, filter interviewer-added questions by that specific interviewer
     if (interviewerId) {
       const filteredInterviewerQuestions = interviewerAddedQuestions.filter(question => 
         question.ownerId === interviewerId
       );
       console.log("🔍 Filtered interviewer questions by interviewerId:", interviewerId, "Count:", filteredInterviewerQuestions.length);
       
       // Update the interviewerAddedQuestions array with filtered results
       interviewerAddedQuestions.length = 0;
       interviewerAddedQuestions.push(...filteredInterviewerQuestions);
     }

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
         interviewCode: interviewRound.interviewId?.interviewCode || null, // ✅ From Interview schema
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
       interviewQuestions: {
         preselectedQuestions: preselectedQuestions,
         interviewerAddedQuestions: interviewerAddedQuestions
       }
     };

         console.log("🎉 Sending successful response with data structure:", {
       hasInterviewRound: !!responseData.interviewRound,
       hasCandidate: !!responseData.candidate,
       hasPosition: !!responseData.position,
       interviewersCount: responseData.interviewers.length,
       feedbacksCount: responseData.feedbacks.length,
       interviewQuestionsCount: responseData.interviewQuestions.preselectedQuestions.length + responseData.interviewQuestions.interviewerAddedQuestions.length,
       filteredByInterviewer: !!interviewerId
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
