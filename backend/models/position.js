const mongoose = require("mongoose");

const roundSchema = new mongoose.Schema(
  {


    sequence: Number,
    roundTitle: String,
    interviewMode: String,
    interviewerType: String, // internal or external
    duration: String,
    instructions: String,
    selectedInterviewersType: { type: String },
    // interviewers: [
    //   mongoose.Schema.Types.ObjectId,
    // ],
    interviewers: [mongoose.Schema.Types.Mixed], // mansoor : added this for accepting the numbers and texts.
    //  status: String, // draft - if accept - scheduled, if request sent then (request sent)
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },
    questions: [{
      questionId: { type: mongoose.Schema.Types.Mixed, required: true },
      snapshot: { type: mongoose.Schema.Types.Mixed, required: true }
    }],

  },
  {
    timestamps: true // ⏱️ Automatically adds createdAt and updatedAt
  }
);


const positionSchema = new mongoose.Schema({
  title: String,
  companyname: String,
  jobDescription: String,
  minexperience: Number,
  maxexperience: Number,
  selectedTemplete: String,
  skills: [
    {
      skill: String,
      experience: String,
      expertise: String,
    },
  ],
  additionalNotes: String,

  rounds: [roundSchema],
  ownerId: String,
  tenantId: String,
  // added new feilds ranjith from here
  minSalary: String,
  maxSalary: String,
  // EmployementType:String,
  NoofPositions: Number,
  Location: String,
  // workMode:String,

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  ownerId: String,
  tenantId: String,
}, { timestamps: true });


const Position = mongoose.model("Position", positionSchema);

module.exports = { Position };