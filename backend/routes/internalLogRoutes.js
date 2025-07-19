// v1.0.0 - Ashok - commented for testing purpose and changed order
const express = require("express");
const router = express.Router();
const {
  createLog,
  getLogs,
  getLogById,
  deleteLog,
  getLogsSummary, // SUPER ADMIN added by Ashok
} = require("../controllers/internalLogController");

// v1.0.0 <------------------------------------------------------------------------
// router.get("/", getLogs); // Get all logs
// SUPER ADMIN  added by Ashok --------------------------------------------
router.get("/", getLogsSummary);
// ------------------------------------------------------------------------
// v1.0.0 <------------------------------------------------------------------------
router.get("/:id", getLogById); // Get log by ID
router.post("/", createLog); // Create new log with middleware
router.delete("/:id", deleteLog); // Delete log by ID
module.exports = router;
