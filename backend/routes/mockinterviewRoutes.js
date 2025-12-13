// routes/mockInterviewRoutes.js
const express = require("express");
const router = express.Router();
const mockInterviewController = require("../controllers/mockInterviewController");
const loggingService = require("../middleware/loggingService");

// GET: Single mock interview with rounds by id
router.get(
  "/mockinterview/:id",
  mockInterviewController.getMockInterviewDetails
);

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

router.patch(
  "/mockinterview/:mockInterviewId/round/:roundId/cancel",
  // loggingService.internalLoggingMiddleware,
  // loggingService.FeedsMiddleware,
  mockInterviewController.deleteMockInterview
);

module.exports = router;
