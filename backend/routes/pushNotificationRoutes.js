const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/pushNotificationController');

// Get all notifications for a user
router.get('/push-notifications/:ownerId', notificationController.getNotifications);

// Create a new notification
router.post('/push-notifications', notificationController.createNotification);

// Mark a notification as read
router.patch('/push-notifications/:id/read', notificationController.markAsRead);

// Mark all notifications as read for a user
router.patch('/push-notifications/:ownerId/read-all', notificationController.markAllAsRead);

// Clear all notifications for a user
router.delete('/push-notifications/:ownerId', notificationController.clearAllNotifications);

module.exports = router;
