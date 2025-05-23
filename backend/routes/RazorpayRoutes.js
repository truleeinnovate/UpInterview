const express = require('express');
const razorpayRouter = express.Router();
const { 
    createOrder, 
    verifyPayment, 
    verifySubscription, 
    handleWebhook,
    createCustomer,
    getOrCreateSubscriptionPlan,
    createRecurringSubscription
} = require('../controllers/RazorpayController.js');

// Create a Razorpay order or subscription
razorpayRouter.post('/payment/create-order', createOrder);

// Verify Razorpay payment
razorpayRouter.post('/payment/verify', verifyPayment);

// Verify subscription after redirect from Razorpay
razorpayRouter.post('/payment/verify-subscription', verifySubscription);

// Webhook endpoint for Razorpay events
razorpayRouter.post('/payment/webhook', handleWebhook);

// Test mode subscription success endpoint has been removed

module.exports = razorpayRouter;
