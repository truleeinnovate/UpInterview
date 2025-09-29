//<----v1.0.0---Venkatesh-----get feedback by tenant ID


const FeedbackModel = require('../models/feedback.js')
const mongoose = require('mongoose'); // Import mongoose to use ObjectId

const InterviewQuestions = require('../models/Interview/selectedInterviewQuestion.js');
const { InterviewRounds } = require('../models/Interview/InterviewRounds.js');
const CandidatePosition = require('../models/CandidatePosition.js');
const { Contacts } = require('../models/Contacts.js');
const { Interview } = require('../models/Interview/Interview.js');
const Tenant = require('../models/Tenant.js');

// Import validation functions
const { 
  validateCreateFeedback, 
  validateUpdateFeedback, 
  validateFeedbackBusinessRules 
} = require('../validations/feedbackValidation');


// const mongoose = require("mongoose");
// const FeedbackModel = require("../models/InterviewFeedback"); 
// const InterviewRounds = require("../models/InterviewRounds");
// const InterviewQuestions = require("../models/InterviewQuestions");
// const Interview = require("../models/Interview");

const createFeedback = async (req, res) => {
  try {
    // ✅ Validate input using Joi schema
    const { isValid, errors, value: validatedData } = validateCreateFeedback(req.body);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // ✅ Apply additional business rule validations
    const businessRuleErrors = validateFeedbackBusinessRules(validatedData);
    if (businessRuleErrors) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: businessRuleErrors
      });
    }

    const {
      type, // "submit" | "draft"
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
      status,
      feedbackCode,
    } = validatedData;

    // ✅ Process questions
    const processedQuestionFeedback = (questionFeedback || []).map((qFeedback) => {
      const rawQuestion = qFeedback?.questionId;
      let onlyQuestionId = "";

      if (typeof rawQuestion === "string") onlyQuestionId = rawQuestion;
      else if (rawQuestion && typeof rawQuestion === "object")
        onlyQuestionId = rawQuestion.questionId;

      return {
        questionId: onlyQuestionId,
        candidateAnswer: qFeedback.candidateAnswer || {
          answerType: (rawQuestion && rawQuestion.isAnswered) || "not answered",
          submittedAnswer: "",
        },
        interviewerFeedback: qFeedback.interviewerFeedback || {
          liked: (rawQuestion && rawQuestion.isLiked) || "none",
          note: (rawQuestion && rawQuestion.note) || "",
          dislikeReason: (rawQuestion && rawQuestion.whyDislike) || "",
        },
      };
    });

       // ===========================================
    // ✅ Check if feedback already exists
    // ===========================================
    let existingFeedback = await FeedbackModel.findOne({
      interviewRoundId,
      candidateId,
      interviewerId,
    });

    if (existingFeedback) {
      if (type === "submit") {
        // 🚨 Block duplicate submit
        return res.status(409).json({
          success: false,
          message: "Feedback already submitted for this candidate and round by this interviewer",
          feedbackId: existingFeedback._id,
        });
      }
    }

    // ===========================================
    // ✅ Find existing feedback if draft
    // ===========================================
    let feedbackInstance;
    if (type === "draft") {
      feedbackInstance = await FeedbackModel.findOne({
        interviewRoundId,
        candidateId,
        interviewerId,
      });

      if (feedbackInstance) {
        // 🔹 Update draft
        feedbackInstance.skills = skills || feedbackInstance.skills;
        feedbackInstance.questionFeedback = processedQuestionFeedback || feedbackInstance.questionFeedback;
        feedbackInstance.generalComments = generalComments || feedbackInstance.generalComments;
        feedbackInstance.overallImpression = overallImpression || feedbackInstance.overallImpression;
        feedbackInstance.status = "draft";
      }
    }

    // ===========================================
    // ✅ Generate feedbackCode (only for new feedback)
    // ===========================================
    let finalFeedbackCode = feedbackInstance?.feedbackCode;
    if (!finalFeedbackCode && interviewRoundId && feedbackCode) {
      const existingCount = await FeedbackModel.countDocuments({ interviewRoundId });
      finalFeedbackCode = existingCount === 0
        ? `${feedbackCode}`
        : `${feedbackCode}-${existingCount + 1}`;
    }

    // ===========================================
    // ✅ Create new feedback (draft or submit)
    // ===========================================
    if (!feedbackInstance) {
      feedbackInstance = new FeedbackModel({
        tenantId,
        ownerId,
        interviewRoundId,
        candidateId,
        positionId,
        interviewerId,
        skills,
        questionFeedback: processedQuestionFeedback,
        generalComments: generalComments || "",
        overallImpression: overallImpression || {},
        status: type === "submit" ? "submitted" : "draft",
        feedbackCode: finalFeedbackCode,
      });
    }

    await feedbackInstance.save();

    // ===========================================
    // ✅ Resolve interviewId from round
    // ===========================================
    let resolvedInterviewId = null;
    try {
      if (interviewRoundId) {
        const roundDoc = await InterviewRounds.findById(interviewRoundId).select("interviewId");
        resolvedInterviewId = roundDoc?.interviewId || null;
      }
    } catch (e) {
      console.warn("⚠️ Unable to resolve interviewId:", interviewRoundId, e?.message);
    }

    // ===========================================
    // ✅ Handle InterviewQuestions logic
    // ===========================================
    if (processedQuestionFeedback && processedQuestionFeedback.length > 0) {
      for (let i = 0; i < processedQuestionFeedback.length; i++) {
        const qFeedback = processedQuestionFeedback[i];
        const original = questionFeedback[i]?.questionId;

        if (original && typeof original === "object") {
          const actual = original.snapshot || original;
          const normalizedQuestionId = qFeedback.questionId;
          const src = original.source || actual.source || "custom";
          const mand = original.mandatory || actual.mandatory || "false";

          // 🔹 Avoid duplicates in draft updates
          const exists = await InterviewQuestions.findOne({
            roundId: interviewRoundId,
            ownerId,
            questionId: normalizedQuestionId,
            addedBy: "interviewer",
          }).lean();

          if (!exists) {
            const doc = new InterviewQuestions({
              interviewId: resolvedInterviewId,
              roundId: interviewRoundId,
              order: i + 1,
              mandatory: mand,
              tenantId: tenantId || "",
              ownerId: ownerId || "",
              questionId: normalizedQuestionId,
              source: src,
              snapshot: actual || {},
              addedBy: "interviewer",
            });
            await doc.save();
          }
        }
      }
    }

    // ===========================================
    // ✅ Final Response
    // ===========================================
    return res.status(201).json({
      success: true,
      message: type === "submit" ? "Feedback submitted successfully" : "Draft saved successfully",
      data: {
        feedbackId: feedbackInstance._id,
        status: feedbackInstance.status,
        submittedAt: feedbackInstance.createdAt,
        interviewerId: interviewerId,
        totalQuestions: processedQuestionFeedback?.length || 0,
      },
    });
  } catch (error) {
    console.error("❌ Error creating/updating feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process feedback",
      error: error.message,
    });
  }
};


