// v1.0.0  -  Ashraf  -  fixed interview template code unique issue
const mongoose = require("mongoose");

// Interview Template Schema
const InterviewTemplateSchema = new mongoose.Schema(
  {
    // <------------------------------- v1.0.0
    interviewTemplateCode: { type: String },
    // ------------------------------ v1.0.0 >
    title: { type: String, required: true }, // Template title
    name: { type: String, required: true }, // Template name
    description: { type: String }, // Template purpose
    bestFor: {
      type: String,
      maxlength: 50,
      //  required: true
    }, // Best for description, max 50 chars
    format: {
      type: String,
      // required: true,
      // enum: ["online", "hybrid", "offline"],
      // default: "online"
    }, // Interview format
    status: {
      type: String,
      enum: ["active", "draft", "inactive", "archived"],
      default: "inactive",
    },
    type: {
      type: String,
      enum: ["custom", "standard"],
      default: "custom",
    },
    rounds: [
      {
        roundTitle: { type: String, required: true }, // e.g., "Technical Round"
        // interviewType: { type: String, required: true }, // Interview type
        assessmentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Assessment",
        },
        // interviewerViewType: { type: String }, // group or individual
        duration: { type: String },
        instructions: { type: String },
        interviewMode: { type: String },
        minimumInterviewers: { type: String },
        selectedInterviewers: [{ type: String }],
        interviewerType: { type: String },
        selectedInterviewersType: { type: String }, // user or group
        // interviewerGroupId: { type: String },
        InterviewerTags: [
          { type: mongoose.Schema.Types.ObjectId, ref: "InterviewerTag" },
        ],
        TeamsIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "MyTeams" }],
        interviewers: [
          { type: mongoose.Schema.Types.ObjectId, ref: "Contacts" },
        ],
        sequence: Number,
        questions: [
          {
            questionId: { type: mongoose.Schema.Types.Mixed, required: true },
            snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
          },
        ],
      },
    ],
    isSaved: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    ownerId: String,
    tenantId: String,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("InterviewTemplate", InterviewTemplateSchema);
