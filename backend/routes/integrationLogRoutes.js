// v1.0.0 - Ashok - changed order of routes because of conflicts
const express = require("express");
const router = express.Router();
const {
  getIntegrationLogs,
  getIntegrationLogById,
  createIntegrationLog,
  deleteIntegrationLog,
  getAllIntegrationLogs, // SUPER ADMIN added by Ashok
  getIntegrationById,
} = require("../controllers/integrationLogController");

// v1.0.0 <------------------------------------------------------------------------------
// SUPER ADMIN added by Ashok ---------------------------------------------
router.get("/", getAllIntegrationLogs);
// -------------------------------------------------------------------------
// v1.0.0 ------------------------------------------------------------------------------>

// Get all integration logs with search and pagination
// router.get("/", getIntegrationLogs);

// Get integration log by ID
// router.get("/:id", getIntegrationLogById);

// Create new integration log
router.post("/", createIntegrationLog);

// Delete integration log
router.delete("/:id", deleteIntegrationLog);

// SUPER ADMIN added by Ashok ---------------------------------------------
// SUPER ADMIN Get integration log by ID added by Ashok
router.get("/:id", getIntegrationById);
// -------------------------------------------------------------------------

module.exports = router;
