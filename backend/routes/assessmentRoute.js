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
  createList,
  getAssessmentById,
  // getLists,
} = require("../controllers/assessmentController");

const router = express.Router();

// Validation endpoint for step-wise validation
router.post("/validate/:tab", validateAssessmentStep);

router.post("/new-assessment", newAssessment);

router.patch("/update/:id", updateAssessment);

// SUPER ADMIN added by Ashok ----------------------------------------->
// Place static route BEFORE param routes so '/all-assessments' is not
// incorrectly treated as an :id and passed to getAssessmentById.
router.get("/all-assessments", getAllAssessments);
// -------------------------------------------------------------------->

router.get("/:assessmentId/candidates", getAssignedCandidates);

// above code is created by sashak now we have changes assesment logic so wee need to check wich one is working or not
// from here this is new code created by ashraf
router.get("/:assessmentId/results", getAssessmentResults);
router.get("/:id", getAssessmentById);

router.post("/create-list", createList);
// router.get("/lists", getLists);

// Delete assessment
router.delete("/:id", deleteAssessment);

router.get("/");

module.exports = router;
