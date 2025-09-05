const mongoose = require('mongoose');
const TenantAssessmentQuestionsSchema = new mongoose.Schema({
    questionNo: String,
    suggestedQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AssessmentQuestions' },
    tenantListId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TenantQuestionsListNames' }],
    isCustom: { type: Boolean, default: false },
    questionText: String,
    category: { type: String }, // NEW FIELD from JSON
    questionType: String,
    technology: [String],
    skill: [String],
    tags: [String],
    difficultyLevel: String,
    correctAnswer: String,
    options: [String],
    hints: String,
    charLimits: { 
        min: Number,
        max: Number
    },
    minexperience: Number,
    maxexperience: Number,
    isAutoAssessment: Boolean,
    autoAssessment: {
        criteria: String,
        expectedAnswer: String,
        testCases: [
            {
                input: String,
                expectedOutput: String,
                weight: Number
            }
        ]
    },
    programming: {
        starterCode: String,
        language: [String],
        testCases: [
            {
                input: String,
                expected_output: String,
                weight: Number
            }
        ]
    },
    isActive: Boolean,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    ownerId: String,
    tenantId: String,
    isInterviewQuestionType: Boolean,
}, { timestamps: true });

const TenantAssessmentQuestions = mongoose.models.tenantAssessmentQuestions || mongoose.model("tenantAssessmentQuestions", TenantAssessmentQuestionsSchema);

module.exports = { TenantAssessmentQuestions  };