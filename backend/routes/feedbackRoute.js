//<----v1.0.0---Venkatesh-----get feedback by tenant ID

const express = require("express");

const {
  createFeedback,
  getFeedbackByRoundId,
  getAllFeedback,
  updateFeedback,
  validateFeedback,
  getFeedbackByContactIdRoundId,
  getCandidateByRoundId,
  getFeedbackRoundId,
  getPendingFeedbacks,
} = require("../controllers/feedbackController.js");
const loggingService = require("../middleware/loggingService");

const router = express.Router();

// Route to validate feedback (for frontend pre-validation)
router.post("/validate/:operation?", validateFeedback);

// Route to create feedback
router.post(
  "/create",
  loggingService.internalLoggingMiddleware,
  createFeedback,
);

// Route to get feedback by round ID (specific route for detailed view)
router.get("/round/:roundId", getFeedbackByRoundId);

// Route to update feedback by ID
router.put("/:id", loggingService.internalLoggingMiddleware, updateFeedback);

// Route to get feedback by tenant ID
// router.get('/:tenantId', getFeedbackByTenantId);//<----v1.0.0---
// router.get('/ownerId/:ownerId', getFeedbackByInterviewerId);//<----v1.0.0---

router.get("/", getAllFeedback); //<----v1.0.0---

router.get("/contact-details", getFeedbackByContactIdRoundId);

router.get("/candidate-details", getCandidateByRoundId);

// get feedback by roundId for scheduler
router.get("/round/:roundId", getFeedbackRoundId);

// get pending feedback
router.get("/pending-feedbacks", getPendingFeedbacks);

module.exports = router;
