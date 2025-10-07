const mongoose = require("mongoose");
const express = require("express");
const {
  newAssessment,
  updateAssessment,
  validateAssessmentStep,
  getAssessmentResults,
  getAssignedCandidates,
  shareAssessment,
  resendAssessmentLink,
  getAllAssessments,
  deleteAssessment,
} = require("../controllers/assessmentController");

const router = express.Router();

// Validation endpoint for step-wise validation
router.post("/validate/:tab", validateAssessmentStep);

router.post("/new-assessment", newAssessment);

router.patch("/update/:id", updateAssessment);

// above code is created by sashak now we have changes assesment logic so wee need to check wich one is working or not
// from here this is new code created by ashraf
router.get("/:assessmentId/results", getAssessmentResults);

// SUPER ADMIN added by Ashok ----------------------------------------->
router.get("/all-assessments", getAllAssessments);
// -------------------------------------------------------------------->

// Delete assessment
router.delete("/:id", deleteAssessment);

module.exports = router;
