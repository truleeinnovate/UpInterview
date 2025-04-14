const mongoose = require("mongoose")

const teamOtpSchema = new mongoose.Schema({
    teamId:{type:mongoose.Schema.Types.ObjectId,ref:"testTeam"},
    candidateId:{type:mongoose.Schema.Types.ObjectId,ref:"Candidate"},
    otp:String,
    expiresAt: {
        type: Date,
        required: true,
      }
})


module.exports = mongoose.model("teamOtp",teamOtpSchema)