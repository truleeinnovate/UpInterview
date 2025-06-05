// SUPER ADMIN

const express = require("express");
const InternalLogRouter = express.Router();

const { getLogsSummary } = require("../controllers/internalLogController");

InternalLogRouter.get("/", getLogsSummary);

module.exports = InternalLogRouter;
