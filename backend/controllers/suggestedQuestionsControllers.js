//<----v1.0.0---Venkatesh----create post and get suggested questions from assessment and interview questions

const {
  AssessmentQuestion,
} = require("../models/QuestionBank/assessmentQuestions");
const {
  InterviewQuestion,
} = require("../models/QuestionBank/interviewQuestions");
const {
  checkQuestionBankUsageLimit,
} = require("../services/questionBankUsageService");

const createQuestion = async (req, res) => {
  try {
    const isInterview = req.body?.questionType === "Interview";
    //   req.body?.isInterviewType === true ||
    //   (typeof req.body?.type === 'string' && req.body.type.toLowerCase() === 'interview');

    const Model = isInterview ? InterviewQuestion : AssessmentQuestion;
    const prefix = isInterview ? "INTQ" : "ASSQ";

    const lastDoc = await Model.findOne()
      .sort({ _id: -1 })
      .select("questionOrderId createdAt");
    let nextOrderId = `${prefix}-00000`;
    if (lastDoc && lastDoc.questionOrderId) {
      const parts = String(lastDoc.questionOrderId).split("-");
      const lastNumStr = parts[1] || "0";
      const nextNum = Number(lastNumStr) + 1;
      nextOrderId = `${prefix}-${nextNum
        .toString()
        .padStart(lastNumStr.length, "0")}`;
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
      message: "Question Added",
      question: unified,
    });
  } catch (error) {
    // console.log(error);
    return res.status(500).send({
      success: false,
      message: "Failed to add question",
      error: error.message,
    });
  }
};

// const getQuestions = async (req, res) => {
//   try {
//     const questionType = req.query?.questionType;
//     const tenantId = req.query?.tenantId || req.headers['x-tenant-id'];
//     const ownerId = req.query?.ownerId || req.headers['x-owner-id'];

//     // Check Question Bank Access usage limits
//     let usageLimit = null;
//     let canAccessAll = true;
//     let accessibleCount = Infinity;

//     if (tenantId) {
//       const usageCheck = await checkQuestionBankUsageLimit(tenantId, ownerId);
//       usageLimit = {
//         canAccess: usageCheck.canAccess,
//         utilized: usageCheck.utilized,
//         entitled: usageCheck.entitled,
//         remaining: usageCheck.remaining,
//         message: usageCheck.message
//       };

//       // Calculate how many questions user can access
//       if (usageCheck.entitled !== Infinity) {
//         accessibleCount = usageCheck.entitled;
//         canAccessAll = usageCheck.remaining > 500; // Assume max 500 questions in bank
//       }
//     }

//     const toUnified = (doc, index, isLocked = false) => ({
//       _id: doc._id,
//       questionOrderId: doc.questionOrderId,
//       questionNo: doc.questionOrderId,
//       questionText: doc.questionText, // Keep original text, frontend will handle masking
//       questionType: doc.questionType,
//       category: Array.isArray(doc.category) ? doc.category : doc.category ? [doc.category].flat() : [],
//       technology: Array.isArray(doc.technology) ? doc.technology : doc.technology ? [doc.technology].flat() : [],
//       skill: Array.isArray(doc.skill) ? doc.skill : doc.skill ? [doc.skill].flat() : [],
//       tags: doc.tags ? [doc.tags].flat() : [],
//       difficultyLevel: doc.difficultyLevel,
//       correctAnswer: doc.correctAnswer,
//       options: Array.isArray(doc.options) ? doc.options : [],
//       hints: Array.isArray(doc.hints) ? doc.hints : [],
//       explanation: doc.explanation,
//       isAutoAssessment: !!doc.isAutoAssessment,
//       autoAssessment: doc.autoAssessment || null,
//       programming: doc.programming || null,
//       solutions: doc.solutions || null,
//       relatedQuestions: Array.isArray(doc.relatedQuestions) ? doc.relatedQuestions : [],
//       attachments: Array.isArray(doc.attachments) ? doc.attachments : [],
//       reviewStatus: doc.reviewStatus,
//       version: doc.version,
//       isActive: doc.isActive,
//       createdBy: doc.createdBy,
//       modifiedDate: doc.modifiedDate,
//       modifiedBy: doc.modifiedBy,
//       minexperience: doc.minexperience,
//       maxexperience: doc.maxexperience,
//       charLimits: doc.charLimits,
//       createdAt: doc.createdAt,
//       updatedAt: doc.updatedAt,
//       isLocked: isLocked,
//       lockReason: isLocked ? 'Upgrade your plan to access more questions' : null
//     });

