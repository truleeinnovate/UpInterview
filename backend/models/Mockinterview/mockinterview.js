// v1.0.0  -  Ashraf  -  fixed mock interview code unique issue
const mongoose = require("mongoose");
const mockInterviewSchema = new mongoose.Schema(
  {
    // title: String,
    // <------------------------------- v1.0.0 
    mockInterviewCode: { type: String },
    // ------------------------------ v1.0.0 >
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
    // rounds: [
    //   {
    //     roundTitle: String,
    //     interviewMode: String,
    //     interviewerType: String,
    //     duration: String,
    //     instructions: String,
    //     interviewType: String,
    //     // assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },
    //     meetingId: String,
    //     interviewers: [
    //       {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "Contacts",
    //       },
    //     ],
    //     status: String,
    //     dateTime: String,
    //   },
    // ],
    resume: {
      // Added by Ashok
      filename: String,
      path: String,
      contentType: String,
      publicId: String,
      fileSize: Number,
      uploadDate: Date,
    }, //in future we have to work on resume saving functionality
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    ownerId: String,
    tenantId: String,
  },
  { timestamps: true }
);

const MockInterview =
  mongoose.models.MockInterview ||
  mongoose.model("MockInterview", mockInterviewSchema);

module.exports = { MockInterview };
