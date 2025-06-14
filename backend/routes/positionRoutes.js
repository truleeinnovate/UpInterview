const express = require('express');
const {
  createPosition,
  updatePosition,
  saveInterviewRoundPosition,
  deleteRound
  // getPositionById,
  // updateRounds
} = require('../controllers/positionController.js');
const loggingService = require('../middleware/loggingService.js');

const router = express.Router();

router.post('/', loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, createPosition);
router.patch('/:id',loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, updatePosition);
router.post('/add-rounds',loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, saveInterviewRoundPosition);

// Delete a specific round
router.delete('/delete-round/:roundId', loggingService.internalLoggingMiddleware, loggingService.FeedsMiddleware, deleteRound);

// router.get("/:id", updateRounds);

// router.get("/details/:id", getPositionById);

module.exports = router;
