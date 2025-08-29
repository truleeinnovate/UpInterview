const mongoose = require('mongoose');
const TenantInterviewQuestionsSchema = new mongoose.Schema({
    questionNo: String,
    suggestedQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewQuestions' },
    tenantListId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TenantQuestionsListNames' }],
    isCustom: { type: Boolean, default: false },
    questionText: String,
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
    isActive: Boolean,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    ownerId: String,
    tenantId: String,
    isInterviewQuestionType: Boolean,
}, { timestamps: true });

const TenantInterviewQuestions = mongoose.models.tenantInterviewQuestions || mongoose.model("tenantInterviewQuestions", TenantInterviewQuestionsSchema);

module.exports = { TenantInterviewQuestions  };