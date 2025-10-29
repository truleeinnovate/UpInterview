// v1.0.0  -  Ashraf  -  fixed position code unique issue
const mongoose = require("mongoose");

const roundSchema = new mongoose.Schema(
  {
    sequence: Number,
    roundTitle: String,
    interviewMode: String,
    interviewerType: String, // internal or external
    duration: Number,
    instructions: String,
    // interviewerGroupName: { type: String },
    interviewerGroupId: { type: String },


    interviewerViewType: { type: String },
    selectedInterviewersType: { type: String },
    interviewers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Contacts" },
      // mongoose.Schema.Types.ObjectId,
    ],

    // interviewers: {type: String}, // mansoor : added this for accepting the numbers and texts.
    //  status: String, // draft - if accept - scheduled, if request sent then (request sent)
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },
    questions: [
      {
        questionId: { type: mongoose.Schema.Types.Mixed, required: true },
        snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
      },
    ],
  },
  {
    timestamps: true, // ⏱️ Automatically adds createdAt and updatedAt
  }
);

const positionSchema = new mongoose.Schema(
  {
    // <------------------------------- v1.0.0 
    positionCode: { type: String },
    // ------------------------------ v1.0.0 >
    title: String,
    companyname: String,
    jobDescription: String,
    minexperience: Number,
    maxexperience: Number,
      templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewTemplate' },
    skills: [
      {
        skill: String,
        experience: String,
        expertise: String,
      },
    ],
    additionalNotes: String,
    rounds: [roundSchema],
    roundsModified: { type: Boolean, default: false },
    // ownerId: String,
    // tenantId: String,
    // added new feilds ranjith from here
    minSalary: String,
    maxSalary: String,
    // EmployementType:String,
    NoofPositions: Number,
    status: {type:String,enum:["draft","opened","closed","hold","cancelled"], default:"draft"},
    Location: String,
    // workMode:String,

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    tenantId:  { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
  },
  { timestamps: true }
);

const Position =
  mongoose.models.Position || mongoose.model("Position", positionSchema);

module.exports = { Position };
