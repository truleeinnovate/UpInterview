const express = require('express');
const router = express.Router();
const { cancelSubscription } = require('../controllers/SubscriptionCancelController');

// Route to cancel a subscription
router.post('/cancel-subscription', cancelSubscription);

module.exports = router;
