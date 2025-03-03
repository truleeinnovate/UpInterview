const Notifications = require('../models/notification');

const saveNotifications = async (req) => {  // Declare function first
  try {
    const { notifications } = req.body;

    if (!notifications || notifications.length === 0) {
      console.warn("No notifications to save.");
      return;
    }

    await Notifications.insertMany(notifications);
    console.log("Notifications saved successfully.");
  } catch (error) {
    console.error("Error saving notifications:", error);
  }
};

// Get notifications 
const getNotifications = async (req, res) => {
  try {
    const { objectId, category, candidateId } = req.query; // Get objectId, category, and candidateId from query params

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    let filter = {};

    if (category === "assessment" || category === "interview") {
      if (!objectId) {
        return res.status(400).json({ message: "Object ID is required for this category" });
      }
      filter = { "object.objectId": objectId };
    } else if (category === "candidate") {
      if (!candidateId) {
        return res.status(400).json({ message: "Candidate ID is required for this category" });
      }
      filter = { recipientId: candidateId };
    } else {
      return res.status(400).json({ message: "Invalid category" });
    }

    console.log("Filter:", filter);

    const notifications = await Notifications.find(filter);
    res.json(notifications);
    console.log("Fetched notifications:", notifications);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ✅ Properly exporting functions
module.exports = {
  saveNotifications,
  getNotifications,
};
