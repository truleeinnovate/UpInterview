const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    round: { type: String },
    mode: { type: String },
    dateTime: { type: String },
    duration: { type: String },
    interviewers: { type: [String] },
    instructions: { type: String },
    status: { type: String, default: 'Scheduled' },
});

const ScheduleRounds = mongoose.model('ScheduleRounds', roundSchema);
module.exports = ScheduleRounds;