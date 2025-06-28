const InterviewAvailability = require('../models/InterviewAvailability.js');
const { Contacts } = require('../models/Contacts.js');

const createOrUpdateInterviewAvailability = async (req, res) => {
    const { contact, days } = req.body;
    try {
        let availabilityDoc = await InterviewAvailability.findOne({ contact });
        if (!availabilityDoc) {
            availabilityDoc = new InterviewAvailability({ contact, days });
        } else {
            days.forEach(updatedDay => {
                const existingDay = availabilityDoc.days.find(day => day.day === updatedDay.day);
                if (existingDay) {
                    existingDay.timeSlots = updatedDay.timeSlots;
                } else {
                    availabilityDoc.days.push(updatedDay);
                }
            });
        }

        const savedAvailability = await availabilityDoc.save();
        await Contacts.findByIdAndUpdate(contact, { $push: { availability: savedAvailability._id } });

        res.status(201).json(savedAvailability);
    } catch (err) {
        console.error("Error saving availability:", err);
        res.status(400).json({ message: err.message });
    }
};

const updateInterviewAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { days } = req.body;

        const updatedAvailability = await InterviewAvailability.findByIdAndUpdate(
            id,
            { days },
            { new: true, runValidators: true }
        );

        if (!updatedAvailability) {
            return res.status(404).json({ message: "Availability not found" });
        }

        res.status(200).json(updatedAvailability);
    } catch (error) {
        console.error("Error updating availability:", error.message);
        res.status(500).json({ message: "Error updating availability", error: error.message });
    }
};


// ========================================================================================
// for getting availability by contact id to show in the account settings user profile
// ========================================================================================
// In interviewAvailabilityController.js
const getAvailabilityByContactId = async (req, res) => {

    try {
      const { contactId } = req.params;

      const availability = await InterviewAvailability.findOne({ contact: contactId });

      if (!availability) {
        return res.status(200).json({
          availability: [], // Return empty array instead of 404
          message: 'No availability found for this contact'
        });
      }

      res.status(200).json(availability);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

// At the bottom of the file, update the exports to:
module.exports = { 
    createOrUpdateInterviewAvailability, 
    updateInterviewAvailability, 
    getAvailabilityByContactId 
  };