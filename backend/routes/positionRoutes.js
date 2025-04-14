const express = require('express');
const {
  createPosition,
  updatePosition,
  saveInterviewRoundPosition,
  // updateRounds
} = require('../controllers/positionController.js');
const loggingService = require('../middlewares/loggingService');

const router = express.Router();

router.post('/', loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, createPosition);
router.patch('/:id',loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, updatePosition);
router.post('/add-rounds',loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, saveInterviewRoundPosition);


// router.patch("/:id", updateRounds);

module.exports = router;
