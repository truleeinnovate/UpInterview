const mongoose = require('mongoose');

const OutsourceInterviewRequestSchema = new mongoose.Schema({
    tenantId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Organization'
    },
    ownerId: { 
        type: String
    },
    scheduledInterviewId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Interview'
    },
    interviewerType: {
        type:String
    },
    // interviewerIds: [{ 
    //     type: mongoose.Schema.Types.ObjectId, 
    //     // ref: 'Contacts'
    // }],
    interviewerIds: [{
        _id: false,
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Contacts' },
        status: { type: String, enum: ['inprogress', 'accepted', 'declined'], default: 'inprogress' }
    }], 
    dateTime: { 
        type: String 
    },
    duration: { 
        type: String 
    },
    candidateId: { 
        type: String,
        ref : 'Candidate'
    },
    positionId: {
        type: String,
        ref: 'Position'
    },
    status: { 
        type: String, 
        enum: ['inprogress', 'accepted', 'declined', 'expired', 'cancelled'], 
        default: 'inprogress'
    },
    roundNumber: {
        type: String,
    },
    requestMessage: { 
        type: String 
    },
    requestedAt: { 
        type: Date, 
        default: Date.now 
    },
    respondedAt: {
        type: Date 
    },
    expiryDateTime: { 
        type: Date
    },
}, { timestamps: true });

module.exports = mongoose.model('OutsourceInterviewRequest', OutsourceInterviewRequestSchema);
