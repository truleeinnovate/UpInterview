// v1.0.0  -  Ashraf  -  fixed name assessment to assessment template
const AssessmentQuestionsSchema = require('../models/Assessment/selectedAssessmentquestions.js')
const mongoose = require('mongoose');
 // <-------------------------------v1.0.0
const Assessment = require("../models/Assessment/assessmentTemplates");
// ------------------------------v1.0.0 >




// exports.getByAssessmentQuestionsId = async (req, res) => {
//   try {
//       // Validate if id is a valid ObjectId
//       if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//           return res.status(400).json({ 
//               success: false,
//               message: 'Invalid question ID format' 
//           });
//       }

//       const assessmentQuestion = await AssessmentQuestionsSchema.findById(req.params.id);
      
//       if (!assessmentQuestion) {
//           return res.status(404).json({ 
//               success: false,
//               message: 'Assessment question not found' 
//           });
//       }

//       res.status(200).json({
//           success: true,
//           data: assessmentQuestion
//       });
//   } catch (error) {
//       console.error('Error in getByAssessmentQuestionsId:', error);
//       res.status(500).json({ 
//           success: false,
//           message: 'Internal server error',
//           error: error.message 
//       });
//   }
// }

exports.getByAssessmentId = async (req, res) => {
  try {
    const assessmentId = req.params.assessmentId;
    
    // If assessmentId is an object, extract the _id
    const id = typeof assessmentId === 'object' ? assessmentId._id : assessmentId;
    
    // Validate if assessmentId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid assessment ID format' 
      });
    }

    const assessmentQuestions = await AssessmentQuestionsSchema.findOne({
      assessmentId: id
    }).populate('assessmentId', 'name description');
    
    if (!assessmentQuestions) {
      // Return success with empty data instead of 404
      return res.status(200).json({
        success: true,
        exists: false,
        data: {
          sections: []
        }
      });
    }

    res.status(200).json({
      success: true,
      exists: true,
      data: assessmentQuestions
    });
  } catch (error) {
    console.error('Error in getByAssessmentId:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

// for both post and patch in assessment
exports.upsertAssessmentQuestions = async (req, res) => {
  // Mark that logging will be handled by this controller
  res.locals.loggedByController = true;
  res.locals.processName = "Upsert Assessment Questions";

  // derive tenant/owner for logging from authenticated context
  const { actingAsUserId, actingAsTenantId } = res.locals.auth || {};
  const tenantIdForLog = actingAsTenantId || req.body?.tenantId || "";
  const ownerIdForLog = actingAsUserId || req.body?.ownerId || "";

  try {
    const { assessmentId, sections } = req.body;

    // Validation
    if (!assessmentId || !Array.isArray(sections)) {
      return res.status(400).json({
        success: false,
        message: 'assessmentId and sections array are required',
      });
    }

    // Transform data (same for create/update)
    const transformedSections = sections.map((section) => ({
      sectionName: section.sectionName,
      passScore: section.passScore || 0,
      totalScore:section.totalScore,
      questions: section.questions.map((question) => ({
        questionId: new mongoose.Types.ObjectId(
          question.questionId || question._id
        ),
        source: question.source || 'system',
        snapshot: {
          ...question.snapshot,
        },
        score:question.score,
        order: question.order || 0,
        customizations: question.customizations || null,
      })),
    }));

    // Upsert operation
    const result = await AssessmentQuestionsSchema.findOneAndUpdate(
      { assessmentId: new mongoose.Types.ObjectId(assessmentId) },
      { $set: { sections: transformedSections } },
      { 
        new: true,
        upsert: true, // Creates if doesn't exist
        runValidators: true 
      }
    );

    // Structured internal log for successful upsert
    res.locals.logData = {
      tenantId: tenantIdForLog,
      ownerId: ownerIdForLog,
      processName: "Upsert Assessment Questions",
      requestBody: req.body,
      status: "success",
      message: "Assessment questions processed successfully",
      responseBody: result,
    };

    res.status(200).json({
      success: true,
      message: 'Assessment questions processed successfully',
      data: result
    });

  } catch (error) {
    console.error('Error:', error);
    // Structured internal log for error case
    res.locals.logData = {
      tenantId: tenantIdForLog,
      ownerId: ownerIdForLog,
      processName: "Upsert Assessment Questions",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    res.status(500).json({
      success: false,
      message: error.message,
      error: error.name
    });
  }
};


// // assessment questions position, interview, intevriew template
// // get assessment questions By ID
// exports.getAssessmentById = async (req, res) => {
//     try {
//       if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//         return res.status(400).json({ success: false, message: 'Invalid assessment ID format', sections: [] });
//       }
 
//       // Fetch the assessment
//       const assessment = await Assessment.findById(req.params.id);
//       if (!assessment) {
//         return res.status(404).json({ success: false, message: 'Assessment not found', sections: [] });
//       }
 
//       // Fetch associated questions with full structure
//       const assessmentQuestions = await AssessmentQuestionsSchema.findOne({ assessmentId: req.params.id }).lean();
 
//       // if (!assessmentQuestions) {
//       //   return res.status(404).json({ success: false, message: 'Questions not found for assessment' });
//       // }
     
//       // Return combined data
//       res.status(200).json({
//         ...assessment.toObject(),
//          sections: (assessmentQuestions && assessmentQuestions.sections) ? assessmentQuestions.sections : [],
//         // sections: assessmentQuestions?.sections || [], // Return full section/question structure
//       });
//     } catch (error) {
//       console.error("Error fetching assessment:", error);
//       res.status(500).json({ success: false, error: "Internal server error", message: error.message });
//     }
//   };
