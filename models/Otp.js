const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
scheduledAssessmentId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"ScheduledAssessment"},
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Candidate',
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const Otp = mongoose.model('Otp', otpSchema);
module.exports = Otp;
