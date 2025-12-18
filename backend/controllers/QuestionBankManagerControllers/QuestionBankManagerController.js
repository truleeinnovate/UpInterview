// v1.0.0 - Ashok - changed minExperience, maxExperience to minexperience, maxexperience
// v1.0.1 - Ashok - changed some code in createQuestions Controller
// v1.0.2 - Ashok - added backend pagination for improve loading speed by getting chunk of data
// v1.0.3 - Ashok - Tried to fix issue for getting data in online
// v1.0.4 - Ashok - added updateQuestionById controller and route for updating question by ID added updatedBy and createdBy fields

const fs = require("fs"); // for reading uploaded files
const Papa = require("papaparse"); // for parsing CSV
const {
  InterviewQuestion,
} = require("../../models/QuestionBank/interviewQuestions");
const {
  AssessmentQuestion,
} = require("../../models/QuestionBank/assessmentQuestions");
const { Users } = require("../../models/Users");

// helper to pick correct model
const getModel = (type) => {
  if (type === "interview") return InterviewQuestion;
  if (type === "assessment") return AssessmentQuestion;
  throw new Error("Invalid question type");
};
// v1.0.1 <--------------------------------------------------------------------------
// const createQuestions = async (req, res) => {
//   try {
//     const { type } = req.params;
//     console.log("Request type:", type);

//     const Model = getModel(type);

//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     console.log("CSV file uploaded:", req.file.originalname);
//     const fileContent = fs.readFileSync(req.file.path, "utf8");

//     const parseCSV = (content) =>
//       new Promise((resolve, reject) => {
//         Papa.parse(content, {
//           header: true,
//           skipEmptyLines: true,
//           complete: (results) => resolve(results.data),
//           error: (err) => reject(err),
//         });
//       });

//     let rawData = [];
//     try {
//       rawData = await parseCSV(fileContent);
//       console.log("CSV parsed successfully, rows:", rawData.length);
//     } catch (err) {
//       console.error("CSV parsing failed:", err);
//       return res.status(400).json({ error: "CSV parse error", details: err });
//     }

//     const safeParseList = (str) => {
//       if (!str) return undefined; // Return undefined to avoid saving empty
//       try {
//         if (str.startsWith("[") && str.endsWith("]")) {
//           const parsed = JSON.parse(str);
//           return Array.isArray(parsed) && parsed.length > 0
//             ? parsed
//             : undefined;
//         }
//         const splitArray = str
//           .split(",")
//           .map((s) => s.trim())
//           .filter((s) => s.length > 0);
//         return splitArray.length > 0 ? splitArray : undefined;
//       } catch {
//         return undefined;
//       }
//     };

//     const safeParseNumber = (val) => {
//       const n = Number(val);
//       return isNaN(n) ? undefined : n;
//     };

//     const cleanString = (val) => {
//       if (!val || val.trim() === "") return undefined;
//       return val.trim();
//     };

//     const validRows = [];
//     const invalidRows = [];
//     rawData.forEach((row, idx) => {
//       const doc = {
//         questionOrderId: cleanString(row.questionOrderId),
//         questionText: cleanString(row.questionText),
//         questionType: cleanString(row.questionType),
//         category: cleanString(row.category),
//         area: cleanString(row.area),
//         topic: cleanString(row.topic),
//         subTopic: cleanString(row.subTopic),
//         technology: safeParseList(row.technology),
//         tags: safeParseList(row.tags),
//         difficultyLevel: cleanString(row.difficultyLevel),
//         hints: safeParseList(row.hints),
//         explanation: cleanString(row.explanation),
//         // v1.0.0 <---------------------------------------------
//         minexperience: safeParseNumber(row.minexperience),
//         maxexperience: safeParseNumber(row.maxexperience),
//         // v1.0.0 --------------------------------------------->
//         solutions: safeParseList(row.solutions),
//         relatedQuestions: safeParseList(row.relatedQuestions),
//       };

//       // Remove keys with undefined values to avoid empty field insert
//       Object.keys(doc).forEach((key) => {
//         if (doc[key] === undefined) {
//           delete doc[key];
//         }
//       });

