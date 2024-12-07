const mongoose = require('mongoose');

const AssessmentCandidateSchema = new mongoose.Schema({
    CandidateName: [String],
    CreatedDate: {
        type: Date,
        default: Date.now
    },
    CreatedBy: String,
    ModifiedDate: Date,
    ModifiedBy: String,
});
AssessmentCandidateSchema.pre('save', function(next) {
    if (this.isNew) {
        this.CreatedDate = Date.now();
    }
    next();
});

  const AssessmentCandidate = mongoose.model("AssessmentCandidate", AssessmentCandidateSchema);
  module.exports =AssessmentCandidate;