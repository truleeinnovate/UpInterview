const express = require("express");
const router = express.Router();
const {
  getIntegrationLogs,
  getIntegrationLogById,
  createIntegrationLog,
  deleteIntegrationLog,
  getAllIntegrationLogs,
  getIntegrationById,
} = require("../controllers/integrationLogController");

// Get all integration logs with search and pagination
router.get("/", getIntegrationLogs);

// SUPER ADMIN added by Ashok
// Get all integration logs without search and pagination
router.get("/all", getAllIntegrationLogs);

// Get integration log by ID
// router.get("/:id", getIntegrationLogById);

// SUPER ADMIN Get integration log by ID added by Ashok
router.get("/:integrationId", getIntegrationLogById);

// Create new integration log
router.post("/", createIntegrationLog);

// Delete integration log
router.delete("/:id", deleteIntegrationLog);

module.exports = router;
