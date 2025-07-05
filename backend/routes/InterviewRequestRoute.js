const express = require("express");
const router = express.Router();
const outsourceInterviewRequestController = require("../controllers/InterviewRequestController.js");
// SUPER ADMIN added by Ashok
router.get(
  "/:id",
  outsourceInterviewRequestController.getSingleInterviewRequest
);
router.get("/", outsourceInterviewRequestController.getAllRequests);
router.post("/", outsourceInterviewRequestController.createRequest);
router.patch("/:id", outsourceInterviewRequestController.updateRequestStatus);
//in home page
router.get(
  "/requests",
  outsourceInterviewRequestController.getInterviewRequests
);
router.post(
  "/accept",
  outsourceInterviewRequestController.acceptInterviewRequest
);

module.exports = router;
