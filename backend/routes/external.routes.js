const express = require('express');
const router = express.Router();
const externalController = require('../controllers/external.controller');
const { verifyApiKey } = require('../middleware/auth.middleware');

// Apply API key verification to all routes
router.use(verifyApiKey);

// Candidate routes
router.post('/candidates', externalController.createCandidate);
router.post('/candidates/bulk', externalController.bulkCreateCandidates);

// Position routes
router.post('/positions', externalController.createPosition);
router.post('/positions/bulk', externalController.bulkCreatePositions);

module.exports = router;