// const createFeedback = async (req, res) => { 
//     try {
//         // console.log('📥 Received feedback data:', req.body);
        
//         const {
//           type,
//             tenantId,
//             ownerId,
//             interviewRoundId,
//             candidateId,
//             positionId,
//             interviewerId,
//             skills,
//             questionFeedback,
//             generalComments,
//             overallImpression,
//             status,
//             feedbackCode
//         } = req.body;

//         // Validate required fields
//         if (!interviewerId) {
//             console.log('❌ interviewerId is required');
//             return res.status(400).json({
//                 success: false,
//                 message: "Interviewer ID is required"
//             });
//         }

//         if (!interviewRoundId) {
//             console.log('❌ interviewRoundId is required');
//             return res.status(400).json({
//                 success: false,
//                 message: "Interview Round ID is required"
//             });
//         }

//         //added by venkatesh------ Check for existing feedback to prevent duplicates
//         if (interviewRoundId && candidateId && interviewerId) {
//             const existingFeedback = await FeedbackModel.findOne({
//                 interviewRoundId,
//                 candidateId,
//                 interviewerId
//             });
//             if (existingFeedback) {
//                 console.log('❌ Duplicate feedback found for this interview round, candidate, and interviewer');
//                 return res.status(409).json({
//                     success: false,
//                     message: "Feedback already exists for this interview round and candidate from this interviewer",
//                     existingFeedbackId: existingFeedback._id
//                 });
//             }
//         }

//         // Simple validation - just check if basic data exists
//         if (!skills || !Array.isArray(skills) || skills.length === 0) {
//             console.log('❌ No skills provided');
//             return res.status(400).json({
//                 success: false,
//                 message: "Skills are required"
//             });
//         }

//         console.log("questionFeedback",questionFeedback);

//         // Process questionFeedback to extract only question IDs
//         const processedQuestionFeedback = (questionFeedback || []).map(qFeedback => {
//             const rawQuestion = qFeedback?.questionId; // Could be string ID or full object
//             let onlyQuestionId = "";

//             if (typeof rawQuestion === 'string') {
//                 onlyQuestionId = rawQuestion;
//             } else if (rawQuestion && typeof rawQuestion === 'object') {
//                 onlyQuestionId = rawQuestion.questionId ;
//             }

//             return {
//                 questionId: onlyQuestionId,
//                 candidateAnswer: qFeedback.candidateAnswer || {
//                     answerType: (rawQuestion && rawQuestion.isAnswered) || "not answered",
//                     submittedAnswer: ""
//                 },
//                 interviewerFeedback: qFeedback.interviewerFeedback || {
//                     liked: (rawQuestion && rawQuestion.isLiked) || "none",
//                     note: (rawQuestion && rawQuestion.note) || "",
//                     dislikeReason: (rawQuestion && rawQuestion.whyDislike) || ""
//                 }
//             };
//         });

//              // ===========================================
//         // ✅ Generate feedbackCode sequence per round
//         // ===========================================
//         let finalFeedbackCode = "";
//         if (interviewRoundId && feedbackCode) {
//             const existingCount = await FeedbackModel.countDocuments({ interviewRoundId });
//             if(existingCount === 0){
//               finalFeedbackCode = `${feedbackCode}`
//             }else{
//             const sequenceNumber = existingCount + 1;
//             finalFeedbackCode = `${feedbackCode}-${sequenceNumber}`;
//             console.log(`🆕 Generated feedbackCode for round ${interviewRoundId}:`, finalFeedbackCode);
//             }
//           }

//           console.log("finalFeedbackCode",finalFeedbackCode);
//           console.log("feedbackCode",feedbackCode);


//         // Create feedback data with defaults
//         const feedbackData = {
//             skills: skills,
//             questionFeedback: processedQuestionFeedback,
//             generalComments: generalComments || "",
//             overallImpression: overallImpression || {},
//             status: status || 'draft',
//             feedbackCode:finalFeedbackCode
//         };

//         // Add fields only if they are not empty strings
//         if (tenantId && tenantId.trim() !== "") {
//             feedbackData.tenantId = tenantId;
//         }
        
//         if (ownerId && ownerId.trim() !== "") {
//             feedbackData.ownerId = ownerId;
//         }
        
//         if (interviewRoundId && interviewRoundId.trim() !== "") {
//             feedbackData.interviewRoundId = interviewRoundId;
//         }
        
//         if (candidateId && candidateId.trim() !== "") {
//             feedbackData.candidateId = candidateId;
//         }
        
//         if (interviewerId && interviewerId.trim() !== "") {
//             feedbackData.interviewerId = interviewerId;
//         }

//         // Add positionId if provided and not empty
//         if (positionId && positionId.trim() !== "") {
//             feedbackData.positionId = positionId;
//         }

//         console.log('💾 Saving feedback data:', feedbackData);

//         const feedbackInstance = new FeedbackModel(feedbackData);
//         await feedbackInstance.save();

