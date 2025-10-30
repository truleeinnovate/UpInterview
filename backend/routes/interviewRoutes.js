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
  updateInterview,
  updateInterviewRound,
  updateInterviewStatus,
  checkInternalInterviewUsage,
  deleteInterview,
} = require("../controllers/interviewController");

// post call interview create routes
router.post("/", createInterview);

// patch call for interview update routes
router.patch("/:id", updateInterview);

// Interview Status Update
router.patch('/status/:interviewId/:status', updateInterviewStatus);

//  interview delete routes
router.delete('/delete-interview/:id', deleteInterview);

//  interview Rounds post APi's routes
router.post("/save-round", saveInterviewRound);

//  interview round update routes
router.patch("/update-round/:roundId", updateInterviewRound);

//  interview round delete routes
router.delete("/delete-round/:id", deleteRound);

// Route to fetch dashboard statistics routes
router.get("/dashboard-stats", getDashboardStats);

// Check internal interview usage
router.get('/check-usage', checkInternalInterviewUsage);

//  interview get all routes SUPER ADMIN pages added by ASHOK
router.get("/all-interviews", getInterviews); // SUPER ADMIN Added by Ashok
router.get("/interviews", getAllInterviews);
router.get("/interview-rounds", getAllInterviewRounds); // SUPER ADMIN - All interview rounds with details


module.exports = router;
