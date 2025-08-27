//<-------------------------------------NEW SCHEMA------------------------------------------

const mongoose = require("mongoose");

  // Sub-schema for solutions (from JSON)
  const solutionSchema = new mongoose.Schema({
    language: { type: String, required: true }, // NEW FIELD from JSON
    code: { type: String, required: true }, // NEW FIELD from JSON
    approach: { type: String } // NEW FIELD from JSON
  }, { _id: false });
  
  
  // Main schema
  const suggestedQuestionSchema = new mongoose.Schema({
    // questionNo: { type: String }, // From existing schema
    questionOrderId: { type: String }, // INTQ-00000, INTQ-00001, INTQ-00002
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
    minexperience: { type: Number },
    maxexperience: { type: Number },
    // charLimits: {
    //   min: { type: Number },
    //   max: { type: Number }
    // },
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
  
  const InterviewQuestion = mongoose.model("InterviewQuestions", suggestedQuestionSchema);
  
  module.exports = {
    InterviewQuestion,
  };
  
  // --------------------------------------NEW SCHEMA------------------------------------------> 