//         console.log('✅ Feedback saved successfully with ID:', feedbackInstance._id);

//         // Resolve interviewId from the round so we can store it in interviewQuestions
//         let resolvedInterviewId = null;
//         try {
//           if (interviewRoundId) {
//             const roundDoc = await InterviewRounds.findById(interviewRoundId).select('interviewId');
//             resolvedInterviewId = roundDoc?.interviewId || null;
//           }
//         } catch (e) {
//           console.warn('⚠️ Unable to resolve interviewId from roundId:', interviewRoundId, e?.message);
//         }

//         // Save questions to InterviewQuestions collection ONLY for question bank questions
//         let questionBankQuestions = [];
//         let successfulSaves = [];
//         if (processedQuestionFeedback && processedQuestionFeedback.length > 0) {
//           console.log('📝 Checking for question bank questions to save...');
          
//           // Filter only questions that are from question bank (type="feedback" or source="system")
//           questionBankQuestions = processedQuestionFeedback.filter((qFeedback, index) => {
//             const originalQuestionFeedback = questionFeedback[index];
//             const question = originalQuestionFeedback?.questionId;
            
//             // Check if this is a question bank question
//             const isQuestionBankQuestion = question?.type === "feedback" || 
//                                          question?.source === "system" || 
//                                          question?.source === "questionbank" ||
//                                          (question?.snapshot && question?.snapshot.type === "feedback");
            
//             console.log(`📋 Question ${index + 1}:`, {
//               questionId: qFeedback.questionId,
//               type: question?.type,
//               source: question?.source,
//               isQuestionBank: isQuestionBankQuestion
//             });
            
//             return isQuestionBankQuestion;
//           });
          
//           console.log(`📊 Found ${questionBankQuestions.length} question bank questions out of ${processedQuestionFeedback.length} total questions`);
          
//           if (questionBankQuestions.length > 0) {
//             const questionsToSave = questionBankQuestions.map((qFeedback, index) => {
//               // Get the original question object from the frontend data for additional details
//               const originalIndex = processedQuestionFeedback.indexOf(qFeedback);
//               const originalQuestionFeedback = questionFeedback[originalIndex];
//               const question = originalQuestionFeedback?.questionId; // Could be object or string
//               console.log('📋 Processing question bank question:', question);
              
//               // Extract the actual question data from the nested structure
//               const actualQuestion = (question && typeof question === 'object') ? (question.snapshot || question) : {};
//               const questionId = qFeedback.questionId; // Use the processed question ID (string)
//               const sourceVal = (question && typeof question === 'object') ? (question.source || actualQuestion.source || 'system') : 'system';
              
//               return {
//                 interviewId: resolvedInterviewId, // Link to Interview document
//                 roundId: interviewRoundId,
//                 order: index + 1,
//                 mandatory: question?.mandatory || actualQuestion?.mandatory || 'false',
//                 tenantId: tenantId || '',
//                 ownerId:  ownerId , // track who added the question
//                 questionId: questionId, // string ID
//                 source: sourceVal,
//                 snapshot: actualQuestion || {},
//                 addedBy: 'interviewer'
//               };
//             });

//             console.log('📋 Question bank questions to save:', questionsToSave.length);

//             // Save each question bank question to InterviewQuestions collection
//             successfulSaves = await Promise.all(
//               questionsToSave.map(async (questionData) => {
//                 try {
//                   const questionInstance = new InterviewQuestions(questionData);
//                   const savedQuestion = await questionInstance.save();
//                   console.log('✅ Question bank question saved for interviewer:', interviewerId, 'Question ID:', savedQuestion._id);
//                   return savedQuestion;
//                 } catch (error) {
//                   console.error('❌ Error saving question bank question for interviewer:', interviewerId, 'Error:', error);
//                   // Don't throw error, just log it and continue
//                   console.log('⚠️ Skipping question save due to error, continuing with feedback submission');
//                   return null;
//                 }
//               })
//             );

//             // Filter out null values from failed saves
//             successfulSaves = successfulSaves.filter(question => question !== null);
//             console.log('✅ Question bank questions saved successfully for interviewer:', interviewerId, 'Count:', successfulSaves.length);
//           } else {
//             console.log('ℹ️ No question bank questions found to save');
//           }
//         }

//         // Also persist interviewer-added questions (any question objects sent from frontend)
//         if (processedQuestionFeedback && processedQuestionFeedback.length > 0) {
//           console.log('📝 Checking for interviewer-added questions to save...');
//           const interviewerAddedToSave = processedQuestionFeedback
//             .map((qFeedback, index) => {
//               const original = questionFeedback[index]?.questionId;
//               if (original && typeof original === 'object') {
//                 const actual = original.snapshot || original;
//                 const normalizedQuestionId = qFeedback.questionId;
//                 const src = original.source || actual.source || 'custom';
//                 const mand = original.mandatory || actual.mandatory || 'false';
//                 return {
//                   interviewId: resolvedInterviewId,
//                   roundId: interviewRoundId,
//                   order: index + 1,
//                   mandatory: mand,
//                   tenantId: tenantId || '',
//                   ownerId:  ownerId || '',
//                   questionId: normalizedQuestionId,
//                   source: src,
//                   snapshot: actual || {},
//                   addedBy: 'interviewer'
//                 };
//               }
//               return null;
//             })
//             .filter(Boolean);

//           if (interviewerAddedToSave.length > 0) {
//             const saved = await Promise.all(
//               interviewerAddedToSave.map(async (q) => {
//                 try {
//                   // Avoid duplicates per round/owner/question
//                   const exists = await InterviewQuestions.findOne({
//                     roundId: q.roundId,
//                     ownerId: q.ownerId,
//                     questionId: q.questionId,
//                     addedBy: 'interviewer'
//                   }).lean();
//                   if (exists) return null;
//                   const doc = new InterviewQuestions(q);
//                   return await doc.save();
//                 } catch (e) {
//                   console.warn('⚠️ Skip saving interviewer-added question due to error:', e?.message);
//                   return null;
//                 }
//               })
//             );
//             const count = (saved || []).filter(Boolean).length;
//             console.log(`✅ Interviewer-added questions saved: ${count}`);
//           } else {
//             console.log('ℹ️ No interviewer-added questions detected to save');
//           }
//         }

