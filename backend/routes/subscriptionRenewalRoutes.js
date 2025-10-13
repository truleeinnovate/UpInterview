const express = require('express');
const router = express.Router();
const {
    getSubscriptionRenewalStatus
} = require('../controllers/SubscriptionRenewalController');
const { permissionMiddleware } = require('../middleware/permissionMiddleware');

// Get renewal status for a specific subscription
// This is read-only - actual renewal is handled by Razorpay webhook
router.get('/status/:subscriptionId', permissionMiddleware, getSubscriptionRenewalStatus);

// NOTE: No manual renewal endpoints - everything is handled automatically by Razorpay

module.exports = router;
