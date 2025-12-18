const express = require('express');

const router = express.Router();

const {
  createSubscriptionPlan,
  getSubscriptionPlan,
  getSubscriptionPlanById,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
} = require('../controllers/SubscriptionControllers.js');
const loggingService = require('../middleware/loggingService');

// Create
router.post(
  '/subscriptions',
  loggingService.internalLoggingMiddleware,
  createSubscriptionPlan
);

// Read
router.get('/all-subscription-plans', getSubscriptionPlan);
router.get('/subscriptions/:id', getSubscriptionPlanById);

// Update
router.put(
	'/subscription-plan-update/:id',
	loggingService.internalLoggingMiddleware,
	updateSubscriptionPlan
);

// Delete
router.delete('/subscription-plan-delete/:id', deleteSubscriptionPlan);

module.exports = router;