//         return res.status(201).json({
//             success: true,
//             message: "Feedback submitted successfully",
//             data: {
//                 feedbackId: feedbackInstance._id,
//                 submittedAt: feedbackInstance.createdAt,
//                 interviewerId: interviewerId,
//                 totalQuestions: processedQuestionFeedback?.length || 0,
//                 questionBankQuestionsSaved: successfulSaves?.length || 0
//             }
//         });

//     } catch (error) {
//         console.error("❌ Error creating feedback:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Failed to submit feedback",
//             error: error.message
//         });
//     }
// };

//<----v1.0.0---
// Get feedback by tenant ID
// const getFeedbackByTenantId = async (req, res) => {
//   try {
//     const { tenantId } = req.params;
 
//     if (!tenantId) {
//       return res.status(400).json({
//         success: false,
//         message: "Tenant ID is required"
//       });
//     }
 
//     //console.log('Received tenantId:', tenantId);
 
//     let feedbackWithQuestions;
//     let feedback;
//     try {
//       // Convert tenantId string to ObjectId since database stores it as ObjectId
//       //const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
//       feedback = await FeedbackModel.find({ tenantId })
//         .populate('candidateId', 'FirstName LastName Email Phone skills CurrentExperience')
//         .populate('positionId', 'title companyname jobDescription Location')
//         .populate('interviewRoundId', 'roundTitle interviewMode interviewType interviewerType duration instructions dateTime status')
//         .populate('interviewerId','firstName lastName')
//         // .populate('ownerId', 'firstName lastName email');
 

//       // Fetch pre-selected questions for each feedback item
//       feedbackWithQuestions = await Promise.all(feedback.map(async (item) => {
//         const preSelectedQuestions = await InterviewQuestions.find({ roundId: item.interviewRoundId });
//         return {
//           ...item.toObject(),
//           preSelectedQuestions
//         };
//       }));
     
//       //console.log('Feedback found:', feedback.length, 'documents');
//     } catch (err) {
//       console.error('Invalid tenantId format:', err.message);
//       return res.status(400).json({
//         success: false,
//         message: "Invalid Tenant ID format: " + err.message
//       });
//     }
 
//     if (!feedback) {
//       return res.status(404).json({
//         success: false,
//         message: "Feedback not found for this tenant"
//       });
//     }
 
//     return res.status(200).json({
//       success: true,
//       message: "Feedback retrieved successfully",
//       data: feedbackWithQuestions
//     });
 
//   } catch (error) {
//     //console.error("Error getting feedback by tenant ID:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error while getting feedback",
//       error: error.message
//     });
//   }
// };

//<----v1.0.0---Venkatesh-----get feedback by interviewer ID

// const getFeedbackByInterviewerId = async (req, res) => {
//   try {
//     const { ownerId } = req.params;
//     console.log("ownerId",ownerId)

//     if (!ownerId) {
//       return res.status(400).json({
//         success: false,
//         message: "Owner ID is required"
//       });
//     }


//     //console.log('Received interviewerId:', interviewerId);

//     let feedbackWithQuestions;
//     let feedback;
//     let contactId;
//     try {

//       contactId = await Contacts.find({ ownerId })
//       const interviewerId = contactId._id;
//       console.log("contactId",contactId._id);
//       // Convert interviewerId string to ObjectId since database stores it as ObjectId
//       //const interviewerObjectId = new mongoose.Types.ObjectId(interviewerId);
//       feedback = await FeedbackModel.find({  interviewerId })
//         .populate('candidateId', 'FirstName LastName Email Phone skills CurrentExperience')
//         .populate('positionId', 'title companyname jobDescription Location')
//         .populate('interviewRoundId', 'roundTitle interviewMode interviewType interviewerType duration instructions dateTime status')
//         .populate('interviewerId','firstName lastName');
//       console.log("feedback",feedback)
//       // Fetch pre-selected questions for each feedback item
//       feedbackWithQuestions = await Promise.all(feedback.map(async (item) => {
//         const preSelectedQuestions = await InterviewQuestions.find({ roundId: item.interviewRoundId });
//         return {
//           ...item.toObject(),
//           preSelectedQuestions
//         };
//       }));
      
//       //console.log('Feedback found:', feedback.length, 'documents');
//     } catch (err) {
//       console.error('Invalid ownerId format:', err.message);
//       return res.status(400).json({
//         success: false,
//         message: "Invalid Owner ID format: " + err.message
//       });
//     }

//     if (!feedback || feedback.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Feedback not found for this interviewer"
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Feedback retrieved successfully",
//       data: feedbackWithQuestions
//     });

