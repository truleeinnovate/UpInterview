const express = require('express');
const {
  createPosition,
  updatePosition,
  saveInterviewRoundPosition,
  getPositionById,
  // updateRounds
} = require('../controllers/positionController.js');
const loggingService = require('../middleware/loggingService.js');

const router = express.Router();

router.post('/', loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, createPosition);
router.patch('/:id',loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, updatePosition);
router.post('/add-rounds',loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, saveInterviewRoundPosition);


// router.get("/:id", updateRounds);

router.get("/details/:id", getPositionById);

module.exports = router;
