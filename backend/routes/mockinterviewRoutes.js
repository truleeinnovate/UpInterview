// routes/mockInterviewRoutes.js
const express = require("express");
const router = express.Router();
const mockInterviewController = require("../controllers/mockInterviewController");
const loggingService = require("../middleware/loggingService");

// POST: Create mock interview
router.post(
  "/mockinterview",
  loggingService.internalLoggingMiddleware,
  loggingService.FeedsMiddleware,
  mockInterviewController.createMockInterview
);

// PATCH: Update mock interview
router.patch(
  "/updateMockInterview/:id",
  loggingService.internalLoggingMiddleware,
  loggingService.FeedsMiddleware,
  mockInterviewController.updateMockInterview
);

// POST: Validate mock interview data (for frontend validation)
router.post(
  "/mockinterview/validate/:page?",
  mockInterviewController.validateMockInterview
);

module.exports = router;
