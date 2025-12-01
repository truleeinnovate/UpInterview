const express = require('express');
const router = express.Router();
const integrationController = require('../controllers/integrationController');
const loggingService = require('../middleware/loggingService');

// Import existing middleware
const { authContextMiddleware } = require('../middleware/authContext');
const { permissionMiddleware } = require('../middleware/permissionMiddleware');

// Apply auth and permission middleware to all routes except webhook
router.use(authContextMiddleware);
router.use(permissionMiddleware);

// Routes
router
  .route('/')
  .get(integrationController.getIntegrations)
  .post(loggingService.integrationLoggingMiddleware, integrationController.createIntegration);

router
  .route('/:id')
  .put(loggingService.integrationLoggingMiddleware, integrationController.updateIntegration)
  .delete(integrationController.deleteIntegration);

// Make authenticated API call
router.post(
  '/:id/call',
  loggingService.integrationLoggingMiddleware,
  integrationController.makeApiCall
);

// Webhook endpoint (public, but protected by signature verification)
router.post(
  '/webhook/:id',
  // Skip auth middleware for webhooks
  (req, res, next) => {
    req.skipAuth = true;
    next();
  },
  express.json(),
  loggingService.integrationLoggingMiddleware,
  integrationController.handleWebhook
);

// Export the router
module.exports = router;
