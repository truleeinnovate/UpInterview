const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');

// Import middleware
const { authContextMiddleware } = require('../middleware/authContext');
const { permissionMiddleware } = require('../middleware/permissionMiddleware');

// Apply authentication and permission middleware to all routes
router.use(authContextMiddleware);
router.use(permissionMiddleware);

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

module.exports = router;
