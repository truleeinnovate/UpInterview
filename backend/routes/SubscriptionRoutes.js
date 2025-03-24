const express = require('express');

const SubscriptionRouter = express.Router();

const {createSubscriptionPlan,getSubscriptionPlan} = require('../controllers/SubscriptionControllers.js');

SubscriptionRouter.post('/subscriptions',createSubscriptionPlan )

SubscriptionRouter.get("/all-subscription-plans",getSubscriptionPlan);

module.exports = SubscriptionRouter;