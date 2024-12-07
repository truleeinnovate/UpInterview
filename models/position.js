const mongoose = require("mongoose");

const positionSchema = new mongoose.Schema({
  title: String,
  companyname: String,
  jobdescription: String,
  minexperience: Number,
  maxexperience: Number,
  skills: [
    {
      skill: String,
      experience: String,
      expertise: String,
    },
  ],
  additionalnotes: String,
  rounds: [{
    round: String,
    customRoundName: { type: String, select: false },
    mode: String,
    duration: String,
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TeamMember' }]
  }],
  CreatedBy: String,
  LastModifiedById: String,
  OwnerId: String,
  orgId: String,
  createdDate: { type: Date, default: Date.now },
});

const positionHistorySchema = new mongoose.Schema({
  positionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Position' },
  title: String,
  companyname: String,
  jobdescription: String,
  minexperience: Number,
  maxexperience: Number,
  skills: [
    {
      skill: String,
      experience: String,
      expertise: String,
    },
  ],
  additionalnotes: String,
  rounds: [{
    round: String,
    customRoundName: { type: String, select: false },
    mode: String,
    duration: String,
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TeamMember' }]
  }],
  CreatedBy: String,
  LastModifiedById: String,
  OwnerId: String,
  orgId: String,
  ModifiedDate: { type: Date, default: Date.now },
  ModifiedBy: String,
});

const Position = mongoose.model("Position", positionSchema);
const PositionHistory = mongoose.model("PositionHistory", positionHistorySchema);

module.exports = { Position, PositionHistory };