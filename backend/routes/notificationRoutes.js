const express = require('express');
const {
  saveNotifications,
  getNotifications,
  getAllNotification
} = require('../controllers/notificationController.js');

const router = express.Router();   

router.post('/', saveNotifications);
router.get('/', getNotifications);
router.get('/all', getAllNotification);

module.exports = router;