//     // Fetch both collections to get total count
//     const [assessments, interviews] = await Promise.all([
//       AssessmentQuestion.find().lean(),
//       InterviewQuestion.find().lean(),
//     ]);

//     // Sort each type by creation date (newest first)
//     interviews.sort((a, b) => {
//       const dateA = new Date(a.createdAt || 0);
//       const dateB = new Date(b.createdAt || 0);
//       return dateB - dateA;
//     });

//     assessments.sort((a, b) => {
//       const dateA = new Date(a.createdAt || 0);
//       const dateB = new Date(b.createdAt || 0);
//       return dateB - dateA;
//     });

//     const totalInterviewCount = interviews.length;
//     const totalAssessmentCount = assessments.length;
//     const totalQuestionsCount = totalInterviewCount + totalAssessmentCount;

//     // Calculate accessible counts for each type with fair sharing
//     let accessibleInterviewCount = Infinity;
//     let accessibleAssessmentCount = Infinity;

//     if (accessibleCount !== Infinity) {
//       // Split the limit equally between Interview and Assessment
//       const halfLimit = Math.floor(accessibleCount / 2);

//       // Calculate base allocation for each type
//       accessibleInterviewCount = Math.min(halfLimit, totalInterviewCount);
//       accessibleAssessmentCount = Math.min(halfLimit, totalAssessmentCount);

//       // If one type has fewer questions than its half, give the unused quota to the other
//       const unusedInterviewQuota = halfLimit - accessibleInterviewCount;
//       const unusedAssessmentQuota = halfLimit - accessibleAssessmentCount;

//       // Add unused quota from Interview to Assessment
//       if (unusedInterviewQuota > 0) {
//         accessibleAssessmentCount = Math.min(
//           accessibleAssessmentCount + unusedInterviewQuota,
//           totalAssessmentCount
//         );
//       }

//       // Add unused quota from Assessment to Interview
//       if (unusedAssessmentQuota > 0) {
//         accessibleInterviewCount = Math.min(
//           accessibleInterviewCount + unusedAssessmentQuota,
//           totalInterviewCount
//         );
//       }
//     }

//     // Process questions based on type filter
//     let questionsToReturn = [];
//     let actualAccessibleCount = 0;
//     let actualLockedCount = 0;

//     if (questionType === 'Interview') {
//       // Return only interview questions with their specific limit
//       interviews.forEach((doc, index) => {
//         const isLocked = accessibleInterviewCount !== Infinity && index >= accessibleInterviewCount;
//         questionsToReturn.push(toUnified(doc, index, isLocked));
//         if (isLocked) {
//           actualLockedCount++;
//         } else {
//           actualAccessibleCount++;
//         }
//       });
//     } else if (questionType === 'Assessment' || questionType === 'Assignment') {
//       // Return only assessment questions with their specific limit
//       assessments.forEach((doc, index) => {
//         const isLocked = accessibleAssessmentCount !== Infinity && index >= accessibleAssessmentCount;
//         questionsToReturn.push(toUnified(doc, index, isLocked));
//         if (isLocked) {
//           actualLockedCount++;
//         } else {
//           actualAccessibleCount++;
//         }
//       });
//     } else {
//       // Return all questions - combine with proper locking
//       // First add accessible interviews
//       interviews.forEach((doc, index) => {
//         const isLocked = accessibleInterviewCount !== Infinity && index >= accessibleInterviewCount;
//         questionsToReturn.push(toUnified(doc, index, isLocked));
//         if (isLocked) {
//           actualLockedCount++;
//         } else {
//           actualAccessibleCount++;
//         }
//       });

