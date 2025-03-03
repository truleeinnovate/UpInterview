const mongoose = require('mongoose');

const CandidatePositionSchema = new mongoose.Schema({
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
    positionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Position' },
    interviewId : { type: mongoose.Schema.Types.ObjectId, ref: 'Interview'},
    status: {
        type: String,
        enum: ['applied', 'screening', 'interview_scheduled', 'interview_completed', 'hired', 'rejected', 'withdrawn'],
        default: 'applied'
    },
    applicationDate: { type: Date, default: Date.now },
    interviewRound: { type: Number, default: 0 },
    interviewFeedback: { type: String, default: "" },
    offerDetails: { type: String, default: "" },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CandidatePosition', CandidatePositionSchema);