//   } catch (error) {
//     //console.error("Error getting feedback by interviewer ID:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error while getting feedback",
//       error: error.message
//     });
//   }
// };

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
    const { interviewerId } = req.query;

    console.log("📌 Requested Round ID:", roundId);
    console.log("👤 Requested Interviewer ID:", interviewerId);

    // Validate roundId
    if (!mongoose.Types.ObjectId.isValid(roundId)) {
      return res.status(400).json({ success: false, message: "Invalid round ID" });
    }
    if (interviewerId && !mongoose.Types.ObjectId.isValid(interviewerId)) {
      return res.status(400).json({ success: false, message: "Invalid interviewer ID" });
    }

    // Fetch InterviewRound
    const interviewRound = await InterviewRounds.findById(roundId)
      .populate("interviewers", "FirstName LastName Email Phone");

    if (!interviewRound) {
      return res.status(404).json({ success: false, message: "Interview round not found" });
    }

    const interviewSection = await Interview.findOne({ _id: interviewRound.interviewId });

    // Fetch CandidatePosition
    const candidatePosition = await CandidatePosition.findOne({
      interviewId: interviewRound.interviewId,
    })
      .populate('candidateId', 'FirstName LastName Email Phone skills CurrentExperience')
      .populate("positionId", "title companyname jobDescription minexperience maxexperience Location minSalary maxSalary");

    // Fetch Feedback
    const feedbackQuery = { interviewRoundId: roundId };
    if (interviewerId) {
      feedbackQuery.interviewerId = interviewerId;
    }

    const feedbacks = await FeedbackModel.find(feedbackQuery)
      .populate("candidateId", "FirstName LastName Email Phone ownerId")
      .populate("positionId", "title companyname jobDescription minexperience maxexperience Location minSalary maxSalary")
      .populate("interviewerId", "FirstName LastName Email Phone")
      .populate("ownerId", "firstName lastName email")
      // .populate({
      //   path: "questionFeedback.questionId",
      //   model: "InterviewQuestions"
      // });

    // Fetch all Interview Questions for the round
    const interviewQuestionsList = await InterviewQuestions.find({ roundId: roundId });

    // Build question map for easy lookup
    const questionMap = interviewQuestionsList.reduce((acc, q) => {
      acc[q._id.toString()] = q.toObject();
      return acc;
    }, {});

    console.log("feedbacks",feedbacks);
    
    // Merge all questions into each feedback
    const feedbacksMerged = feedbacks.map(fb => {
      const fbAnswersMap = {};
      console.log("fb.questionFeedback",fb.questionFeedback[0].questionId);
      // console.log("fb.questionFeedback",fb.questionFeedback[0].questionId._id);
      
      (fb.questionFeedback || []).forEach(qf => {
        console.log("qf",qf);
        if (qf.questionId && typeof qf.questionId === 'object' && qf.questionId._id) {
          console.log("🚀 ~ getFeedbackByRoundI ~ qf.questionId._id:", qf.questionId)
          fbAnswersMap[qf.questionId._id.toString()] = qf;
        } else if (qf.questionId) {
          console.log("🚀 ~ getFeedbackByRoundd ~ qf.questionId:", qf.questionId)
          fbAnswersMap[qf.questionId.toString()] = qf;
        }
        console.log("🚀 ~ getFeedbackByRound ~ fbAnswersMap:", fbAnswersMap)
      });

      const mergedQuestions = Object.values(questionMap).map(q => {
        const ans = fbAnswersMap[q.questionId.toString()];
        console.log("🚀 ~ getFeedbackByRound ~ ans:", fb)
        return {
          
          _id: q._id,
          questionText: q.questionText,
          addedBy: q.addedBy,
          questionId:q.questionId,
          candidateAnswer: ans?.candidateAnswer || null,
          interviewerFeedback: ans?.interviewerFeedback || null,
          snapshot:q.snapshot,
        };
      });

      return {
        ...fb.toObject(),
        questionFeedback: mergedQuestions
      };
    });

    // Separate questions for interviewer-added vs preselected
    let preselectedQuestions = interviewQuestionsList
      .filter(q => q.addedBy !== "interviewer" || !q.addedBy)
      .map(q => q.toObject());

    let interviewerAddedQuestions = interviewQuestionsList
      .filter(q => q.addedBy === "interviewer")
      .map(q => q.toObject());

    if (interviewerId) {
      interviewerAddedQuestions = interviewerAddedQuestions.filter(q =>
        q.ownerId?.toString() === interviewerId
      );
    }

    // Build position data
    let positionData = null;
    if (candidatePosition?.positionId) {
      positionData = candidatePosition.positionId.toObject();
    } else if (feedbacks.length > 0 && feedbacks[0].positionId) {
      positionData = feedbacks[0].positionId.toObject();
    }

    // Final response
    const responseData = {
      interviewRound: {
        _id: interviewRound._id,
        interviewId: interviewRound.interviewId,
        sequence: interviewRound.sequence,
        interviewCode: interviewSection?.interviewCode,
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
      feedbacks: feedbacksMerged || [],
      interviewQuestions: {
        preselectedQuestions,
        interviewerAddedQuestions
      }
    };

    res.status(200).json({
      success: true,
      message: "Feedback retrieved successfully",
      data: responseData,
    });

  } catch (error) {
    console.error("🔥 Error fetching feedback:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// to get contact type of org or individual and datetime feedback by contactId and roundId
const getFeedbackByContactIdRoundId =  async (req, res) => {
  try {
    const { contactId, roundId } = req.query;

    if (!contactId || !roundId) {
      return res.status(400).json({ error: "contactId and roundId are required" });
    }

    // 1. Get the contact
    const contact = await Contacts.findById(contactId);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    const { ownerId, tenantId } = contact;

    // 2. Get tenant by tenantId
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    // Optional: verify that tenant.ownerId matches contact.ownerId
    // if (tenant.ownerId.toString() !== ownerId.toString()) {
    //   return res.status(403).json({ error: "Owner mismatch between contact and tenant" });
    // }

    // 3. Get round dateTime
    const round = await InterviewRounds.findById(roundId);
    if (!round) {
      return res.status(404).json({ error: "Interview round not found" });
    }

    // 4. Return result
    return res.json({
      ownerId,
      tenant: {
        id: tenant._id,
        name: tenant.company,
        type: tenant.type
      },
      round: {
        id: round._id,
        dateTime: round.dateTime
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};


//  Fixed backend route - add this to your routes file
// ✅ Get Candidate, Position & InterviewRound Details by RoundId
const getCandidateByRoundId = async (req, res) => {
  try {
    console.log('📥 Received request for roundId:', req.query.roundId);

    const roundId = req.query.roundId;

    if (!roundId) {
      return res.status(400).json({
        success: false,
        message: "Round ID is required"
      });
    }

    // 🔍 Fetch Round + Interview + Candidate + Position + Interviewers
    const round = await InterviewRounds.findById(roundId)
      .populate({
        path: 'interviewId',
        populate: [
          { path: 'candidateId', model: 'Candidate' },
          { path: 'positionId', model: 'Position' },
          { path: 'templateId', model: 'InterviewTemplate' } // ✅ Optional: interview template details
        ]
      })
      .populate({
        path: 'interviewers',
        model: 'Contacts'
      })
      .populate({
        path: 'assessmentId',
        model: 'assessment'
      });

    if (!round) {
      return res.status(404).json({
        success: false,
        message: "Round not found"
      });
    }

    const candidate = round.interviewId?.candidateId;
    const position = round.interviewId?.positionId;

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found for this round"
      });
    }

    // ✅ Full Response with all details
    return res.status(200).json({
      success: true,
      candidate,
      position,
      round   // this includes full InterviewRounds schema details
    });

  } catch (error) {
    console.error('❌ Error in getCandidateByRoundId:', error);
    return res.status(500).json({
      success: false,
      message: "Error fetching candidate/round details",
      error: error.message
    });
  }
};

// getting all feedbacks  by roundid for scheduler only 

// In your getFeedbackRoundId controller
const getFeedbackRoundId = async (req, res) => {
  try {
    const { roundId } = req.params;

    // 🔹 Cast properly
    const objectRoundId = new mongoose.Types.ObjectId(roundId);

    // 1️⃣ Find round
    const round = await InterviewRounds.findById(objectRoundId)
      .populate("interviewId")
      .populate("interviewers");

    if (!round) {
      return res.status(404).json({ message: "Round not found" });
    }

    // 2️⃣ Get Interview, Candidate, Position details
    const interview = await Interview.findById(round.interviewId)
      .populate("candidateId")
      .populate("positionId");

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // 3️⃣ Get Feedbacks (important: cast roundId to ObjectId)
    const feedbacks = await FeedbackModel.find({ interviewRoundId: objectRoundId })
      .populate("interviewerId") // gives contact details
      .populate("candidateId")
      .populate("positionId");

    // 4️⃣ Prepare response
    const response = {
      success: true,
      message: feedbacks.length ? "Feedback found" : "No feedback submitted yet",
      interviewRound: round,
      candidate: interview.candidateId,
      position: interview.positionId,
      interviewers: round.interviewers || [],
      feedbacks,
      interviewQuestions: {
        preselectedQuestions: round.preselectedQuestions || [],
        interviewerAddedQuestions: round.interviewerAddedQuestions || []
      }
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching round details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Feedback ID is required"
      });
    }

    // ✅ Validate input using Joi schema
    const { isValid, errors, value: validatedData } = validateUpdateFeedback(req.body);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // ✅ Apply additional business rule validations if updating to submit
    if (validatedData.type === 'submit' || validatedData.status === 'submitted') {
      const businessRuleErrors = validateFeedbackBusinessRules(validatedData);
      if (businessRuleErrors) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: businessRuleErrors
        });
      }
    }

    const updateData = validatedData;

    console.log('📥 Received update feedback data:', updateData);

    // Normalize questionFeedback.questionId on updates (stringify IDs)
    if (updateData.questionFeedback && Array.isArray(updateData.questionFeedback)) {
      updateData.questionFeedback = updateData.questionFeedback.map((feedback) => {
        const raw = feedback?.questionId;
        let normalizedId = '';
        if (typeof raw === 'string') normalizedId = raw;
        else if (raw && typeof raw === 'object') normalizedId = raw.questionId || raw._id || raw.id || '';
        return {
          ...feedback,
          questionId: normalizedId,
        };
      });
      console.log('🛠️ Processed questionFeedback:', updateData.questionFeedback);
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

// Validation endpoint for feedback
const validateFeedback = async (req, res) => {
  try {
    const { type } = req.body;
    
    // Determine which validation to use based on operation type
    const isUpdate = req.params.operation === 'update';
    
    // Validate input using appropriate schema
    const { isValid, errors, value: validatedData } = isUpdate 
      ? validateUpdateFeedback(req.body)
      : validateCreateFeedback(req.body);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Apply additional business rule validations for submit type
    if (type === 'submit' || validatedData.status === 'submitted') {
      const businessRuleErrors = validateFeedbackBusinessRules(validatedData);
      if (businessRuleErrors) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: businessRuleErrors
        });
      }
    }

    // Return success if all validations pass
    return res.status(200).json({
      success: true,
      message: 'Validation successful',
      data: validatedData
    });
    
  } catch (error) {
    console.error('Error validating feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to validate feedback',
      error: error.message
    });
  }
};

