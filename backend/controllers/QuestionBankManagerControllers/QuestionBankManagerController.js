const fs = require("fs"); // for reading uploaded files
const Papa = require("papaparse"); // for parsing CSV
const {
  InterviewQuestion,
} = require("../../models/QuestionBank/interviewQuestions");
const {
  AssessmentQuestion,
} = require("../../models/QuestionBank/assessmentQuestions");

// helper to pick correct model
const getModel = (type) => {
  if (type === "interview") return InterviewQuestion;
  if (type === "assessment") return AssessmentQuestion;
  throw new Error("Invalid question type");
};


const createQuestions = async (req, res) => {
  try {
    const { type } = req.params;
    console.log("Request type:", type);

    const Model = getModel(type);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("CSV file uploaded:", req.file.originalname);
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
      console.log("CSV parsed successfully, rows:", rawData.length);
    } catch (err) {
      console.error("CSV parsing failed:", err);
      return res.status(400).json({ error: "CSV parse error", details: err });
    }

    const safeParseList = (str) => {
      if (!str) return undefined; // Return undefined to avoid saving empty
      try {
        if (str.startsWith("[") && str.endsWith("]")) {
          const parsed = JSON.parse(str);
          return Array.isArray(parsed) && parsed.length > 0 ? parsed : undefined;
        }
        const splitArray = str.split(",").map(s => s.trim()).filter(s => s.length > 0);
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

    const validRows = [];
    const invalidRows = [];
    rawData.forEach((row, idx) => {
      const doc = {
        questionOrderId: cleanString(row.questionOrderId),
        questionText: cleanString(row.questionText),
        questionType: cleanString(row.questionType),
        category: cleanString(row.category),
        area: cleanString(row.area),
        topic: cleanString(row.topic),
        subTopic: cleanString(row.subTopic),
        technology: safeParseList(row.technology),
        tags: safeParseList(row.tags),
        difficultyLevel: cleanString(row.difficultyLevel),
        hints: safeParseList(row.hints),
        explanation: cleanString(row.explanation),
        minExperience: safeParseNumber(row.minExperience),
        maxExperience: safeParseNumber(row.maxExperience),
        solutions: safeParseList(row.solutions),
        relatedQuestions: safeParseList(row.relatedQuestions)
      };

      // Remove keys with undefined values to avoid empty field insert
      Object.keys(doc).forEach(key => {
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
      console.log(`Inserted ${insertResult.length} records from CSV`);
    } else {
      console.log("No valid records to insert from CSV");
    }

    fs.unlinkSync(req.file.path);

    return res.status(201).json({
      inserted: insertResult,
      invalid: invalidRows,
      totalAttempted: rawData.length,
      totalInserted: insertResult.length,
      totalInvalid: invalidRows.length
    });
  } catch (error) {
    console.error("Error in createQuestions:", error);
    res.status(500).json({ error: error.message });
  }
};


const getQuestions = async (req, res) => {
  try {
    const { type } = req.params;
    const Model = getModel(type);

    const data = await Model.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

module.exports = {
  createQuestions,
  getQuestions,
  getQuestionById,
};
