const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Template routes
router.get('/templates', reportController.getReportTemplates);
router.post('/templates', reportController.createReportTemplate);
router.get('/templates/:id', reportController.getReportTemplateById);

// Filter routes
router.get('/filters/:templateId/:userId', reportController.getUserFilters);
router.post('/filters/:templateId/:userId', reportController.saveUserFilters);

// Report generation route
router.post('/generate/:templateId/:tenantId/:userId', reportController.generateReport);


// Dashboard routes
router.get('/dashboard/:templateId/:tenantId', reportController.getDashboard);
//router.put('/dashboard/:templateId/:tenantId/chart-preferences', reportController.updateChartPreferences);
//router.put('/dashboard/:templateId/:tenantId/layout', reportController.updateDashboardLayout);

// Update widget settings by dashboard ID
router.patch('/dashboard/:dashboardId/widget-settings', reportController.updateWidgetSettingsById);

// Get report data with filters
router.post('/data/:templateId/:tenantId/:userId', reportController.getFilteredReportData);

// Get report data
router.get('/data/:templateId/:tenantId/:userId', reportController.getReport);


module.exports = router;