const PushNotification = require('../models/PushNotifications');

// Get all notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const ownerId = req.params.ownerId;
    const notifications = await PushNotification.find({ ownerId })
      .sort({ updatedAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const notification = new PushNotification(req.body);
    const savedNotification = await notification.save();
    res.status(201).json(savedNotification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await PushNotification.findByIdAndUpdate(
      req.params.id,
      { unread: false },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all notifications as read for a user
exports.markAllAsRead = async (req, res) => {
  try {
    const ownerId = req.params.ownerId;
    await PushNotification.updateMany(
      { ownerId, unread: true },
      { unread: false }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete all notifications for a user
exports.clearAllNotifications = async (req, res) => {
  try {
    const ownerId = req.params.ownerId;
    await PushNotification.deleteMany({ ownerId });
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
