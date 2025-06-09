
const mongoose = require('mongoose');
const TenantQuestionsSchema = new mongoose.Schema({
    questionNo: String,
    suggestedQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'suggestedQuestions' },
    tenantListId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TenantQuestionsListNames' }],
    isCustom: { type: Boolean, default: false },
    questionText: String,
    questionType: String,
    technology: [String],
    skill: [String],
    tags: [String],
    difficultyLevel: String,
    // score: String,
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
    createdDate: {
        type: Date,
        default: Date.now
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    ownerId: String,
    tenantId: String,
});

TenantQuestionsSchema.pre('save', function (next) {
    if (this.isNew) {
        this.CreatedDate = Date.now();
    }
    next();
});

const TenantQuestions  = mongoose.model("tenantQuestions", TenantQuestionsSchema);

module.exports = { TenantQuestions  };