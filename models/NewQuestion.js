const mongoose = require('mongoose');

const newQuestionSchema = new mongoose.Schema({
    Question: String,
    QuestionType: String,
    Skill: String,
    DifficultyLevel: String,
    Score: String,
    Answer: String,
    Options: [String],
    CreatedDate: { type: Date, default: Date.now },
    createdBy: String,
    orgId: String,
    OwnerId: String,
});

const newQuestionHistorySchema = new mongoose.Schema({
    newQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'NewQuestion' },
    Question: String,
    QuestionType: String,
    Skill: String,
    DifficultyLevel: String,
    Score: String,
    Answer: String,
    Options: [String],
    CreatedDate: Date,
    createdBy: String,
    ModifiedDate: { type: Date, default: Date.now },
    ModifiedBy: String,
    orgId: String,
    OwnerId: String,
    Action: String,
    ActionDate: { type: Date, default: Date.now }
});

newQuestionSchema.pre('save', function (next) {
    if (this.isNew) {
        this.CreatedDate = Date.now();
    }
    next();
});

const NewQuestion = mongoose.model("NewQuestion", newQuestionSchema);
const NewQuestionHistory = mongoose.model("NewQuestionHistory", newQuestionHistorySchema);

module.exports = { NewQuestion, NewQuestionHistory };