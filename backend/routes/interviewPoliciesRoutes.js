// v1.0.0 - Ashok - removed logs middleware for get calls

const express = require("express");
const router = express.Router();

const loggingService = require("../middleware/loggingService");
const {
  getSettlementPolicy,
  createInterviewPolicy,
  getAllPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
} = require("../controllers/interviewPoliciesController");

// POST /interview-policies/settlement-policy
// Returns the InterviewPolicy row that would be applied for a given scenario
router.post(
  "/settlement-policy",
  // loggingService.internalLoggingMiddleware,
  getSettlementPolicy
);

router.post(
  "/create-policy",
  loggingService.internalLoggingMiddleware,
  createInterviewPolicy
);

router.get("/", getAllPolicies);

router.get("/:id", getPolicyById);

router.put("/:id", loggingService.internalLoggingMiddleware, updatePolicy);

router.delete("/:id", loggingService.internalLoggingMiddleware, deletePolicy);

module.exports = router;
