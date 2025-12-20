const express = require('express');
const {
  createCandidatePosition,
  getAllCandidatePositions,
  getCandidatePositionsByCandidateId,
} = require('../controllers/candidatePositionController.js');
const loggingService = require('../middleware/loggingService');

const router = express.Router();

router.get('/', getAllCandidatePositions);
router.post('/', loggingService.internalLoggingMiddleware, createCandidatePosition);

// Get candidate positions for a specific candidate
router.get('/candidate/:candidateId', getCandidatePositionsByCandidateId);

module.exports = router;