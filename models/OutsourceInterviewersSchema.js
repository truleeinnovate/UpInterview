const mongoose = require('mongoose');

const OutsourceInterviewerSchema = new mongoose.Schema({
    interviewerNo: { type: String, unique: true }, // Auto-generated unique number
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users',},
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contacts', required: true },

    status: { type: String, enum: ['new', 'contacted', 'inprogress', 'active', 'inactive', 'blacklisted'], default: 'new' },

    requestedRate: {
        hourlyRate: { type: Number, required: true }
    },
    finalRate: { type: Number }, // Final agreed rate per hour
    currency: { type: String, default: 'USD' }, // Currency code (e.g., USD, EUR)

    feedback: [{
        givenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        comments: { type: String },
        createdAt: { type: Date, default: Date.now }
    }],

    contractSigned: { type: Boolean, default: false }, // NDA/Contract agreement status
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users'}, // Who added the interviewer
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Auto-generate a unique interviewer number before saving
OutsourceInterviewerSchema.pre('save', async function (next) {
    if (!this.interviewerNo) {
        // Generate a sequential unique number (e.g., OINT-1001, OINT-1002, ...)
        const lastRecord = await mongoose.model('OutsourceInterviewer').findOne().sort({ createdAt: -1 });
        const lastNumber = lastRecord?.interviewerNo ? parseInt(lastRecord.interviewerNo.split('-')[1]) : 1000;
        this.interviewerNo = `OINT-${lastNumber + 1}`;
    }
    next();
});

module.exports = mongoose.model('OutsourceInterviewer', OutsourceInterviewerSchema);