module.exports = {
  createFeedback,
  // getFeedbackByTenantId,
  // getFeedbackByInterviewerId,
  getfeedbackById,
  getFeedbackByRoundId,
  getAllFeedback,
  updateFeedback,
  validateFeedback,
  getFeedbackByContactIdRoundId,
  getCandidateByRoundId,
  getFeedbackRoundId // getting all feedbacks  by roundid for scheduler only 
};

// const getFeedbackByRoundId = async (req, res) => {
//   try {
//     const { roundId } = req.params;
//     const { interviewerId } = req.query;
    
//     console.log("📌 Requested Round ID:", roundId);
//     console.log("👤 Requested Interviewer ID:", interviewerId);

//     // 1️⃣ Validate roundId
//     if (!mongoose.Types.ObjectId.isValid(roundId)) {
//       console.log("❌ Invalid roundId:", roundId);
//       return res.status(400).json({ success: false, message: "Invalid round ID" });
//     }

//     // 1️⃣.5 Validate interviewerId if provided
//     if (interviewerId && !mongoose.Types.ObjectId.isValid(interviewerId)) {
//       console.log("❌ Invalid interviewerId:", interviewerId);
//       return res.status(400).json({ success: false, message: "Invalid interviewer ID" });
//     }

//     // 2️⃣ Find InterviewRound
//     const interviewRound = await InterviewRounds.findById(roundId)
//       .populate("interviewers", "FirstName LastName Email Phone");

//     if (!interviewRound) {
//       console.log("❌ InterviewRound not found for ID:", roundId);
//       return res.status(404).json({ success: false, message: "Interview round not found" });
//     }

//     const interviewSection = await Interview.findOne({ _id: interviewRound.interviewId });

