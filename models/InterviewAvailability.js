const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema(
    {
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
    },
    { _id: false }
);

const daySchema = new mongoose.Schema(
    {
        day: { type: String, required: true },
        timeSlots: [timeSlotSchema],
    },
    { _id: false }
);

const availabilitySchema = new mongoose.Schema({
    contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contacts', required: true },
    days: [daySchema],
});

module.exports = mongoose.model('Interviewavailability', availabilitySchema);