// routes/analytics.js
const express = require("express");
const router = express.Router();
const { getReportTemplates,generateReport,createCategory,createTemplate } = require("../../controllers/AnalyticsController/analyticsController");
router.get("/templates", getReportTemplates);
router.get("/generate/:templateId", generateReport);

// Create category
router.post("/report-category", createCategory);

// Create template
router.post("/report-template", createTemplate);

module.exports = router;