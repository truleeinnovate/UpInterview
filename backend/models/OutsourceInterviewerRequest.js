const mongoose = require('mongoose');

const OutsourceInterviewerSchema = new mongoose.Schema({
    interviewerNo: { type: String, unique: true }, // Auto-generated unique number
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users',},
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contacts', required: true },

    status: { type: String, enum: ['new', 'underReview', 'approved', 'rejected', 'suspended'], default: 'new' },

    requestedRate: {
        hourlyRate: { type: Number }
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
    if (this.isNew && !this.interviewerNo) {
        try {
            // Use a separate counter collection to avoid sorting
            const Counter = mongoose.model('Counter');
            const counter = await Counter.findOneAndUpdate(
                { name: 'outsourceInterviewer' },
                { $inc: { seq: 1 } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            this.interviewerNo = `OINT-${counter.seq}`;
        } catch (error) {
            console.error('Error generating interviewer number:', error);
            // Fallback to timestamp if counter fails
            this.interviewerNo = `OINT-${Date.now()}`;
        }
    }
    next();
});

// Define a Counter schema (create this if it doesn't exist)
const CounterSchema = new mongoose.Schema({
    name: String,
    seq: { type: Number, default: 1000 }
});
mongoose.model('Counter', CounterSchema);

module.exports = mongoose.model('OutsourceInterviewerRequest', OutsourceInterviewerSchema);