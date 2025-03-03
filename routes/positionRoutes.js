const express = require('express');
const {
  createPosition,
  updatePosition,
  // updateRounds
} = require('../controllers/positionController');
const loggingService = require('../middlewares/loggingService');

const router = express.Router();

router.post('/', loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, createPosition);
router.patch('/:id',loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, updatePosition);
// router.patch("/:id", updateRounds);

module.exports = router;
