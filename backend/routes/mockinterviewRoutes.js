// routes/mockInterviewRoutes.js
const express = require("express");
const router = express.Router();
const mockInterviewController = require("../controllers/mockInterviewController");
const loggingService = require("../middleware/loggingService");

// GET: Single mock interview with rounds by id
router.get("/:id", mockInterviewController.getMockInterviewDetails);

// POST: Create mock interview
router.post(
  "/create",
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
//create and update round
router.post(
  "/:mockInterviewId/round",
  loggingService.internalLoggingMiddleware,
  loggingService.FeedsMiddleware,
  mockInterviewController.createMockInterviewRound
); // Create round
router.patch(
  "/:mockInterviewId/round/:roundId",
  loggingService.internalLoggingMiddleware,
  loggingService.FeedsMiddleware,
  mockInterviewController.updateMockInterviewRound
); // Update round

// POST: Validate mock interview data (for frontend validation)
router.post("/validate/:page?", mockInterviewController.validateMockInterview);

router.patch(
  "/:mockInterviewId/round/:roundId/status",
  // loggingService.internalLoggingMiddleware,
  // loggingService.FeedsMiddleware,
  mockInterviewController.updateInterviewRoundStatus
);

module.exports = router;
