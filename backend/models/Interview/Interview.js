// v1.0.0  -  Ashraf  -  fixed interview code unique issue


const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' }, // Reference Candidate Schema
    positionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Position' }, // Reference Position Schema
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewTemplate' },
    // status: String, // draft --> if accept - inprogress - after all rounds selected or rejected
    status: {
        type: String,
        enum: ['Draft', 'InProgress', 'Completed', 'Cancelled'],
        default: 'Draft'
    },
    scheduleType: String,
    ownerId:   mongoose.Schema.Types.ObjectId,
    tenantId: mongoose.Schema.Types.ObjectId,

    //   ownerId:   {type: mongoose.Schema.Types.ObjectId, ref: 'Users'},
    // tenantId: {type: mongoose.Schema.Types.ObjectId, ref: 'tenant'},
    completionReason: String,
    // <------------------------------- v1.0.0
    interviewCode: { type: String, unique: true, sparse: true }, // <-- it will store INT-00001, INT-00002 with unique constraint -->
    // ------------------------------ v1.0.0 >
    externalId: { type: String, sparse: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
}, { timestamps: true });

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = { Interview };