//       const instance = new Model(doc);
//       const error = instance.validateSync();
//       if (error) {
//         invalidRows.push({ idx, error: error.message, doc });
//       } else {
//         validRows.push(doc);
//       }
//     });

//     let insertResult = [];
//     if (validRows.length > 0) {
//       insertResult = await Model.insertMany(validRows, { ordered: false });
//       console.log(`Inserted ${insertResult.length} records from CSV`);
//     } else {
//       console.log("No valid records to insert from CSV");
//     }

//     fs.unlinkSync(req.file.path);

//     return res.status(201).json({
//       inserted: insertResult,
//       invalid: invalidRows,
//       totalAttempted: rawData.length,
//       totalInserted: insertResult.length,
//       totalInvalid: invalidRows.length,
//     });
//   } catch (error) {
//     console.error("Error in createQuestions:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

const safeParseList = (str) => {
  if (!str) return undefined;
  try {
    if (str.startsWith("[") && str.endsWith("]")) {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : undefined;
    }
    const splitArray = str
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    return splitArray.length > 0 ? splitArray : undefined;
  } catch {
    return undefined;
  }
};

const safeParseNumber = (val) => {
  const n = Number(val);
  return isNaN(n) ? undefined : n;
};

const cleanString = (val) => {
  if (!val || val.trim() === "") return undefined;
  return val.trim();
};

// solutions parser
const safeParseSolutions = (str) => {
  if (!str) return undefined;
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) {
      return parsed
        .map((s) => {
          if (s.language && s.code) {
            return {
              language: String(s.language).trim(),
              code: String(s.code).trim(),
              approach: s.approach ? String(s.approach).trim() : undefined,
            };
          }
          return null;
        })
        .filter((s) => s !== null);
    }
    return undefined;
  } catch {
    return undefined;
  }
};

// parse JSON safely
const safeParseJSON = (str) => {
  if (!str) return undefined;
  try {
    return JSON.parse(str);
  } catch {
    return undefined;
  }
};

