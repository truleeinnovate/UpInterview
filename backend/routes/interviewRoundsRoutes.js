const express = require("express");
const {
  updateInterviewRoundStatus,
} = require("../controllers/interviewRoundsController");
const router = express.Router();
// const { getAllInterviewRounds } = require('../controllers/interviewRoundsController.js');

// router.get('/', getAllInterviewRounds);

// Update interview round status
router.patch("/:roundId/status", updateInterviewRoundStatus);

module.exports = router;
