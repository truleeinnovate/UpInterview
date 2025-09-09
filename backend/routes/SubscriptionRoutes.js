const express = require('express');

const router = express.Router();

const {
  createSubscriptionPlan,
  getSubscriptionPlan,
  getSubscriptionPlanById,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
} = require('../controllers/SubscriptionControllers.js');

// Create
router.post('/subscriptions', createSubscriptionPlan);

// Read
router.get('/all-subscription-plans', getSubscriptionPlan);
router.get('/subscriptions/:id', getSubscriptionPlanById);

// Update
router.put('/subscription-plan-update/:id', updateSubscriptionPlan);

// Delete
router.delete('/subscription-plan-delete/:id', deleteSubscriptionPlan);

module.exports = router;