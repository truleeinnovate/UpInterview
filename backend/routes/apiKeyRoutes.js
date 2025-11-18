const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');
const { authContextMiddleware } = require('../middleware/authContext.js');

// Apply authentication to all routes except validation endpoint
router.use(authContextMiddleware);

// Routes
router
  .route('/')
  .get(apiKeyController.getApiKeys)
  .post(apiKeyController.createApiKey);

router
  .route('/:id')
  .patch(apiKeyController.updateApiKey)
  .delete(apiKeyController.deleteApiKey);

// Get API key statistics
router.get('/:id/stats', apiKeyController.getApiKeyStats);

// Validate API key (public endpoint for testing)
router.post('/validate', apiKeyController.validateApiKey);

// Get usage analytics for all API keys
router.get('/analytics', apiKeyController.getUsageAnalytics);

module.exports = router;