//       // Then add accessible assessments
//       assessments.forEach((doc, index) => {
//         const isLocked = accessibleAssessmentCount !== Infinity && index >= accessibleAssessmentCount;
//         questionsToReturn.push(toUnified(doc, interviews.length + index, isLocked));
//         if (isLocked) {
//           actualLockedCount++;
//         } else {
//           actualAccessibleCount++;
//         }
//       });

//       // Sort combined list by date
//       questionsToReturn.sort((a, b) => {
//         const dateA = new Date(a.createdAt || 0);
//         const dateB = new Date(b.createdAt || 0);
//         return dateB - dateA;
//       });
//     }

//     // Calculate total locked questions
//     const totalLockedQuestions = accessibleCount !== Infinity
//       ? Math.max(0, totalQuestionsCount - Math.min(accessibleCount, totalQuestionsCount))
//       : 0;

//     return res.status(200).send({
//       success: true,
//       message: 'Questions retrieved',
//       questions: questionsToReturn,
//       usageLimit,
//       totalQuestions: totalQuestionsCount, // Total across both types
//       accessibleQuestions: actualAccessibleCount || (accessibleCount !== Infinity ? accessibleCount : totalQuestionsCount),
//       lockedQuestions: actualLockedCount || totalLockedQuestions,
//       questionTypeFilter: questionType || 'all',
//       // Additional info for better UI display
//       typeBreakdown: {
//         interview: {
//           total: totalInterviewCount,
//           accessible: accessibleInterviewCount !== Infinity ? accessibleInterviewCount : totalInterviewCount,
//           locked: totalInterviewCount - (accessibleInterviewCount !== Infinity ? accessibleInterviewCount : totalInterviewCount)
//         },
//         assessment: {
//           total: totalAssessmentCount,
//           accessible: accessibleAssessmentCount !== Infinity ? accessibleAssessmentCount : totalAssessmentCount,
//           locked: totalAssessmentCount - (accessibleAssessmentCount !== Infinity ? accessibleAssessmentCount : totalAssessmentCount)
//         }
//       }
//     });
//   } catch (error) {
//     console.log('error in getting questions', error);
//     return res.status(500).send({
//       success: false,
//       message: 'Failed to get questions',
//       error: error.message,
//     });
//   }
// };

// Check Question Bank Usage Status