//     // 3️⃣ Find CandidatePosition using interviewId
//     const candidatePosition = await CandidatePosition.findOne({
//       interviewId: interviewRound.interviewId,
//     })
//     .populate('candidateId', 'FirstName LastName Email Phone skills CurrentExperience ownerId')
//     .populate("positionId", "title companyname jobDescription minexperience maxexperience Location minSalary maxSalary");

//     // 4️⃣ Fetch Feedback linked with this round
//     const feedbackQuery = { interviewRoundId: roundId };
//     if (interviewerId) {
//       feedbackQuery.interviewerId = interviewerId;
//     }

//     const feedbacks = await FeedbackModel.find(feedbackQuery)
//       .populate("candidateId", "FirstName LastName Email Phone ownerId")
//       .populate("positionId", "title companyname jobDescription minexperience maxexperience Location minSalary maxSalary")
//       .populate("interviewerId", "FirstName LastName Email Phone")
//       .populate("ownerId", "firstName lastName email");

//     console.log(`🔍 Found ${feedbacks.length} feedback records`);

//     // 5️⃣ Fetch Interview Questions for this round
//     const interviewQuestionsList = await InterviewQuestions.find({ roundId: roundId });
//     console.log("✅ Interview Questions Found:", interviewQuestionsList.length, "questions");

//     // 🔍 DEBUG: Log each question details
//     interviewQuestionsList.forEach((q, i) => {
//       console.log(`   Q${i + 1}: _id=${q._id}, questionId=${q.questionId}, addedBy=${q.addedBy || 'undefined'}, ownerId=${q.ownerId || 'undefined'}`);
//     });

//     // 🆕 IMPROVED: Build comprehensive feedback map by questionId with interviewer details
//     const feedbackMap = {};
    
//     feedbacks.forEach(feedback => {
//       const interviewerIdStr = feedback.interviewerId?._id?.toString();
//       if (!interviewerIdStr) return;
      
//       console.log(`🔍 Processing feedback from interviewer: ${interviewerIdStr}`);
      
//       (feedback.questionFeedback || []).forEach(qf => {
//         if (qf.questionId) {
//           const questionIdStr = qf.questionId.toString();
//           console.log(`   📝 Question feedback for questionId: ${questionIdStr}`);
          
//           // Create nested structure: questionId -> array of feedback from different interviewers
//           if (!feedbackMap[questionIdStr]) {
//             feedbackMap[questionIdStr] = [];
//           }
          
//           feedbackMap[questionIdStr].push({
//             feedbackId: feedback._id,
//             candidateAnswer: qf.candidateAnswer || null,
//             interviewerFeedback: qf.interviewerFeedback || null,
//             interviewerId: interviewerIdStr,
//             interviewer: {
//               _id: feedback.interviewerId._id,
//               FirstName: feedback.interviewerId.FirstName,
//               LastName: feedback.interviewerId.LastName,
//               Email: feedback.interviewerId.Email,
//               Phone: feedback.interviewerId.Phone
//             },
//             // Include overall feedback details for context
//             skills: feedback.skills || [],
//             generalComments: feedback.generalComments || null,
//             overallImpression: feedback.overallImpression || null,
//             status: feedback.status,
//             createdAt: feedback.createdAt,
//             updatedAt: feedback.updatedAt
//           });
//         }
//       });
//     });

//     console.log("🗺️ Feedback map created:", Object.keys(feedbackMap).map(qId => `${qId}: ${feedbackMap[qId].length} feedback(s)`));

//     // 🆕 IMPROVED: Process questions and separate by type with proper feedback structure
//     let preselectedQuestions = [];
//     let interviewerAddedQuestions = [];

//     interviewQuestionsList.forEach(q => {
//       const questionIdStr = q.questionId?.toString();
//       let questionFeedbacks = [];
    
//       // Get feedback for this question
//       if (questionIdStr && feedbackMap[questionIdStr]) {
//         if (interviewerId) {
//           // Filter feedback by specific interviewer
//           questionFeedbacks = feedbackMap[questionIdStr].filter(fb => fb.interviewerId === interviewerId);
//         } else {
//           // Get all feedback for this question
//           questionFeedbacks = feedbackMap[questionIdStr];
//         }
//       }

//       const questionWithFeedback = {
//         _id: q._id,
//         questionId: q.questionId,
//         interviewId: q.interviewId,
//         roundId: q.roundId,
//         order: q.order,
//         customizations: q.customizations,
//         mandatory: q.mandatory,
//         tenantId: q.tenantId,
//         ownerId: q.ownerId,
//         source: q.source,
//         snapshot: q.snapshot,
//         addedBy: q.addedBy,
//         createdAt: q.createdAt,
//         updatedAt: q.updatedAt,
//         // 🆕 IMPROVED: Properly structured feedback array
//         feedbacks: questionFeedbacks.length > 0 ? questionFeedbacks : [],
//         feedbackCount: questionFeedbacks.length,
//         hasResponse: questionFeedbacks.some(fb => fb.candidateAnswer?.submittedAnswer || fb.interviewerFeedback?.note)
//       };

//       // 🆕 IMPROVED: Separate questions based on addedBy field
//       if (q.addedBy === "interviewer") {
//         // This is an interviewer-added question
//         if (interviewerId) {
//           // If filtering by specific interviewer, only include their questions
//           if (q.ownerId?.toString() === interviewerId) {
//             interviewerAddedQuestions.push(questionWithFeedback);
//           }
//         } else {
//           // Include all interviewer-added questions
//           interviewerAddedQuestions.push(questionWithFeedback);
//         }
//       } else {
//         // This is a preselected question (addedBy is null, undefined, or not "interviewer")
//         preselectedQuestions.push(questionWithFeedback);
//       }
//     });

//     console.log(`📊 Final counts - Preselected: ${preselectedQuestions.length}, Interviewer-added: ${interviewerAddedQuestions.length}`);

