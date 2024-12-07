const mongoose = require('mongoose');
const ScheduleRounds = require('./ScheduleRounds');

const formatDateTime = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  let hour = now.getHours();
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12;
  return `${day}/${month}/${year} ${hour}:${minute} ${ampm}`;
};

const InterviewSchema = new mongoose.Schema({
  Candidate: String,
  CandidateId: String,
  Position: String,
  ScheduleType: String,
  rounds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ScheduleRounds' }],
  CreatedDate: { type: String, default: formatDateTime },
  ModifiedDate: Date,
  ModifiedBy: String,
  Category: String,
  Status: String,
  Interviewstype: String,
  createdAt: { type: Date, default: Date.now },
  candidateImageUrl: String,
  CreatedById: String,
  LastModifiedById: String,
  OwnerId: String,
  orgId: String,
});

const interviewHistorySchema = new mongoose.Schema({
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
  Candidate: String,
  CandidateId: String,
  Position: String,
  ScheduleType: String,
  rounds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ScheduleRounds' }],
  // CreatedDate: String,
  // CreatedBy: String,
  ModifiedDate: Date,
  ModifiedBy: String,
  Category: String,
  Status: String,
  Interviewstype: String,
  // createdAt: Date,
  Action: String,
  ActionDate: { type: Date, default: Date.now }
});

const InterviewHistory = mongoose.model('InterviewHistory', interviewHistorySchema);
const Interview = mongoose.model("Interview", InterviewSchema);

module.exports = { Interview, InterviewHistory };