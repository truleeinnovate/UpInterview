// interviewroutes.js

const express = require("express");
const router = express.Router();
const {
  createInterview,
  saveInterviewRound,
  getDashboardStats,
  deleteRound,
  getInterviews,
  getAllInterviews,
  getAllInterviewRounds, // Added new function
  getInterviewRoundTransaction, // Added transaction fetch function
  updateInterview,
  updateInterviewRound,
  updateInterviewStatus,
  checkInternalInterviewUsage,
  deleteInterview,
} = require("../controllers/interviewController");

 //  post call for interview page
router.post("/", createInterview);

//  Ranjith added patch call for interview update
router.patch("/:id", updateInterview);

// router.patch('/:id', updateInterview);
router.post("/save-round", saveInterviewRound);

//  interview round update
router.patch("/update-round/:roundId", updateInterviewRound);

// Route to fetch dashboard statistics
router.get("/dashboard-stats", getDashboardStats);

router.delete("/delete-round/:id", deleteRound);
router.get("/all-interviews", getInterviews); // SUPER ADMIN Added by Ashok
// v1.0.0 <-------------------------------------------------------------
router.get("/interviews", getAllInterviews);
router.get("/interview-rounds", getAllInterviewRounds); // SUPER ADMIN - All interview rounds with details
router.get("/interview-rounds/:roundId/transaction", getInterviewRoundTransaction); // Get transaction data for specific round
// v1.0.0 ------------------------------------------------------------->


// Interview Status Update
router.patch('/status/:interviewId/:status', updateInterviewStatus);

// Check internal interview usage
router.get('/check-usage', checkInternalInterviewUsage);

router.delete('/delete-interview/:id', deleteInterview);

module.exports = router;
