const express = require('express');
const router = express.Router();
const { updateSubscriptionPlan } = require('../controllers/SubscriptionUpdateController');
const loggingService = require('../middleware/loggingService.js');


// Route for updating a subscription plan
router.post('/update-subscription-plan', loggingService.internalLoggingMiddleware, updateSubscriptionPlan);

module.exports = router;
