const express = require('express');
const router = express.Router();
const {
    manualRenewalCheck,
    getSubscriptionRenewalStatus
} = require('../controllers/SubscriptionRenewalController');
const { permissionMiddleware } = require('../middleware/permissionMiddleware');

// Manual trigger for testing (admin only)
router.post('/check', permissionMiddleware, manualRenewalCheck);

// Get renewal status for a specific subscription
router.get('/status/:subscriptionId', permissionMiddleware, getSubscriptionRenewalStatus);

module.exports = router;
