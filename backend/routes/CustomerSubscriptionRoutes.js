const express = require('express');
const router = express.Router();
const { createSubscriptionControllers,updateCustomerSubscriptionControllers,getAllCustomerSubscription, getBasedTentIdCustomerSubscription } = require('../controllers/CustomerSubscriptionControllers.js');
const loggingService = require('../middleware/loggingService.js');

router.post('/create-customer-subscription',loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, createSubscriptionControllers);

router.post("/update-customer-subscription",loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware,updateCustomerSubscriptionControllers);

router.get('/get-CustomerSubscription',getAllCustomerSubscription);

router.get("/subscription-plans/user/:ownerId",getBasedTentIdCustomerSubscription)

module.exports = router;