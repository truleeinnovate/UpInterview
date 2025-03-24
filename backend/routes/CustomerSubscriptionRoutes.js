
const express = require('express');
const CustomerSubscriptionRouter = express.Router();
const { createSubscriptionControllers,updateCustomerSubscriptionControllers,getAllCustomerSubscription, getBasedTentIdCustomerSubscription } = require('../controllers/CustomerSubscriptionControllers.js');

CustomerSubscriptionRouter.post('/create-customer-subscription', createSubscriptionControllers);

CustomerSubscriptionRouter.post("/update-customer-subscription",updateCustomerSubscriptionControllers);

CustomerSubscriptionRouter.get('/get-CustomerSubscription',getAllCustomerSubscription);

CustomerSubscriptionRouter.get("/subscriptions/:ownerId",getBasedTentIdCustomerSubscription)

module.exports =CustomerSubscriptionRouter;