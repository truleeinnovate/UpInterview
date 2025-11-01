const mongoose = require('mongoose');
const { generateUniqueId } = require('../services/uniqueIdGeneratorService');

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
});

// Pre-save hook to generate unique outsource request code
OutsourceInterviewerSchema.pre('save', async function (next) {
    try {
        // Only generate code for new documents
        if (!this.isNew || this.outsourceRequestCode) {
            return next();
        }

        if (!this.outsourceRequestCode) {
            try {
                // Generate outsource request code using centralized service
                this.outsourceRequestCode = await generateUniqueId('OINT', mongoose.model('OutsourceInterviewerRequest'), 'outsourceRequestCode');
                console.log(`Generated outsource request code: ${this.outsourceRequestCode}`);
            } catch (error) {
                console.error('Failed to generate unique outsource request code:', error);
                throw new Error('Failed to generate unique outsource request code. Please try again.');
            }
        }
        
        next();
    } catch (error) {
        console.error('Error in OutsourceInterviewerSchema pre-save hook:', error);
        next(error); // Pass error to prevent save
    }
});

// Post-save hook to handle duplicate key errors
OutsourceInterviewerSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
        if (error.keyPattern && error.keyPattern.outsourceRequestCode) {
            // Duplicate outsource request code error
            console.error('Duplicate outsource request code detected:', error.keyValue?.outsourceRequestCode);
            next(new Error('Failed to generate unique outsource request code. Please try again.'));
        } else {
            next(error);
        }
    } else {
        next(error);
    }
});

module.exports = mongoose.model('OutsourceInterviewerRequest', OutsourceInterviewerSchema);
