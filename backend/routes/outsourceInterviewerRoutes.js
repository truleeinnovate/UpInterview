// routes/outsourceInterviewerRoutes.js

const express = require("express");
const router = express.Router();
const outsourceInterviewerController = require("../controllers/outsourceInterviewerController.js");

router.get("/", outsourceInterviewerController.getAllInterviewers); 
router.patch("/", outsourceInterviewerController.updateInterviewerFeedback);

// SUPER ADMIN added Ashok -------------------------------------------------->
router.get(
  "/all-interviews",
  outsourceInterviewerController.getAllOutsourceInterviewers
);
// router.get(
//   "/:id",
//   outsourceInterviewerController.getSingleOutsourceInterviewer
// );
// -------------------------------------------------------------------------->

//in individual home to show status of outsource request

router.get("/status", outsourceInterviewerController.getOutsourceStatus);

module.exports = router;
