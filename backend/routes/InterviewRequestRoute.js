const express = require("express");
const router = express.Router();
const outsourceInterviewRequestController = require("../controllers/InterviewRequestController.js");

//in home page
router.get("/requests", outsourceInterviewRequestController.getInterviewRequests);

router.get("/", outsourceInterviewRequestController.getAllRequests);
router.post("/", outsourceInterviewRequestController.createRequest);
router.patch("/:id", outsourceInterviewRequestController.updateRequestStatus);

// SUPER ADMIN added by Ashok
router.get("/:id", outsourceInterviewRequestController.getSingleInterviewRequest);

router.post(
  "/accept",
  outsourceInterviewRequestController.acceptInterviewRequest
);

module.exports = router;
