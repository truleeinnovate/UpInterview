const express = require("express");
const router = express.Router();
const {
  createLog,
  getLogs,
  getLogById,
  deleteLog,
  getLogsSummary, // SUPER ADMIN added by Ashok
} = require("../controllers/internalLogController");
// Internal log routes
router.get("/", getLogs); // Get all logs
router.get("/:id", getLogById); // Get log by ID
router.post("/", createLog); // Create new log with middleware
router.delete("/:id", deleteLog); // Delete log by ID

// SUPER ADMIN  added by Ashok --------------------------------------------
router.get("/", getLogsSummary);
// -------------------------------------------------------
module.exports = router;
