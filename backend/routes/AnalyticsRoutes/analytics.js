// routes/analytics.js
const express = require("express");
const router = express.Router();
const { getReportTemplates,generateReport,saveFilterPreset,getReportUsageStats,saveColumnConfig,getAllReportAccess,shareReport,createCategory,createTemplate } = require("../../controllers/AnalyticsController/analyticsController");
router.get("/templates", getReportTemplates);
router.get("/generate/:templateId", generateReport);
router.post("/presets/filter/:templateId", saveFilterPreset);
router.post("/presets/column/:templateId", saveColumnConfig);
// sharing report apis
router.get("/reports/access", getAllReportAccess);
router.post("/reports/:templateId/share", shareReport);
//report usage
router.get('/reports/usage', getReportUsageStats);

// Create category
router.post("/report-category", createCategory);

// Create template
router.post("/report-template", createTemplate);

module.exports = router;