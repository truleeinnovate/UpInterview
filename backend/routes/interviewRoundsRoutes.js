const express = require("express");
const {
  saveInterviewRound,
  updateInterviewRound,
  updateInterviewRoundStatus,
  getValdiateRoundStatus,
  fetchAndSaveRecording,
} = require("../controllers/interviewRoundsController");
const router = express.Router();
const loggingService = require("../middleware/loggingService");



router.post(
  "/save-round",
  loggingService.internalLoggingMiddleware,
  saveInterviewRound
);

//  interview round update routes
router.patch(
  "/update-round/:roundId",
  loggingService.internalLoggingMiddleware,
  updateInterviewRound
);

router.post("/validate-status-change", getValdiateRoundStatus);

// Update interview round status
router.patch("/:roundId/status", updateInterviewRoundStatus);

// Fetch and save recording URL from VideoSDK
router.get("/:roundId/recording", fetchAndSaveRecording);

module.exports = router;
