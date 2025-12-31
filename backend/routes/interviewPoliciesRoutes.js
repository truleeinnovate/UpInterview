const express = require("express");
const router = express.Router();

const loggingService = require("../middleware/loggingService");
const {
  getSettlementPolicy,
} = require("../controllers/interviewPoliciesController");

// POST /interview-policies/settlement-policy
// Returns the InterviewPolicy row that would be applied for a given scenario
router.post(
  "/settlement-policy",
  loggingService.internalLoggingMiddleware,
  getSettlementPolicy
);

module.exports = router;
