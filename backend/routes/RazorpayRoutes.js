const express = require('express');
const razorpayRouter = express.Router();
const { 
    verifyPayment, 
    //verifySubscription, 
    handleWebhook,
    createRecurringSubscription
} = require('../controllers/RazorpayController.js');

// Import the subscription cancellation controller
const { cancelSubscription } = require('../controllers/SubscriptionCancelController.js');

// Create a Razorpay subscription (recurring payment)
razorpayRouter.post('/payment/create-subscription', createRecurringSubscription);

// Verify Razorpay payment
razorpayRouter.post('/payment/verify', verifyPayment);

// Verify subscription after redirect from Razorpay
//razorpayRouter.post('/payment/verify-subscription', verifySubscription);

// Webhook endpoint for Razorpay events
razorpayRouter.post('/payment-webhook', handleWebhook);

// Cancel subscription endpoint
razorpayRouter.post('/cancel-subscription', cancelSubscription);

// Test mode subscription success endpoint has been removed

module.exports = razorpayRouter;
