const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
}, { _id: false });

const teamAvailabilitySchema = new mongoose.Schema({
    TeamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    Availability: [timeSlotSchema]
});

const TeamAvailability = mongoose.model('TeamAvailability', teamAvailabilitySchema);
module.exports = TeamAvailability;
