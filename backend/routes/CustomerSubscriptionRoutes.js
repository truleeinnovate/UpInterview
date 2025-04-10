const express = require('express');
const router = express.Router();
const { createSubscriptionControllers,updateCustomerSubscriptionControllers,getAllCustomerSubscription, getBasedTentIdCustomerSubscription } = require('../controllers/CustomerSubscriptionControllers.js');

router.post('/create-customer-subscription', createSubscriptionControllers);

router.post("/update-customer-subscription",updateCustomerSubscriptionControllers);

router.get('/get-CustomerSubscription',getAllCustomerSubscription);

router.get("/subscriptions/:ownerId",getBasedTentIdCustomerSubscription)

module.exports = router;