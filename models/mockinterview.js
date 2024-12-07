const mongoose = require('mongoose');

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
  hour = hour ? hour : 12; // the hour '0' should be '12'
  return `${day}/${month}/${year} ${hour}:${minute} ${ampm}`;
};

const MockInterviewSchema = new mongoose.Schema({
    Title: String,
    Skills: String,
    DateTime: String,
    Interviewer: String,
    Duration: String,
    CreatedDate: { type: String, default: formatDateTime },
    CreatedBy: String,
    ModifiedDate: Date,
    ModifiedBy: String,
    Category: String,
    Description:String,
    Status: String,
    CreatedById: String,
    LastModifiedById: String,
    OwnerId: String,
    orgId: String,
  });
  const MockInterviewHistorySchema = new mongoose.Schema({
    MockInterviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'MockInterview', required: true },
    Title: String,
    Skills: String,
    DateTime: String,
    Interviewer: String,
    Duration: String,
    CreatedDate: String,
    CreatedBy: String,
    ModifiedDate: Date,
    ModifiedBy: String,
    Category: String,
    Description: String,
    Status: String,
    Action: String,  // e.g., 'Created', 'Updated', 'Deleted'
});

const MockInterviewHistory = mongoose.model("MockInterviewHistory", MockInterviewHistorySchema);
const MockInterview = mongoose.model("MockInterview", MockInterviewSchema);
module.exports = {
    MockInterview,
    MockInterviewHistory
};