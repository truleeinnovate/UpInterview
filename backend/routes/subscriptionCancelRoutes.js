const express = require('express');
const router = express.Router();
const { cancelSubscription } = require('../controllers/SubscriptionCancelController');
const loggingService = require('../middleware/loggingService.js');

// Route to cancel a subscription
router.post('/cancel-subscription', loggingService.internalLoggingMiddleware, cancelSubscription);

module.exports = router;
