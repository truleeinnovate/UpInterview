const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');
const loggingService = require('../middleware/loggingService');

// Validate API key (public endpoint for testing) - must come before auth middleware
router.post('/validate', apiKeyController.validateApiKey);

// Routes (authentication is handled globally in index.js)
router
  .route('/')
  .get(apiKeyController.getApiKeys)
  .post(loggingService.integrationLoggingMiddleware, apiKeyController.createApiKey);

router
  .route('/:id')
  .patch(loggingService.integrationLoggingMiddleware, apiKeyController.updateApiKey)
  .delete(apiKeyController.deleteApiKey);

// Get API key statistics
router.get('/:id/stats', apiKeyController.getApiKeyStats);

// Get usage analytics for all API keys
router.get('/analytics', apiKeyController.getUsageAnalytics);

module.exports = router;
