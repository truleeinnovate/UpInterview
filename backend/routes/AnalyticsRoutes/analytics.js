// routes/analytics.js
const express = require("express");
const router = express.Router();
const { getReportTemplates,generateReport,saveFilterPreset,saveColumnConfig,createCategory,createTemplate } = require("../../controllers/AnalyticsController/analyticsController");
router.get("/templates", getReportTemplates);
router.get("/generate/:templateId", generateReport);
router.post("/presets/filter/:templateId", saveFilterPreset);
router.post("/presets/column/:templateId", saveColumnConfig);

// Create category
router.post("/report-category", createCategory);

// Create template
router.post("/report-template", createTemplate);

module.exports = router;