const mongoose = require('mongoose');

const OutsourceInterviewerSchema = new mongoose.Schema({
    outsourceRequestCode: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contacts', required: true },

    // status: { type: String, enum: ["New",
    //     "Under Review",
    //     "Approved",
    //     "Rejected",
    //     "Suspended",], default: 'New' },

    status: {
        type: String,
        enum: ["new", "underReview", "approved", "rejected", "suspended"],
        default: "new",
    },

    requestedRate: {
        junior: {
            usd: { type: Number, default: 0 },
            inr: { type: Number, default: 0 },
            isVisible: { type: Boolean, default: false }
        },
        mid: {
            usd: { type: Number, default: 0 },
            inr: { type: Number, default: 0 },
            isVisible: { type: Boolean, default: false }
        },
        senior: {
            usd: { type: Number, default: 0 },
            inr: { type: Number, default: 0 },
            isVisible: { type: Boolean, default: false }
        }
    },
    finalRate: { type: Number, default: 0 }, // Final agreed rate per hour
    currency: { type: String, default: 'INR' }, // Currency code (e.g., USD, EUR)

    feedback: [{
        givenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        comments: { type: String },
        createdAt: { type: Date, default: Date.now }
    }],

    contractSigned: { type: Boolean, default: false }, // NDA/Contract agreement status
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' }, // Who added the interviewer
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });



module.exports = mongoose.model('OutsourceInterviewerRequest', OutsourceInterviewerSchema);
