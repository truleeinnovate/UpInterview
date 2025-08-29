//<----v1.0.0---Venkatesh----create post and get suggested questions from assessment and interview questions

const { AssessmentQuestion } = require('../models/QuestionBank/assessmentQuestions');
const { InterviewQuestion } = require('../models/QuestionBank/interviewQuestions');

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

    const toUnified = (doc) => ({
      _id: doc._id,
      questionOrderId: doc.questionOrderId,
      questionNo: doc.questionOrderId,
      questionText: doc.questionText,
      questionType: doc.questionType,
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
    });

    // When explicitly requesting by type, only fetch from the respective collection
    if (questionType === 'Interview') {
      const interviews = await InterviewQuestion.find().lean();
      const unifiedQuestions = interviews.map((d) => toUnified(d));
      return res.status(200).send({
        success: true,
        message: 'Questions retrieved',
        questions: unifiedQuestions,
      });
    }

    if (questionType !== 'Interview') {
      const assessments = await AssessmentQuestion.find().lean();
      const unifiedQuestions = assessments.map((d) => toUnified(d));
      return res.status(200).send({
        success: true,
        message: 'Questions retrieved',
        questions: unifiedQuestions,
      });
    }

    // Default: fetch both
    const [assessments, interviews] = await Promise.all([
      AssessmentQuestion.find().lean(),
      InterviewQuestion.find().lean(),
    ]);

    const unifiedQuestions = [
      ...assessments.map((d) => toUnified(d)),
      ...interviews.map((d) => toUnified(d)),
    ];

    return res.status(200).send({
      success: true,
      message: 'Questions retrieved',
      questions: unifiedQuestions,
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

module.exports = { createQuestion, getQuestions }
//-----v1.0.0--------------------------------->