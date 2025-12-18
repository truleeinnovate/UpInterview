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
  getInterviewDataforOrg,
} = require("../controllers/interviewController");

const loggingService = require("../middleware/loggingService");

// post call interview create routes
router.post(
  "/",
  loggingService.internalLoggingMiddleware,
  createInterview
);

// patch call for interview update routes
router.patch(
  "/:id",
  loggingService.internalLoggingMiddleware,
  updateInterview
);

// Interview Status Update
router.patch(
  "/status/:interviewId/:status",
  loggingService.internalLoggingMiddleware,
  updateInterviewStatus
);

//  interview delete routes
router.delete("/delete-interview/:id", deleteInterview);

//  interview Rounds post APi's routes
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

//  interview round delete routes
router.delete("/delete-round/:id", deleteRound);

// Route to fetch dashboard statistics routes
router.get("/dashboard-stats", getDashboardStats);

// to get indidual interveiw & interview rounds data for org
router.get("/interview-details/:interviewId", getInterviewDataforOrg);

// Check internal interview usage
router.get("/check-usage", checkInternalInterviewUsage);

//  interview get all routes SUPER ADMIN pages added by ASHOK
router.get("/all-interviews", getInterviews); // SUPER ADMIN Added by Ashok
router.get("/interviews", getAllInterviews);
router.get("/interview-rounds", getAllInterviewRounds); // SUPER ADMIN - All interview rounds with details
router.get("/interview-rounds/:id/transaction", getInterviewRoundTransaction);

module.exports = router;
