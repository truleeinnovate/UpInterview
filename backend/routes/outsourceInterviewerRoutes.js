// routes/outsourceInterviewerRoutes.js

const express = require("express");
const router = express.Router();
const outsourceInterviewerController = require("../controllers/outsourceInterviewerController.js");

// SUPER ADMIN
router.get(
  "/all-interviewers",
  outsourceInterviewerController.getAllOutsourceInterviewers
);

router.get("/", outsourceInterviewerController.getAllInterviewers);
router.patch("/", outsourceInterviewerController.updateInterviewerFeedback);

module.exports = router;
