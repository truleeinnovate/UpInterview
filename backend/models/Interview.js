
const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' }, // Reference Candidate Schema
    positionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Position' }, // Reference Position Schema
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewTemplate' },
    status: String, // draft --> if accept - inprogress - after all rounds selected or rejected
    scheduleType: String,
    createdById: mongoose.Schema.Types.ObjectId,
    lastModifiedById: mongoose.Schema.Types.ObjectId,
    ownerId: mongoose.Schema.Types.ObjectId,
    tenantId: mongoose.Schema.Types.ObjectId,
    completionReason: String,
    
    // createdOn: { type: Date, default: Date.now },
    // teamId:String
}, { timestamps: true });

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = {Interview};