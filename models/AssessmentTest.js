const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
    sectionId: mongoose.Schema.Types.ObjectId,
    answeredQuestions: Number,
    totalQuestions: Number,
    passScore: Number,
    totalScore: Number
});

const AssessmentTestSchema = new mongoose.Schema({
    assessmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment'
    },
    answeredQuestionsScore: Number,
    totalScore: Number,
    candidateId: String,
    answeredQuestions: Number,
    totalQuestions: Number,
    timeSpent: String,
    questions: [{
        questionId: mongoose.Schema.Types.ObjectId,
        correctAnswer: String,
        givenAnswer: String,
        score: Number,
        marks: Number
    }],
    sections: [SectionSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    passScore: Number
});

module.exports = mongoose.model('AssessmentTest', AssessmentTestSchema);