// --------------------- controller ---------------------
const createQuestions = async (req, res) => {
  // Mark that logging will be handled by this controller
  res.locals.loggedByController = true;
  res.locals.processName = "Create Questions";

  try {
    const { type } = req.params;
    const Model = getModel(type);
    const createdBy = req.body.createdBy || req.query.createdBy;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileContent = fs.readFileSync(req.file.path, "utf8");

    const parseCSV = (content) =>
      new Promise((resolve, reject) => {
        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data),
          error: (err) => reject(err),
        });
      });

    let rawData = [];
    try {
      rawData = await parseCSV(fileContent);
    } catch (err) {
      console.error("CSV parsing failed:", err);
      return res.status(400).json({ error: "CSV parse error", details: err });
    }

    const validRows = [];
    const invalidRows = [];

    rawData.forEach((row, idx) => {
      // fields common to both
      const baseDoc = {
        questionOrderId: cleanString(row.questionOrderId),
        questionText: cleanString(row.questionText),
        questionType: cleanString(row.questionType),
        topic: cleanString(row.topic),
        category: cleanString(row.category),
        area: cleanString(row.area),
        subTopic: cleanString(row.subTopic),
        technology: safeParseList(row.technology),
        tags: safeParseList(row.tags),
        difficultyLevel: cleanString(row.difficultyLevel),
        correctAnswer: cleanString(row.correctAnswer),
        options: safeParseList(row.options),
        hints: safeParseList(row.hints),
        explanation: cleanString(row.explanation),
        minexperience: safeParseNumber(row.minexperience),
        maxexperience: safeParseNumber(row.maxexperience),
        solutions: safeParseSolutions(row.solutions),
        relatedQuestions: safeParseList(row.relatedQuestions),
        attachments: safeParseList(row.attachments),
        reviewStatus: cleanString(row.reviewStatus),
        version: safeParseNumber(row.version),
        isActive:
          row.isActive !== undefined
            ? String(row.isActive).toLowerCase() === "true"
            : undefined,
        createdBy: createdBy,
      };

      // Convert createdBy to ObjectId
      if (createdBy) {
        try {
          baseDoc.createdBy = new mongoose.Types.ObjectId(createdBy);
        } catch (err) {
          console.warn(`Invalid ObjectId for createdBy: ${createdBy}`);
        }
      }

      // interview only
      const interviewExtras = {};

      // assessment only
      const assessmentExtras = {
        isAutoAssessment:
          row.isAutoAssessment !== undefined
            ? String(row.isAutoAssessment).toLowerCase() === "true"
            : undefined,
        charLimits: safeParseJSON(row.charLimits),
        autoAssessment: safeParseJSON(row.autoAssessment),
        programming: safeParseJSON(row.programming),
        assessmentConfig: safeParseJSON(row.assessmentConfig),
      };

      const doc =
        type === "interview"
          ? { ...baseDoc, ...interviewExtras }
          : { ...baseDoc, ...assessmentExtras };

      // remove empty
      Object.keys(doc).forEach((key) => {
        if (doc[key] === undefined) {
          delete doc[key];
        }
      });

      const instance = new Model(doc);
      const error = instance.validateSync();
      if (error) {
        invalidRows.push({ idx, error: error.message, doc });
      } else {
        validRows.push(doc);
      }
    });

    let insertResult = [];
    if (validRows.length > 0) {
      insertResult = await Model.insertMany(validRows, { ordered: false });
    } else {
    }

    fs.unlinkSync(req.file.path);

    // Structured internal log for successful bulk create
    res.locals.logData = {
      tenantId: req.body?.tenantId || "",
      ownerId: req.body?.ownerId || "",
      processName: "Create Questions",
      requestBody: {
        type,
        totalRows: rawData.length,
        validRows: validRows.length,
        invalidRows: invalidRows.length,
      },
      status: "success",
      message: "Questions created from CSV successfully",
      responseBody: {
        inserted: insertResult,
        invalid: invalidRows,
        totalAttempted: rawData.length,
        totalInserted: insertResult.length,
        totalInvalid: invalidRows.length,
      },
    };

    return res.status(201).json({
      inserted: insertResult,
      invalid: invalidRows,
      totalAttempted: rawData.length,
      totalInserted: insertResult.length,
      totalInvalid: invalidRows.length,
    });
  } catch (error) {
    console.error("Error in createQuestions:", error);
    // Structured internal log for error case
    res.locals.logData = {
      tenantId: req.body?.tenantId || "",
      ownerId: req.body?.ownerId || "",
      processName: "Create Questions",
      requestBody: {
        type: req.params?.type,
      },
      status: "error",
      message: error.message,
    };

    res.status(500).json({ error: error.message });
  }
};

// v1.0.1 <-------------------------------------------------------------------------->

// v1.0.2 <--------------------------------------------------------------------------------

// const getQuestions = async (req, res) => {
//   try {
//     const { type } = req.params;
//     const {
//       page = 1,
//       perPage = 10,
//       searchTerm = "",
//       sortOrder = "asc",
//     } = req.query;
//     const Model = getModel(type);

//     const query = {};

//     // Optional search across fields
//     if (searchTerm) {
//       const regex = new RegExp(searchTerm, "i"); // case-insensitive
//       query.$or = [
//         { topic: regex },
//         { questionOrderId: regex },
//         { questionText: regex },
//       ];
//     }

//     const total = await Model.countDocuments(query);

//     // 👇 choose sort direction dynamically
//     const sortDirection = sortOrder === "asc" ? 1 : -1;

//     const questions = await Model.find(query)
//       .skip((page - 1) * perPage)
//       .limit(parseInt(perPage))
//       // v1.0.3 <---------------------------------------------
//       .sort({ _id: sortDirection });
//     // v1.0.3 --------------------------------------------->
//     // you can also change this to "createdAt" or "_id" depending on requirement

//     res.status(200).json({
//       success: true,
//       total,
//       page: parseInt(page),
//       perPage: parseInt(perPage),
//       sortOrder,
//       questions,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

