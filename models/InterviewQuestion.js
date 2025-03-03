const mongoose = require('mongoose');

const InterviewQuestionSchema = new mongoose.Schema({
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
  questionId: { type: mongoose.Schema.Types.ObjectId },
  source: { type: String },
  snapshot: { type: Object },
  order: { type: Number },
  customizations: { type: String },
  createdAt: { type: Date, default: Date.now },
  mandatory: { type: String }
});

const InterviewQuestion = mongoose.model('InterviewQuestion', InterviewQuestionSchema);
module.exports = { InterviewQuestion };
