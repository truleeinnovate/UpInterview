// SUPER ADMIN added by Ashok

const express = require("express");
const InternalLogRouter = express.Router();

const {
  createLog,
  deleteLog,
  getLogsSummary,
  getLogById,
} = require("../controllers/internalLogController");

InternalLogRouter.get("/", getLogsSummary);
InternalLogRouter.get("/:id", getLogById);

module.exports = InternalLogRouter;
