const express = require('express');
const router = express.Router();
const externalController = require('../controllers/external.controller');
const { verifyApiKey } = require('../middleware/auth.middleware');
const loggingService = require('../middleware/loggingService');

// Apply API key verification to all routes
// router.use(verifyApiKey);

// Candidate routes
router.get('/candidates', loggingService.integrationLoggingMiddleware, externalController.getCandidates);
router.post('/candidates', verifyApiKey, loggingService.integrationLoggingMiddleware, externalController.createCandidate);
router.post('/candidates/bulk', verifyApiKey, loggingService.integrationLoggingMiddleware, externalController.bulkCreateCandidates);

// Position routes
router.get('/positions', loggingService.integrationLoggingMiddleware, externalController.getPositions);
router.post('/positions', verifyApiKey, loggingService.integrationLoggingMiddleware, externalController.createPosition);
router.post('/positions/bulk', verifyApiKey, loggingService.integrationLoggingMiddleware, externalController.bulkCreatePositions);

module.exports = router;