const getQuestions = async (req, res) => {
  try {
    const {
      questionType,
      // tenantId,
      // ownerId,
      // New filter parameters
      page = 1,
      limit = 10,
      search = "",
      difficultyLevel,
      category,
      technology,
      questionTypes, // Array of question types (MCQ, Short, etc.)
    } = req.query;

    const tenantId = req.query?.tenantId || req.headers["x-tenant-id"];
    const ownerId = req.query?.ownerId || req.headers["x-owner-id"];

    // Parse array parameters
    const difficultyLevels = difficultyLevel ? difficultyLevel.split(",") : [];
    const categories = category ? category.split(",") : [];
    const technologies = technology ? technology.split(",") : [];

    const questionTypeFilters = questionTypes ? questionTypes.split(",") : [];

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Debug logging
    // console.log("Search Query Params:", { search, questionType, page, limit });

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
        message: usageCheck.message,
      };

      if (usageCheck.entitled !== Infinity) {
        accessibleCount = usageCheck.entitled;
        canAccessAll = usageCheck.remaining > 500;
      }
    }

    const toUnified = (doc, index, isLocked = false) => ({
      _id: doc._id,
      questionOrderId: doc.questionOrderId,
      questionNo: doc.questionOrderId,
      questionText: doc.questionText,
      questionType: doc.questionType,
      category: Array.isArray(doc.category)
        ? doc.category
        : doc.category
          ? [doc.category].flat()
          : [],
      technology: Array.isArray(doc.technology)
        ? doc.technology
        : doc.technology
          ? [doc.technology].flat()
          : [],
      skill: Array.isArray(doc.skill)
        ? doc.skill
        : doc.skill
          ? [doc.skill].flat()
          : [],
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
      relatedQuestions: Array.isArray(doc.relatedQuestions)
        ? doc.relatedQuestions
        : [],
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
      lockReason: isLocked
        ? "Upgrade your plan to access more questions"
        : null,
    });

    // ------------------------------------ DO NOT Remove -------------------------------------------------
    // Do not remove this commented code it needs be used in the future.
    // Build filter queries for both collections
    // const buildFilterQuery = (collectionType) => {
    //   const query = {};

    //   // Question type filter
    //   if (questionType === "Interview" && collectionType === "assessment") {
    //     return null; // Skip wrong collection
    //   }
    //   if (
    //     (questionType === "Assessment" || questionType === "Assignment") &&
    //     collectionType === "interview"
    //   ) {
    //     return null; // Skip wrong collection
    //   }

    //   // Search filter (across multiple fields)
    //   if (search) {
    //     const searchRegex = new RegExp(search, "i");
    //     query.$or = [
    //       { questionText: searchRegex },
    //       { tags: searchRegex },
    //       { technology: searchRegex },
    //       { topic: searchRegex },
    //       { category: searchRegex },
    //       { subTopic: searchRegex },
    //       { area: searchRegex },
    //     ];
    //   }

    //   // Difficulty level filter
    //   if (difficultyLevels.length > 0) {
    //     query.difficultyLevel = {
    //       $in: difficultyLevels.map((d) => new RegExp(`^${d}$`, "i")),
    //     };
    //   }

    //   // Category filter
    //   if (categories.length > 0) {
    //     query.category = { $in: categories.map((c) => new RegExp(c, "i")) };
    //   }

    //   // Technology filter
    //   if (technologies.length > 0) {
    //     query.technology = { $in: technologies.map((t) => new RegExp(t, "i")) };
    //   }

    //   // Question type filter (MCQ, Short, etc.)
    //   if (questionTypeFilters.length > 0) {
    //     query.questionType = {
    //       $in: questionTypeFilters.map((t) => new RegExp(`^${t}$`, "i")),
    //     };
    //   }

    //   const result = Object.keys(query).length > 0 ? query : {};
    //   // console.log(`Filter Query for ${collectionType}:`, JSON.stringify(result, null, 2));
    //   return result;
    // };

    const buildFilterQuery = (collectionType) => {
      const query = {};

      if (questionType === "Interview" && collectionType === "assessment")
        return null;
      if (
        (questionType === "Assessment" || questionType === "Assignment") &&
        collectionType === "interview"
      )
        return null;

      let finalQuestionTypes = questionTypeFilters;
      if (questionType === "Assignment" && collectionType === "assessment") {
        const allowed = ["MCQ", "Boolean"];
        finalQuestionTypes =
          questionTypeFilters.length > 0
            ? questionTypeFilters.filter((t) =>
              allowed.some((a) => a.toLowerCase() === t.toLowerCase()),
            )
            : allowed;

        if (finalQuestionTypes.length === 0) finalQuestionTypes = allowed;
      }

      if (finalQuestionTypes.length > 0) {
        query.questionType = {
          $in: finalQuestionTypes.map((t) => new RegExp(`^${t}$`, "i")),
        };
      }

      if (search) {
        // Handle search as array or string
        const searchTerms = Array.isArray(search) ? search : [search];

        // Create AND condition for all search terms
        // Each term must match at least one field (OR logic within the term)
        // But ALL terms must match (AND logic across terms)
        const searchConditions = searchTerms.filter(term => term && term.trim()).map(term => {
          // Escape special regex characters to prevent errors
          const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const searchRegex = new RegExp(escapedTerm, "i");

          return {
            $or: [
              { questionText: searchRegex },
              { tags: searchRegex },
              // { technology: searchRegex },
              // { topic: searchRegex },
              // { category: searchRegex },
              // { subTopic: searchRegex },
              // { area: searchRegex },
              // { skill: searchRegex } // Added skill field
            ]
          };
        });

        if (searchConditions.length > 0) {
          // Use $and so ALL search terms must match
          query.$and = searchConditions;
        }
      }

      // Difficulty level filter
      if (difficultyLevels.length > 0) {
        query.difficultyLevel = {
          $in: difficultyLevels.map((d) => new RegExp(`^${d}$`, "i")),
        };
      }

      // Category filter
      if (categories.length > 0) {
        query.category = { $in: categories.map((c) => new RegExp(c, "i")) };
      }

      // Technology filter
      if (technologies.length > 0) {
        query.technology = { $in: technologies.map((t) => new RegExp(t, "i")) };
      }

      const result = Object.keys(query).length > 0 ? query : {};
      return result;
    };
    // ------------------------------------ DO NOT Remove -------------------------------------------------

    // Fetch filtered data from both collections
    const [assessments, interviews, totalAssessments, totalInterviews] =
      await Promise.all([
        // Assessment questions
        AssessmentQuestion.find(buildFilterQuery("assessment") || {})
          // .sort({ createdAt: -1 })
          .sort({ _id: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),

        // Interview questions
        InterviewQuestion.find(buildFilterQuery("interview") || {})
          // .sort({ createdAt: -1 })
          .sort({ _id: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),

        // Total counts for pagination
        AssessmentQuestion.countDocuments(buildFilterQuery("assessment") || {}),
        InterviewQuestion.countDocuments(buildFilterQuery("interview") || {}),
      ]);

    // console.log("Query Results:", {
    //   interviewsCount: interviews.length,
    //   assessmentsCount: assessments.length,
    //   totalInterviews,
    //   totalAssessments
    // });

    // Combine and process results based on question type
    let allQuestions = [];
    let totalCount = 0;

    if (questionType === "Interview") {
      allQuestions = interviews;
      totalCount = totalInterviews;
    } else if (questionType === "Assessment" || questionType === "Assignment") {
      allQuestions = assessments;
      totalCount = totalAssessments;
    } else {
      // Combine both collections
      allQuestions = [...interviews, ...assessments];
      totalCount = totalInterviews + totalAssessments;

      // Sort combined results by date
      allQuestions.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
    }

    // Apply access limits and locking using GLOBAL index across pages
    // Use `skip` (derived from page and limit) to compute absolute index
    const baseIndex = skip; // position of the first item in this page within the full result set
    const processedQuestions = allQuestions.map((doc, indexOnPage) => {
      const globalIndex = baseIndex + indexOnPage;
      const isLocked =
        accessibleCount !== Infinity && globalIndex >= accessibleCount;
      return toUnified(doc, globalIndex, isLocked);
    });

    const totalPages = Math.ceil(totalCount / limitNum);
    const accessibleQuestions =
      accessibleCount !== Infinity
        ? Math.min(accessibleCount, totalCount)
        : totalCount;
    const lockedQuestions =
      accessibleCount !== Infinity
        ? Math.max(0, totalCount - accessibleCount)
        : 0;

    return res.status(200).send({
      success: true,
      message: "Questions retrieved successfully",
      questions: processedQuestions,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalQuestions: totalCount,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
      usageLimit,
      totalQuestions: totalCount,
      accessibleQuestions: accessibleQuestions,
      lockedQuestions: lockedQuestions,
      questionTypeFilter: questionType || "all",
      filters: {
        search,
        difficultyLevel: difficultyLevels,
        category: categories,
        technology: technologies,
        questionTypes: questionTypeFilters,
      },
    });
  } catch (error) {
    // console.log('Error in getting questions', error);
    return res.status(500).send({
      success: false,
      message: "Failed to get questions",
      error: error.message,
    });
  }
};

const checkQuestionBankUsage = async (req, res) => {
  try {
    const tenantId = req.query?.tenantId || req.headers["x-tenant-id"];
    const ownerId = req.query?.ownerId || req.headers["x-owner-id"];

    if (!tenantId) {
      return res.status(400).send({
        success: false,
        message: "Tenant ID is required",
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
      percentage:
        usageCheck.entitled !== Infinity
          ? Math.round((usageCheck.utilized / usageCheck.entitled) * 100)
          : 0,
    });
  } catch (error) {
    console.error("Error checking question bank usage:", error);
    return res.status(500).send({
      success: false,
      message: "Failed to check usage",
      error: error.message,
    });
  }
};

module.exports = { createQuestion, getQuestions, checkQuestionBankUsage };
//-----v1.0.0--------------------------------->
