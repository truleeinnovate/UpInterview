//<----v1.0.0---Venkatesh----create post and get suggested questions from assessment and interview questions

const { AssessmentQuestion } = require('../models/QuestionBank/assessmentQuestions');
const { InterviewQuestion } = require('../models/QuestionBank/interviewQuestions');
const { checkQuestionBankUsageLimit } = require('../services/questionBankUsageService');

const createQuestion = async (req, res) => {
  try {
    const isInterview = req.body?.questionType === "Interview";
    //   req.body?.isInterviewType === true ||
    //   (typeof req.body?.type === 'string' && req.body.type.toLowerCase() === 'interview');

    const Model = isInterview ? InterviewQuestion : AssessmentQuestion;
    const prefix = isInterview ? 'INTQ' : 'ASSQ';

    const lastDoc = await Model.findOne().sort({ createdAt: -1 }).select('questionOrderId createdAt');
    let nextOrderId = `${prefix}-00000`;
    if (lastDoc && lastDoc.questionOrderId) {
      const parts = String(lastDoc.questionOrderId).split('-');
      const lastNumStr = parts[1] || '0';
      const nextNum = Number(lastNumStr) + 1;
      nextOrderId = `${prefix}-${nextNum.toString().padStart(lastNumStr.length, '0')}`;
    }

    const payload = { ...req.body, questionOrderId: nextOrderId };
    const doc = new Model(payload);
    await doc.save();

    const unified = {
      _id: doc._id,
      questionOrderId: doc.questionOrderId,
      questionNo: doc.questionOrderId, 
      questionText: doc.questionText,
      questionType: doc.questionType,
      technology: doc.technology || [],
      skill: doc.skill || [],
      tags: doc.tags || [],
      difficultyLevel: doc.difficultyLevel,
      correctAnswer: doc.correctAnswer,
      options: doc.options || [],
      hints: doc.hints || [],
      explanation: doc.explanation,
      isAutoAssessment: doc.isAutoAssessment || false,
      autoAssessment: doc.autoAssessment || null,
      programming: doc.programming || null,
      solutions: doc.solutions || null,
      relatedQuestions: doc.relatedQuestions || [],
      attachments: doc.attachments || [],
      reviewStatus: doc.reviewStatus,
      version: doc.version,
      isActive: doc.isActive,
      createdBy: doc.createdBy,
      modifiedDate: doc.modifiedDate,
      modifiedBy: doc.modifiedBy,
      minexperience: doc.minexperience,
      maxexperience: doc.maxexperience,
      charLimits: doc.charLimits,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    return res.status(201).send({
      success: true,
      message: 'Question Added',
      question: unified,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: 'Failed to add question',
      error: error.message,
    });
  }
};

const getQuestions = async (req, res) => {
  try {
    const questionType = req.query?.questionType;
    const tenantId = req.query?.tenantId || req.headers['x-tenant-id'];
    const ownerId = req.query?.ownerId || req.headers['x-owner-id'];

    // Check Question Bank Access usage limits
    let usageLimit = null;
    let canAccessAll = true;
    let accessibleCount = Infinity;
    
    if (tenantId) {
      const usageCheck = await checkQuestionBankUsageLimit(tenantId, ownerId);
      usageLimit = {
        canAccess: usageCheck.canAccess,
        utilized: usageCheck.utilized,
        entitled: usageCheck.entitled,
        remaining: usageCheck.remaining,
        message: usageCheck.message
      };
      
      // Calculate how many questions user can access
      if (usageCheck.entitled !== Infinity) {
        accessibleCount = usageCheck.entitled;
        canAccessAll = usageCheck.remaining > 500; // Assume max 500 questions in bank
      }
    }

    const toUnified = (doc, index, isLocked = false) => ({
      _id: doc._id,
      questionOrderId: doc.questionOrderId,
      questionNo: doc.questionOrderId,
      questionText: doc.questionText, // Keep original text, frontend will handle masking
      questionType: doc.questionType,
      category: Array.isArray(doc.category) ? doc.category : doc.category ? [doc.category].flat() : [],
      technology: Array.isArray(doc.technology) ? doc.technology : doc.technology ? [doc.technology].flat() : [],
      skill: Array.isArray(doc.skill) ? doc.skill : doc.skill ? [doc.skill].flat() : [],
      tags: doc.tags ? [doc.tags].flat() : [],
      difficultyLevel: doc.difficultyLevel,
      correctAnswer: doc.correctAnswer,
      options: Array.isArray(doc.options) ? doc.options : [],
      hints: Array.isArray(doc.hints) ? doc.hints : [],
      explanation: doc.explanation,
      isAutoAssessment: !!doc.isAutoAssessment,
      autoAssessment: doc.autoAssessment || null,
      programming: doc.programming || null,
      solutions: doc.solutions || null,
      relatedQuestions: Array.isArray(doc.relatedQuestions) ? doc.relatedQuestions : [],
      attachments: Array.isArray(doc.attachments) ? doc.attachments : [],
      reviewStatus: doc.reviewStatus,
      version: doc.version,
      isActive: doc.isActive,
      createdBy: doc.createdBy,
      modifiedDate: doc.modifiedDate,
      modifiedBy: doc.modifiedBy,
      minexperience: doc.minexperience,
      maxexperience: doc.maxexperience,
      charLimits: doc.charLimits,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      isLocked: isLocked,
      lockReason: isLocked ? 'Upgrade your plan to access more questions' : null
    });

    // Fetch both collections to get total count for combined limit
    const [assessments, interviews] = await Promise.all([
      AssessmentQuestion.find().lean(),
      InterviewQuestion.find().lean(),
    ]);

    // Combine and sort all questions for consistent ordering
    const allDocs = [...interviews, ...assessments].sort((a, b) => {
      // Sort by creation date or ID for consistent ordering
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA; // Newest first
    });

    // Calculate total questions and apply global limit
    const totalQuestionsCount = allDocs.length;
    
    // When filtering by type, filter from the combined list but maintain global index for locking
    let questionsToReturn = [];
    let filteredQuestions = [];

    if (questionType === 'Interview') {
      // Filter only interview questions but keep track of their position in combined list
      allDocs.forEach((doc, globalIndex) => {
        // Check if this is an interview question (you may need to adjust this check)
        const isInterview = interviews.some(i => i._id.toString() === doc._id.toString());
        if (isInterview) {
          const isLocked = accessibleCount !== Infinity && globalIndex >= accessibleCount;
          filteredQuestions.push({ doc, globalIndex, isLocked });
        }
      });
    } else if (questionType === 'Assessment' || questionType === 'Assignment') {
      // Filter only assessment questions but keep track of their position in combined list
      allDocs.forEach((doc, globalIndex) => {
        const isAssessment = assessments.some(a => a._id.toString() === doc._id.toString());
        if (isAssessment) {
          const isLocked = accessibleCount !== Infinity && globalIndex >= accessibleCount;
          filteredQuestions.push({ doc, globalIndex, isLocked });
        }
      });
    } else {
      // Return all questions with combined limit
      allDocs.forEach((doc, globalIndex) => {
        const isLocked = accessibleCount !== Infinity && globalIndex >= accessibleCount;
        filteredQuestions.push({ doc, globalIndex, isLocked });
      });
    }

    // Map to unified format
    questionsToReturn = filteredQuestions.map(({ doc, globalIndex, isLocked }) => 
      toUnified(doc, globalIndex, isLocked)
    );

    // Calculate locked questions based on total, not filtered
    const totalLockedQuestions = accessibleCount !== Infinity 
      ? Math.max(0, totalQuestionsCount - accessibleCount) 
      : 0;

    return res.status(200).send({
      success: true,
      message: 'Questions retrieved',
      questions: questionsToReturn,
      usageLimit,
      totalQuestions: totalQuestionsCount, // Total across both types
      accessibleQuestions: accessibleCount !== Infinity ? accessibleCount : totalQuestionsCount,
      lockedQuestions: totalLockedQuestions,
      questionTypeFilter: questionType || 'all'
    });
  } catch (error) {
    console.log('error in getting questions', error);
    return res.status(500).send({
      success: false,
      message: 'Failed to get questions',
      error: error.message,
    });
  }
};

// Check Question Bank Usage Status
const checkQuestionBankUsage = async (req, res) => {
  try {
    const tenantId = req.query?.tenantId || req.headers['x-tenant-id'];
    const ownerId = req.query?.ownerId || req.headers['x-owner-id'];
    
    if (!tenantId) {
      return res.status(400).send({
        success: false,
        message: 'Tenant ID is required'
      });
    }
    
    const usageCheck = await checkQuestionBankUsageLimit(tenantId, ownerId);
    
    return res.status(200).send({
      success: true,
      canAccess: usageCheck.canAccess,
      utilized: usageCheck.utilized,
      entitled: usageCheck.entitled,
      remaining: usageCheck.remaining,
      message: usageCheck.message,
      percentage: usageCheck.entitled !== Infinity 
        ? Math.round((usageCheck.utilized / usageCheck.entitled) * 100)
        : 0
    });
  } catch (error) {
    console.error('Error checking question bank usage:', error);
    return res.status(500).send({
      success: false,
      message: 'Failed to check usage',
      error: error.message
    });
  }
};

module.exports = { createQuestion, getQuestions, checkQuestionBankUsage }
//-----v1.0.0--------------------------------->