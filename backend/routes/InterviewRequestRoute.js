const express = require("express");
const router = express.Router();
const outsourceInterviewRequestController = require("../controllers/InterviewRequestController.js");
const loggingService = require('../middleware/loggingService.js');

//in home page
router.get("/requests", outsourceInterviewRequestController.getInterviewRequests);

router.get("/", outsourceInterviewRequestController.getAllRequests);
router.post("/", loggingService.internalLoggingMiddleware, outsourceInterviewRequestController.createRequest);
router.patch("/:id", loggingService.internalLoggingMiddleware, outsourceInterviewRequestController.updateRequestStatus);

// SUPER ADMIN added by Ashok
router.get("/:id", outsourceInterviewRequestController.getSingleInterviewRequest);

router.post(
  "/accept",
  loggingService.internalLoggingMiddleware,
  outsourceInterviewRequestController.acceptInterviewRequest
);

module.exports = router;
