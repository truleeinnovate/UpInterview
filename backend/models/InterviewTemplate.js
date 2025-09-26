// v1.0.0  -  Ashraf  -  fixed interview template code unique issue
const mongoose = require("mongoose");

// Interview Template Schema
const InterviewTemplateSchema = new mongoose.Schema(
  {
    // <------------------------------- v1.0.0 
    interviewTemplateCode: { type: String },
    // ------------------------------ v1.0.0 >
    templateName: { type: String, required: true }, // Template title
    name: { type: String, required: true }, // Template name
    description: { type: String }, // Template purpose
    status: {
      type: String,
      enum: ["active", "draft", "inactive", "archived"],
      default: "inactive",
    },
    rounds: [
      {
        roundTitle: { type: String, required: true }, // e.g., "Technical Round"
        // interviewType: { type: String, required: true }, // Interview type
        // assessmentTemplate: [{
        //     assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
        //     assessmentName: { type: String, required: true }
        // }],
        assessmentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Assessment",
        }, // Changed to String and made optional
        // assessmentQuestions: [{
        //     sectionName: { type: String },
        //     questionId: { type: String },
        //     snapshot: [{ type: mongoose.Schema.Types.Mixed, required: true }]
        // }],
        interviewerViewType: { type: String }, // group or individual
        duration: { type: String }, // Changed to String and made optional
        instructions: { type: String }, // Special notes for the round
        interviewMode: { type: String }, // Made optional
        minimumInterviewers: { type: String }, // Changed to String and made optional
        selectedInterviewers: [{ type: String }], // Made array items optional
        interviewerType: { type: String }, // Made optional
        selectedInterviewersType: { type: String }, // user or group
        interviewerViewType: { type: String },  // 
        interviewerGroupName: { type: String }, // group name
        // interviewerGroupId: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewerGroup' },
        //   internalInterviewers: [
        //         mongoose.Schema.Types.ObjectId,
        //       ],
        interviewers: [
          { type: mongoose.Schema.Types.ObjectId, ref: "Contacts" },
        ],
        // interviewers: [{
        //     interviewerId: { type: mongoose.Schema.Types.Mixed, required: true },
        //     interviewerName: { type: String, required: true }
        // }],
        sequence: Number,
        //   interviewers: [
        // mongoose.Schema.Types.ObjectId,
        //     //    type: mongoose.Schema.Types.Mixed, required: true ,
        //     // interviewerName: { type: String, required: true }
        // ],
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
  }
);

module.exports = mongoose.model("InterviewTemplate", InterviewTemplateSchema);
