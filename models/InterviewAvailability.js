// const mongoose = require('mongoose');

// const timeSlotSchema = new mongoose.Schema({
//     startTime: { type: String, required: true }, // Expecting strings in HH:MM format
//     endTime: { type: String, required: true }
// }, { _id: false });

// const AvailabilitySchema = new mongoose.Schema({
//     day: { type: String, required: true },
//     timeSlots: [timeSlotSchema],
//     contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contacts', required: true }
// });

// const LoginAvailability = mongoose.model('LoginAvailability', AvailabilitySchema);
// module.exports = LoginAvailability;



const mongoose = require('mongoose');

// Define the time slot schema with Date type for start and end times
const timeSlotSchema = new mongoose.Schema({
    startTime: { type: Date, required: true }, // Expecting Date objects for precise time handling
    endTime: { type: Date, required: true }
}, { _id: false });

// Define the day schema with an array of time slots
const daySchema = new mongoose.Schema({
    day: { type: String, required: true }, // Day of the week (e.g., "Monday", "Tuesday")
    timeSlots: [timeSlotSchema] // Array of time slots for each day
}, { _id: false });

// Define the main availability schema
const availabilitySchema = new mongoose.Schema({
    contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contacts', required: true }, // Reference to the Contact model
    days: [daySchema] // Array of days with time slots
});

// Create the Availability model
const LoginAvailability = mongoose.model('Interviewavailability', availabilitySchema);
module.exports = LoginAvailability;