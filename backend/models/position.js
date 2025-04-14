const mongoose = require("mongoose");

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
  rounds: [
    {
       sequence: Number,
       roundTitle: String,
       interviewMode: String,
       interviewerType: String, // internal or external
       duration: String,
       instructions: String,
       interviewers: [
           { type: mongoose.Schema.Types.ObjectId, ref: 'Contacts' }
       ],
      //  status: String, // draft - if accept - scheduled, if request sent then (request sent)
       assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },
             questions: [{
                               questionId: { type: mongoose.Schema.Types.Mixed, required: true },
                               snapshot: { type: mongoose.Schema.Types.Mixed, required: true }
                           }],
    }
  ],
  CreatedBy: String,
  LastModifiedById: String,
  ownerId: String,
  tenantId: String,
  createdDate: { type: Date, default: Date.now },
   // added new feilds ranjith from here

   minSalary:String,
   maxSalary:String,
   // EmployementType:String,
   NoofPositions:Number,
   Location:String,
   // workMode:String,
   
   // added new feilds ranjith to here
});


const Position = mongoose.model("Position", positionSchema);

module.exports = { Position };