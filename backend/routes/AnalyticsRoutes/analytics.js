// routes/analytics.js
const express = require("express");
const router = express.Router();
const { permissionMiddleware } = require("../../middleware/permissionMiddleware");
const { authContextMiddleware } = require("../../middleware/authContext");
const { getReportTemplates, generateReport, saveFilterPreset, getReportUsageStats, saveColumnConfig, getAllReportAccess, shareReport, createCategory, createTemplate } = require("../../controllers/AnalyticsController/analyticsController");
router.get("/templates", authContextMiddleware, getReportTemplates);
router.get("/generate/:templateId", permissionMiddleware, authContextMiddleware, generateReport);
router.post("/presets/filter/:templateId", authContextMiddleware, saveFilterPreset);
router.post("/presets/column/:templateId", authContextMiddleware, saveColumnConfig);
// sharing report apis
router.get("/reports/access", authContextMiddleware, getAllReportAccess);
router.post("/reports/:templateId/share", authContextMiddleware, shareReport);
//report usage
router.get('/reports/usage', authContextMiddleware, getReportUsageStats);

// Create category
router.post("/report-category", createCategory);

// Create template
router.post("/report-template", createTemplate);

module.exports = router;