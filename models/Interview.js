// Interview.js - interviewschema

const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    Candidate: String,
    CandidateId: mongoose.Schema.Types.ObjectId,
    Position: String,
    PositionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Position' },
    Status: String, // draft --> if accept - inprogress - after all rounds selected or rejected
    ScheduleType: String,
    rounds: [
        {
            round: String,
            mode: String,
            duration: String,
            interviewType: String,
            interviewers: [
                {
                    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                    name: String
                }
            ],
            dateTime: String,
            instructions: String,
            Status: String, // draft - if accept - scheduled, if request sent then (request sent)
            questions: [{ questionId: {type: mongoose.Schema.Types.ObjectId ,ref:"InterviewQuestions"} }],
        }
    ],
    candidateImageUrl: String,
    CreatedById: mongoose.Schema.Types.ObjectId,
    LastModifiedById: mongoose.Schema.Types.ObjectId,
    ownerId: mongoose.Schema.Types.ObjectId,
    tenantId: mongoose.Schema.Types.ObjectId,
    createdOn: { type: Date, default: Date.now }
});
const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;