const mongoose = require('mongoose');

const suggestedQuestionSchema = new mongoose.Schema({
    Question: String,
    QuestionType: String,
    Skill: String,
    DifficultyLevel: String,
    Score: String,
    Answer: String,
    Options: [String],
    CreatedDate: {
        type: Date,
        default: Date.now
    },
    CreatedBy: String,
    ModifiedDate: Date,
    ModifiedBy: String,
    favorites: [{
        userId: String,
        favorite: {
            type: Boolean,
            default: false
        }
    }]
});

const SuggestedQuestion = mongoose.model("SuggestedQuestion", suggestedQuestionSchema);
module.exports = {
    SuggestedQuestion
};