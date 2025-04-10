const express = require('express');

const router = express.Router();

const {createSubscriptionPlan,getSubscriptionPlan} = require('../controllers/SubscriptionControllers.js');

router.post('/subscriptions',createSubscriptionPlan )

router.get("/all-subscription-plans",getSubscriptionPlan);

module.exports = router;