const getQuestions = async (req, res) => {
  try {
    const { type } = req.params;
    const {
      page = 1,
      perPage = 10,
      searchTerm = "",
      sortOrder = "asc",
      topic,
      difficulty,
      questionType,
      category,
      subTopic,
      area,
      technology,
      tags,
      minexperience,
      maxexperience,
      isActive,
      reviewStatus,
      fromDate,
      toDate,
      // add more fields as needed
    } = req.query;
    const Model = getModel(type);

    const query = {};

    // --- Search (across fields)
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i");
      query.$or = [
        { topic: regex },
        { questionOrderId: regex },
        { questionText: regex },
      ];
    }

    // --- Filters by direct fields
    if (topic) query.topic = new RegExp(topic, "i");
    if (difficulty) query.difficultyLevel = difficulty;
    if (questionType) query.questionType = questionType;
    if (category) query.category = category;
    if (subTopic) query.subTopic = subTopic;
    if (area) query.area = area;
    if (technology) query.technology = technology; // value: string OR [string]
    if (tags) query.tags = tags; // value: string OR [string]
    if (reviewStatus) query.reviewStatus = reviewStatus;
    if (isActive !== undefined) query.isActive = isActive === "true";

    // --- Filters by experience
    if (minexperience) query.minexperience = { $gte: Number(minexperience) };
    if (maxexperience) query.maxexperience = { $lte: Number(maxexperience) };

    // --- Filters by created date range
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    // --- Pagination and sorting
    const total = await Model.countDocuments(query);
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    const questions = await Model.find(query)
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage))
      .sort({ _id: sortDirection })
      .populate("createdBy", "firstName lastName -password")
      .populate("updatedBy", "firstName lastName -password");

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      perPage: parseInt(perPage),
      sortOrder,
      questions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// v1.0.2 -------------------------------------------------------------------------------->

// Get by ID
const getQuestionById = async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = getModel(type);

    const doc = await Model.findById(id);
    if (!doc) return res.status(404).json({ error: "Not found" });

    res.status(200).json(doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete multiple questions
const getQuestionDeleteById = async (req, res) => {
  try {
    const { type } = req.params;
    const { questionIds } = req.body;

    if (
      !questionIds ||
      !Array.isArray(questionIds) ||
      questionIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Question IDs array is required",
      });
    }

    let Model;
    if (type === "interview") {
      Model = InterviewQuestion;
    } else if (type === "assessment") {
      Model = AssessmentQuestion;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid question type. Use 'interview' or 'assessment'",
      });
    }

    // Verify all questions exist before deletion
    const existingQuestions = await Model.find({
      _id: { $in: questionIds },
    });

    if (existingQuestions.length !== questionIds.length) {
      const foundIds = existingQuestions.map((q) => q._id.toString());
      const missingIds = questionIds.filter((id) => !foundIds.includes(id));

      return res.status(404).json({
        success: false,
        message: "Some questions not found",
        missingIds,
      });
    }

    // Delete the questions
    const result = await Model.deleteMany({
      _id: { $in: questionIds },
    });

    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} questions`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting questions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update by ID
const updateQuestionById = async (req, res) => {
  // Mark that logging will be handled by this controller
  res.locals.loggedByController = true;
  res.locals.processName = "Update Question";

  try {
    const { type, id } = req.params;
    const updateData = req.body;

    const Model = getModel(type);
    const updatedBy = updateData.updatedBy;

    // If tenant found, replace updatedBy with readable name
    if (updatedBy) {
      updateData.updatedBy = updatedBy;
    }

    const updatedQuestion = await Model.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Structured internal log for successful update
    res.locals.logData = {
      tenantId: req.body?.tenantId || "",
      ownerId: req.body?.ownerId || "",
      processName: "Update Question",
      requestBody: req.body,
      status: "success",
      message: "Question updated successfully",
      responseBody: updatedQuestion,
    };

    res.json({
      message: "Question updated successfully",
      data: updatedQuestion,
    });
  } catch (error) {
    console.error("Error updating question:", error);
    // Structured internal log for error case
    res.locals.logData = {
      tenantId: req.body?.tenantId || "",
      ownerId: req.body?.ownerId || "",
      processName: "Update Question",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    res
      .status(500)
      .json({ message: "Error updating question", error: error.message });
  }
};

module.exports = {
  createQuestions,
  getQuestions,
  getQuestionById,
  getQuestionDeleteById,
  updateQuestionById,
};
