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
} = require("../controllers/interviewController");

// router.get('/', getAllInterviews);
// router.get('/:id',getInterviewBasedOnInterviewId)
router.post("/", createInterview);
// router.patch('/:id', updateInterview);
router.post("/save-round", saveInterviewRound);

// Route to fetch dashboard statistics
router.get("/dashboard-stats", getDashboardStats);

router.delete("/delete-round/:id", deleteRound);
router.get("/all-interviews", getInterviews); // SUPER ADMIN Added by Ashok
// v1.0.0 <-------------------------------------------------------------
router.get("/interviews", getAllInterviews);
// v1.0.0 ------------------------------------------------------------->

module.exports = router;
