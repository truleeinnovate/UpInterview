// models/questionbankFavList.js
const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  name: { type: String, required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  OwnerId: { type: String, required: true },
  orgId: String,
});

module.exports = mongoose.model('QuestionbankFavList', listSchema);