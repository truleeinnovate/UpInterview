const mongoose = require('mongoose');

const sectionQuestionSchema = new mongoose.Schema({
    Question: { type: String, required: true },
    QuestionType: { type: String, required: true },
    DifficultyLevel: { type: String, required: true },
    Score: { type: Number, required: true },
    Answer: { type: String, required: true },
    SectionName: { type: String, required: true },
    CreatedDate: { type: Date, default: Date.now },
    CreatedBy: String,
    ModifiedDate: Date,
    ModifiedBy: String,
});

sectionQuestionSchema.pre('save', function(next) {
    if (this.isNew) {
        this.CreatedDate = Date.now();
    }
    next();
});

const SectionQuestion = mongoose.model("SectionQuestion", sectionQuestionSchema);
module.exports = SectionQuestion;