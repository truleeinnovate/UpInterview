const express = require('express');
const router = express.Router();
const { updateSubscriptionPlan } = require('../controllers/SubscriptionUpdateController');

// Route for updating a subscription plan
router.post('/update-subscription-plan', updateSubscriptionPlan);

module.exports = router;
