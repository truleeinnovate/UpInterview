const mongoose = require('mongoose');

const dayAvailabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    required: true,
  },
  timeSlots: [{
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
  }],
});

const interviewAvailabilitySchema = new mongoose.Schema({
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contacts',
    required: true,
    unique: true, // Ensure one document per contact
  },
  availability: [dayAvailabilitySchema],
}, { timestamps: true });

// Add a method to update availability
interviewAvailabilitySchema.statics.updateOrCreate = async function(contactId, availabilityData) {
  // Remove empty time slots and days with no time slots
  const cleanedAvailability = availabilityData
    .map(dayData => ({
      day: dayData.day,
      timeSlots: dayData.timeSlots.filter(slot => 
        slot.startTime && slot.endTime && slot.startTime !== 'unavailable'
      )
    }))
    .filter(dayData => dayData.timeSlots.length > 0);

  // Find and update or create the document
  return this.findOneAndUpdate(
    { contact: contactId },
    { 
      $set: { 
        availability: cleanedAvailability 
      } 
    },
    { 
      new: true, 
      upsert: true,
      setDefaultsOnInsert: true
    }
  );
};

module.exports = mongoose.model('InterviewAvailability', interviewAvailabilitySchema);