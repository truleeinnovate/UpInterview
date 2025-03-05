const mongoose = require("mongoose");

const positionSchema = new mongoose.Schema({
  title: String,
  companyname: String,
  jobDescription: String,
  minexperience: Number,
  maxexperience: Number,
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
      roundName: String,
      interviewMode: String,
      interviewType: String,
      duration: String,
      instructions: String,
      selectedTemplete: String,
    }
  ],
  CreatedBy: String,
  LastModifiedById: String,
  ownerId: String,
  tenantId: String,
  createdDate: { type: Date, default: Date.now },
});


const Position = mongoose.model("Position", positionSchema);

module.exports = { Position };