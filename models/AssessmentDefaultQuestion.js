// models/AssessmentDefaultQuestion.js
const mongoose = require('mongoose');

const assessmentDefaultQuestionSchema = new mongoose.Schema({
    skill: { type: String, required: true },
    question: { type: String, required: true },
    score: { type: Number, required: true },
    difficultyLevel: { type: String, required: true },
    answer: { type: String, required: true },
    questionType: { type: String, required: true }
});

module.exports = mongoose.model('AssessmentDefaultQuestion', assessmentDefaultQuestionSchema);