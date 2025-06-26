const mongoose = require("mongoose");

const formatDateTime = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  let hour = now.getHours();
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  hour = hour ? hour : 12;
  return `${day}/${month}/${year} ${hour}:${minute} ${ampm}`;
};

const mockInterviewSchema = new mongoose.Schema(
  {
    // title: String,
    mockInterviewCode: { type: String, unique: true },

    skills: [
      {
        skill: String,
        experience: String,
        expertise: String,
      },
    ],

    // interviewer: String,
    // duration: String,
    // category: String,
    // instructions: String,
    jobDescription: String,
    Role: String,
    candidateName: String,
    higherQualification: String,
    currentExperience: String,
    // interviewType: String,
    technology: String,
    // interviewType: String, // instant or schedule later
    // status: String,
    rounds: [
      {
        roundTitle: String,
        interviewMode: String,
        interviewerType: String,
        duration: String,
        instructions: String,
        interviewType: String,
        interviewers: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Interviewavailability",
          },
        ],
        status: String,
        dateTime: String,
      },
    ],
    resume: String, //in future we have to work on resume saving functionality
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    ownerId: String,
    tenantId: String,
  },
  { timestamps: true }
);

const MockInterview = mongoose.model("MockInterview", mockInterviewSchema);

module.exports = { MockInterview };