//     // 6️⃣ Get position data
//     let positionData = null;
//     if (candidatePosition?.positionId) {
//       positionData = {
//         _id: candidatePosition.positionId._id,
//         title: candidatePosition.positionId.title,
//         companyname: candidatePosition.positionId.companyname,
//         jobDescription: candidatePosition.positionId.jobDescription,
//         minexperience: candidatePosition.positionId.minexperience,
//         maxexperience: candidatePosition.positionId.maxexperience,
//         Location: candidatePosition.positionId.Location,
//         minSalary: candidatePosition.positionId.minSalary,
//         maxSalary: candidatePosition.positionId.maxSalary,
//         NoofPositions: candidatePosition.positionId.NoofPositions,
//         skills: candidatePosition.positionId.skills,
//         additionalNotes: candidatePosition.positionId.additionalNotes
//       };
//     } else if (feedbacks.length > 0 && feedbacks[0].positionId) {
//       positionData = {
//         _id: feedbacks[0].positionId._id,
//         title: feedbacks[0].positionId.title,
//         companyname: feedbacks[0].positionId.companyname,
//         jobDescription: feedbacks[0].positionId.jobDescription,
//         minexperience: feedbacks[0].positionId.minexperience,
//         maxexperience: feedbacks[0].positionId.maxexperience,
//         Location: feedbacks[0].positionId.Location,
//         minSalary: feedbacks[0].positionId.minSalary,
//         maxSalary: feedbacks[0].positionId.maxSalary,
//         NoofPositions: feedbacks[0].positionId.NoofPositions,
//         skills: feedbacks[0].positionId.skills,
//         additionalNotes: feedbacks[0].positionId.additionalNotes
//       };
//     }

//     // 🆕 IMPROVED: Calculate feedback statistics
//     const totalQuestions = preselectedQuestions.length + interviewerAddedQuestions.length;
//     const questionsWithFeedback = [...preselectedQuestions, ...interviewerAddedQuestions]
//       .filter(q => q.feedbacks.length > 0).length;
//     const questionsWithResponses = [...preselectedQuestions, ...interviewerAddedQuestions]
//       .filter(q => q.hasResponse).length;

//     // 7️⃣ Build Response
//     const responseData = {
//       interviewRound: {
//         _id: interviewRound._id,
//         interviewId: interviewRound.interviewId,
//         sequence: interviewRound.sequence,
//         interviewCode: interviewSection?.interviewCode,
//         roundTitle: interviewRound.roundTitle,
//         interviewMode: interviewRound.interviewMode,
//         interviewType: interviewRound.interviewType,
//         interviewerType: interviewRound.interviewerType,
//         duration: interviewRound.duration,
//         instructions: interviewRound.instructions,
//         dateTime: interviewRound.dateTime,
//         status: interviewRound.status,
//         meetingId: interviewRound.meetingId,
//         meetLink: interviewRound.meetLink,
//         assessmentId: interviewRound.assessmentId,
//         questions: interviewRound.questions,
//         rejectionReason: interviewRound.rejectionReason,
//         interviewers: interviewRound.interviewers || []
//       },
//       candidate: candidatePosition?.candidateId || null,
//       position: positionData,
//       interviewers: interviewRound.interviewers || [],
      
//       // 🆕 IMPROVED: Comprehensive feedback structure
//       interviewQuestions: {
//         preselectedQuestions: preselectedQuestions,
//         interviewerAddedQuestions: interviewerAddedQuestions,
//         statistics: {
//           totalQuestions: totalQuestions,
//           questionsWithFeedback: questionsWithFeedback,
//           questionsWithResponses: questionsWithResponses,
//           feedbackCompletionPercentage: totalQuestions > 0 ? Math.round((questionsWithFeedback / totalQuestions) * 100) : 0,
//           responseCompletionPercentage: totalQuestions > 0 ? Math.round((questionsWithResponses / totalQuestions) * 100) : 0
//         }
//       },
      
//       // 🆕 Keep original feedbacks for backward compatibility
//       feedbacks: feedbacks || [],
      
//       // 🆕 IMPROVED: Additional metadata
//       metadata: {
//         totalFeedbackRecords: feedbacks.length,
//         uniqueInterviewers: [...new Set(feedbacks.map(f => f.interviewerId?._id?.toString()))].filter(Boolean).length,
//         filteredByInterviewer: !!interviewerId,
//         requestedInterviewerId: interviewerId || null
//       }
//     };

//     console.log("🎉 Final response structure:", {
//       hasInterviewRound: !!responseData.interviewRound,
//       hasCandidate: !!responseData.candidate,
//       hasPosition: !!responseData.position,
//       interviewersCount: responseData.interviewers.length,
//       feedbacksCount: responseData.feedbacks.length,
//       preselectedQuestionsCount: responseData.interviewQuestions.preselectedQuestions.length,
//       interviewerAddedQuestionsCount: responseData.interviewQuestions.interviewerAddedQuestions.length,
//       filteredByInterviewer: !!interviewerId,
//       totalFeedbacksInQuestions: [...preselectedQuestions, ...interviewerAddedQuestions]
//         .reduce((sum, q) => sum + q.feedbacks.length, 0)
//     });

//     // 🆕 DEBUG: Log questions with feedback details
//     console.log("📋 Preselected Questions with feedback:");
//     preselectedQuestions.forEach((q, i) => {
//       console.log(`   P${i + 1}: ${q.snapshot?.questionText?.substring(0, 50)}... - Feedbacks: ${q.feedbacks.length}, HasResponse: ${q.hasResponse}`);
//     });

//     console.log("📋 Interviewer-Added Questions with feedback:");
//     interviewerAddedQuestions.forEach((q, i) => {
//       console.log(`   I${i + 1}: ${q.snapshot?.questionText?.substring(0, 50)}... - Feedbacks: ${q.feedbacks.length}, HasResponse: ${q.hasResponse}`);
//     });

//     res.status(200).json({
//       success: true,
//       message: "Feedback retrieved successfully",
//       data: responseData,
//     });

//   } catch (error) {
//     console.error("🔥 Error fetching feedback:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error",
//       error: error.message 
//     });
//   }
// };


