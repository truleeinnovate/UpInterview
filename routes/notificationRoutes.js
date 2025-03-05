const express = require('express');
const {
  saveNotifications,
  getNotifications,
} = require('../controllers/notificationController');

const router = express.Router();   

router.post('/', saveNotifications);
router.get('/', getNotifications);

module.exports = router;
