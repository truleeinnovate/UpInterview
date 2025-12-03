// routes/analytics.js
const express = require("express");
const router = express.Router();
const { getReportTemplates,generateReport,saveFilterPreset,saveColumnConfig,getReportAccess,shareReport,createCategory,createTemplate } = require("../../controllers/AnalyticsController/analyticsController");
router.get("/templates", getReportTemplates);
router.get("/generate/:templateId", generateReport);
router.post("/presets/filter/:templateId", saveFilterPreset);
router.post("/presets/column/:templateId", saveColumnConfig);
// sharing report apis
router.get("/reports/:templateId/access", getReportAccess);
router.post("/reports/:templateId/share", shareReport);


// Create category
router.post("/report-category", createCategory);

// Create template
router.post("/report-template", createTemplate);

module.exports = router;