// v1.0.0 <-------------------------------------NEW SCHEMA------------------------------------------
const mongoose = require("mongoose");

// Sub-schema for assessmentConfig (from JSON)
const assessmentConfigSchema = new mongoose.Schema({
  autoAssessable: { type: Boolean, required: true }, // NEW FIELD from JSON
  codeTemplate: { type: String, required: true }, // NEW FIELD from JSON
  testCases: [
    {
      input: { type: String, required: true }, // NEW FIELD from JSON
      expectedOutput: { type: String, required: true }, // NEW FIELD from JSON 
      expectedOutputType: { type: String, required: true } // NEW FIELD from JSON
    }
  ],
  timeComplexity: { type: String }, // NEW FIELD from JSON
  spaceComplexity: { type: String } // NEW FIELD from JSON
}, { _id: false });

// Sub-schema for solutions (from JSON)
const solutionSchema = new mongoose.Schema({
  language: { type: String, required: true }, // NEW FIELD from JSON
  code: { type: String, required: true }, // NEW FIELD from JSON
  approach: { type: String } // NEW FIELD from JSON
}, { _id: false });

// Sub-schema for autoAssessment (from existing schema + JSON)
const autoAssessmentSchema = new mongoose.Schema({
  criteria: { type: String },
  expectedAnswer: { type: String },
  testCases: [
    {
      input: { type: String },
      expectedOutput: { type: String },
      expectedOutputType: { type: String }, // NEW FIELD from JSON
      weight: { type: Number }
    }
  ]
}, { _id: false });

// Sub-schema for programming (from existing schema + JSON)
const programmingSchema = new mongoose.Schema({
  starterCode: { type: String },
  codeTemplate: { type: String }, // NEW FIELD from JSON
  language: [{ type: String }],
  testCases: [
    {
      input: { type: String },
      expected_output: { type: String },
      expectedOutput: { type: String }, // NEW FIELD from JSON
      expectedOutputType: { type: String }, // NEW FIELD from JSON
      weight: { type: Number }
    }
  ]
}, { _id: false });

// Main schema
const suggestedQuestionSchema = new mongoose.Schema({
  // questionNo: { type: String }, // From existing schema
  questionOrderId: { type: String }, // ASSQ-00000, ASSQ-00001, ASSQ-00002
  questionText: { type: String, required: true },
  questionType: { type: String, required: true },
  topic: { type: String }, // NEW FIELD from JSON
  category: { type: String }, // NEW FIELD from JSON
  area: { type: String }, // NEW FIELD from JSON
  subTopic: { type: String }, // NEW FIELD from JSON
  technology: [{ type: String }],
  skill: [{ type: String }],
  tags: [{ type: String }],
  difficultyLevel: { type: String },
  correctAnswer: { type: String },
  options: [{ type: String }],
  hints: [{ type: String }],
  explanation: { type: String }, // NEW FIELD from JSON
  isAutoAssessment: { type: Boolean },
  minexperience: { type: Number },
  maxexperience: { type: Number },
  charLimits: {
    min: { type: Number },
    max: { type: Number }
  },
  autoAssessment: autoAssessmentSchema,
  programming: programmingSchema,
  assessmentConfig: assessmentConfigSchema, // NEW FIELD from JSON
  solutions: [solutionSchema], // NEW FIELD from JSON
  relatedQuestions: [{ type: String }], // NEW FIELD from JSON
  attachments: [{ type: String }], // NEW FIELD from JSON
  reviewStatus: { type: String }, // NEW FIELD from JSON
  version: { type: Number, default: 1 }, // NEW FIELD from JSON
  isActive: { type: Boolean, default: true },
  createdBy: { type: String },
  modifiedDate: { type: Date },
  modifiedBy: { type: String }
}, { timestamps: true });

const AssessmentQuestion = mongoose.model("AssessmentQuestions", suggestedQuestionSchema);

module.exports = {
  AssessmentQuestion,
};

// --------------------------------------NEW SCHEMA------------------------------------------>