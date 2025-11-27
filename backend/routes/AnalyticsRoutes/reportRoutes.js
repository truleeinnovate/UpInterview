// const express = require('express');
// const router = express.Router();
// const {
//   getReportTemplates,
//   getReportTemplate,
//   createReportTemplate,
//   updateReportTemplate,
//   deleteReportTemplate,
//   getDashboardConfig,
//   saveDashboardConfig,
//   getTrendsConfig,
//   saveTrendsConfig,
//   getSavedQueries,
//   saveQuery
// } = require('../../controllers/AnalyticsController/reportController');

// const { tenantMiddleware, userPermissionMiddleware } = require('../../middleware/tenantMiddleware');

// // Apply tenant middleware to all routes
// router.use(tenantMiddleware);

// // =============================================================================
// // REPORT TEMPLATE ROUTES
// // =============================================================================

// // GET /api/reports/templates - Get all report templates
// router.get('/templates', 
//   userPermissionMiddleware('reports', 'read'),
//   getReportTemplates
// );

// // GET /api/reports/templates/:templateId - Get specific report template
// router.get('/templates/:templateId', 
//   userPermissionMiddleware('reports', 'read'),
//   getReportTemplate
// );

// // POST /api/reports/templates - Create new report template
// router.post('/templates', 
//   userPermissionMiddleware('reports', 'create'),
//   createReportTemplate
// );

// // PUT /api/reports/templates/:templateId - Update report template
// router.put('/templates/:templateId', 
//   userPermissionMiddleware('reports', 'update'),
//   updateReportTemplate
// );

// // DELETE /api/reports/templates/:templateId - Delete report template
// router.delete('/templates/:templateId', 
//   userPermissionMiddleware('reports', 'delete'),
//   deleteReportTemplate
// );

// // =============================================================================
// // DASHBOARD CONFIGURATION ROUTES
// // =============================================================================

// // GET /api/reports/dashboard/config - Get user's dashboard configuration
// router.get('/dashboard/config', 
//   userPermissionMiddleware('dashboard', 'read'),
//   getDashboardConfig
// );

// // POST /api/reports/dashboard/config - Save user's dashboard configuration
// router.post('/dashboard/config', 
//   userPermissionMiddleware('dashboard', 'update'),
//   saveDashboardConfig
// );

// // PUT /api/reports/dashboard/config - Update user's dashboard configuration
// router.put('/dashboard/config', 
//   userPermissionMiddleware('dashboard', 'update'),
//   saveDashboardConfig
// );

// // =============================================================================
// // TRENDS CONFIGURATION ROUTES
// // =============================================================================

// // GET /api/reports/trends/config - Get user's trends configuration
// router.get('/trends/config', 
//   userPermissionMiddleware('dashboard', 'read'),
//   getTrendsConfig
// );

// // POST /api/reports/trends/config - Save user's trends configuration
// router.post('/trends/config', 
//   userPermissionMiddleware('dashboard', 'update'),
//   saveTrendsConfig
// );

// // PUT /api/reports/trends/config - Update user's trends configuration
// router.put('/trends/config', 
//   userPermissionMiddleware('dashboard', 'update'),
//   saveTrendsConfig
// );

// // =============================================================================
// // SAVED QUERIES ROUTES
// // =============================================================================

// // GET /api/reports/queries - Get user's saved queries
// router.get('/queries', 
//   userPermissionMiddleware('reports', 'read'),
//   getSavedQueries
// );

// // POST /api/reports/queries - Save a new query
// router.post('/queries', 
//   userPermissionMiddleware('reports', 'create'),
//   saveQuery
// );

// // =============================================================================
// // UTILITY ROUTES
// // =============================================================================

// // POST /api/reports/columns/save - Save column configuration
// router.post('/columns/save', 
//   userPermissionMiddleware('reports', 'update'),
//   async (req, res) => {
//     try {
//       const { reportType, columns, userId } = req.body;
      
//       // Save column configuration to user preferences or report template
//       const columnConfig = {
//         tenantId: req.tenantId,
//         userId: userId || req.currentUser.userId,
//         reportType,
//         columns: columns.map((col, index) => ({
//           ...col,
//           order: index
//         })),
//         updatedAt: new Date()
//       };
      
//       // In a real implementation, you'd save this to a ColumnConfiguration collection
//       // For now, we'll return success
//       res.json({
//         success: true,
//         message: 'Column configuration saved successfully',
//         data: columnConfig
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         error: 'Failed to save column configuration',
//         message: error.message
//       });
//     }
//   }
// );

// // GET /api/reports/columns/:reportType - Get column configuration
// router.get('/columns/:reportType', 
//   userPermissionMiddleware('reports', 'read'),
//   async (req, res) => {
//     try {
//       const { reportType } = req.params;
      
//       // In a real implementation, you'd fetch from ColumnConfiguration collection
//       // For now, return default columns
//       const defaultColumns = {
//         interview: [
//           { key: 'id', label: 'Interview ID', visible: true, width: 'auto', order: 0, type: 'text' },
//           { key: 'candidateName', label: 'Candidate', visible: true, width: 'auto', order: 1, type: 'text' },
//           { key: 'interviewerName', label: 'Interviewer', visible: true, width: 'auto', order: 2, type: 'text' },
//           { key: 'position', label: 'Position', visible: true, width: 'auto', order: 3, type: 'text' },
//           { key: 'date', label: 'Date', visible: true, width: 'auto', order: 4, type: 'date' },
//           { key: 'status', label: 'Status', visible: true, width: 'auto', order: 5, type: 'select' },
//           { key: 'score', label: 'Score', visible: true, width: 'auto', order: 6, type: 'number' }
//         ],
//         interviewer: [
//           { key: 'name', label: 'Name', visible: true, width: 'auto', order: 0, type: 'text' },
//           { key: 'type', label: 'Type', visible: true, width: 'auto', order: 1, type: 'select' },
//           { key: 'specialization', label: 'Specialization', visible: true, width: 'auto', order: 2, type: 'text' },
//           { key: 'totalInterviews', label: 'Total Interviews', visible: true, width: 'auto', order: 3, type: 'number' },
//           { key: 'rating', label: 'Rating', visible: true, width: 'auto', order: 4, type: 'number' }
//         ]
//       };
      
//       res.json({
//         success: true,
//         data: {
//           reportType,
//           columns: defaultColumns[reportType] || []
//         }
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         error: 'Failed to fetch column configuration',
//         message: error.message
//       });
//     }
//   }
// );

// // POST /api/reports/export - Export report data
// router.post('/export', 
//   userPermissionMiddleware('reports', 'export'),
//   async (req, res) => {
//     try {
//       const { format, data, templateId } = req.body;
      
//       // This would integrate with your export service
//       // For now, return a placeholder response
//       res.json({
//         success: true,
//         message: `${format.toUpperCase()} export initiated`,
//         exportId: `EXP_${Date.now()}`,
//         downloadUrl: `/api/reports/download/EXP_${Date.now()}`
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         error: 'Export failed',
//         message: error.message
//       });
//     }
//   }
// );

// // GET /api/reports/download/:exportId - Download exported report
// router.get('/download/:exportId', 
//   userPermissionMiddleware('reports', 'read'),
//   async (req, res) => {
//     try {
//       const { exportId } = req.params;
      
//       // This would serve the actual file
//       // For now, return a placeholder
//       res.json({
//         success: true,
//         message: 'File download would start here',
//         exportId
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         error: 'Download failed',
//         message: error.message
//       });
//     }
//   }
// );

// module.exports = router;