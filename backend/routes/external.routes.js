const express = require('express');
const router = express.Router();
const externalController = require('../controllers/external.controller');
const { verifyApiKey } = require('../middleware/auth.middleware');
const loggingService = require('../middleware/loggingService');

// Apply API key verification to all routes
router.use(verifyApiKey);

// Candidate routes
router.post('/candidates', loggingService.integrationLoggingMiddleware, externalController.createCandidate);
router.post('/candidates/bulk', loggingService.integrationLoggingMiddleware, externalController.bulkCreateCandidates);

// Position routes
router.post('/positions', loggingService.integrationLoggingMiddleware, externalController.createPosition);
router.post('/positions/bulk', loggingService.integrationLoggingMiddleware, externalController.bulkCreatePositions);

module.exports = router;