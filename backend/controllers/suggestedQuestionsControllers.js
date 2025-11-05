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

    // Fetch both collections to get total count
    const [assessments, interviews] = await Promise.all([
      AssessmentQuestion.find().lean(),
      InterviewQuestion.find().lean(),
    ]);

    // Sort each type by creation date (newest first)
    interviews.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    assessments.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    const totalInterviewCount = interviews.length;
    const totalAssessmentCount = assessments.length;
    const totalQuestionsCount = totalInterviewCount + totalAssessmentCount;

    // Calculate accessible counts for each type with fair sharing
    let accessibleInterviewCount = Infinity;
    let accessibleAssessmentCount = Infinity;
    
    if (accessibleCount !== Infinity) {
      // Split the limit equally between Interview and Assessment
      const halfLimit = Math.floor(accessibleCount / 2);
      
      // Calculate base allocation for each type
      accessibleInterviewCount = Math.min(halfLimit, totalInterviewCount);
      accessibleAssessmentCount = Math.min(halfLimit, totalAssessmentCount);
      
      // If one type has fewer questions than its half, give the unused quota to the other
      const unusedInterviewQuota = halfLimit - accessibleInterviewCount;
      const unusedAssessmentQuota = halfLimit - accessibleAssessmentCount;
      
      // Add unused quota from Interview to Assessment
      if (unusedInterviewQuota > 0) {
        accessibleAssessmentCount = Math.min(
          accessibleAssessmentCount + unusedInterviewQuota,
          totalAssessmentCount
        );
      }
      
      // Add unused quota from Assessment to Interview
      if (unusedAssessmentQuota > 0) {
        accessibleInterviewCount = Math.min(
          accessibleInterviewCount + unusedAssessmentQuota,
          totalInterviewCount
        );
      }
    }
    
    // Process questions based on type filter
    let questionsToReturn = [];
    let actualAccessibleCount = 0;
    let actualLockedCount = 0;

    if (questionType === 'Interview') {
      // Return only interview questions with their specific limit
      interviews.forEach((doc, index) => {
        const isLocked = accessibleInterviewCount !== Infinity && index >= accessibleInterviewCount;
        questionsToReturn.push(toUnified(doc, index, isLocked));
        if (isLocked) {
          actualLockedCount++;
        } else {
          actualAccessibleCount++;
        }
      });
    } else if (questionType === 'Assessment' || questionType === 'Assignment') {
      // Return only assessment questions with their specific limit
      assessments.forEach((doc, index) => {
        const isLocked = accessibleAssessmentCount !== Infinity && index >= accessibleAssessmentCount;
        questionsToReturn.push(toUnified(doc, index, isLocked));
        if (isLocked) {
          actualLockedCount++;
        } else {
          actualAccessibleCount++;
        }
      });
    } else {
      // Return all questions - combine with proper locking
      // First add accessible interviews
      interviews.forEach((doc, index) => {
        const isLocked = accessibleInterviewCount !== Infinity && index >= accessibleInterviewCount;
        questionsToReturn.push(toUnified(doc, index, isLocked));
        if (isLocked) {
          actualLockedCount++;
        } else {
          actualAccessibleCount++;
        }
      });
      
      // Then add accessible assessments
      assessments.forEach((doc, index) => {
        const isLocked = accessibleAssessmentCount !== Infinity && index >= accessibleAssessmentCount;
        questionsToReturn.push(toUnified(doc, interviews.length + index, isLocked));
        if (isLocked) {
          actualLockedCount++;
        } else {
          actualAccessibleCount++;
        }
      });
      
      // Sort combined list by date
      questionsToReturn.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
    }

    // Calculate total locked questions
    const totalLockedQuestions = accessibleCount !== Infinity 
      ? Math.max(0, totalQuestionsCount - Math.min(accessibleCount, totalQuestionsCount))
      : 0;

    return res.status(200).send({
      success: true,
      message: 'Questions retrieved',
      questions: questionsToReturn,
      usageLimit,
      totalQuestions: totalQuestionsCount, // Total across both types
      accessibleQuestions: actualAccessibleCount || (accessibleCount !== Infinity ? accessibleCount : totalQuestionsCount),
      lockedQuestions: actualLockedCount || totalLockedQuestions,
      questionTypeFilter: questionType || 'all',
      // Additional info for better UI display
      typeBreakdown: {
        interview: {
          total: totalInterviewCount,
          accessible: accessibleInterviewCount !== Infinity ? accessibleInterviewCount : totalInterviewCount,
          locked: totalInterviewCount - (accessibleInterviewCount !== Infinity ? accessibleInterviewCount : totalInterviewCount)
        },
        assessment: {
          total: totalAssessmentCount,
          accessible: accessibleAssessmentCount !== Infinity ? accessibleAssessmentCount : totalAssessmentCount,
          locked: totalAssessmentCount - (accessibleAssessmentCount !== Infinity ? accessibleAssessmentCount : totalAssessmentCount)
        }
      }
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