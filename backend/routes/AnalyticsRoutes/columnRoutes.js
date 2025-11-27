// const express = require('express');
// const router = express.Router();
// const {
//   getColumnConfiguration,
//   saveColumnConfiguration,
//   resetColumnConfiguration,
//   getDashboardLayout,
//   saveDashboardLayout
// } = require('../../controllers/AnalyticsController/columnController');

// const { tenantMiddleware, userPermissionMiddleware } = require('../../middleware/tenantMiddleware');

// // Apply tenant middleware to all routes
// router.use(tenantMiddleware);

// // =============================================================================
// // COLUMN CONFIGURATION ROUTES
// // =============================================================================

// // GET /api/columns/:reportType - Get column configuration for report type
// router.get('/:reportType',
//   userPermissionMiddleware('reports', 'read'),
//   getColumnConfiguration
// );

// // POST /api/columns/save - Save column configuration
// router.post('/save',
//   userPermissionMiddleware('reports', 'update'),
//   saveColumnConfiguration
// );

// // DELETE /api/columns/:reportType/reset - Reset column configuration to default
// router.delete('/:reportType/reset',
//   userPermissionMiddleware('reports', 'update'),
//   resetColumnConfiguration
// );

// // =============================================================================
// // DASHBOARD LAYOUT ROUTES
// // =============================================================================

// // GET /api/columns/dashboard/layout - Get dashboard layout
// router.get('/dashboard/layout',
//   userPermissionMiddleware('dashboard', 'read'),
//   getDashboardLayout
// );

// // POST /api/columns/dashboard/layout - Save dashboard layout
// router.post('/dashboard/layout',
//   userPermissionMiddleware('dashboard', 'update'),
//   saveDashboardLayout
// );

// // =============================================================================
// // AVAILABLE COLUMNS ROUTES
// // =============================================================================

// // GET /api/columns/available/:reportType - Get available columns for report type
// router.get('/available/:reportType',
//   userPermissionMiddleware('reports', 'read'),
//   async (req, res) => {
//     try {
//       const { reportType } = req.params;

//       const availableColumns = {
//         interview: [
//           { key: 'id', label: 'ID', type: 'text', description: 'Unique interview identifier' },
//           { key: 'candidateName', label: 'Candidate Name', type: 'text', description: 'Name of the candidate' },
//           { key: 'interviewerName', label: 'Interviewer Name', type: 'text', description: 'Name of the interviewer' },
//           { key: 'position', label: 'Position', type: 'text', description: 'Job position being interviewed for' },
//           { key: 'date', label: 'Interview Date', type: 'date', description: 'Date of the interview' },
//           { key: 'time', label: 'Interview Time', type: 'text', description: 'Time of the interview' },
//           { key: 'duration', label: 'Duration', type: 'number', description: 'Interview duration in minutes' },
//           { key: 'status', label: 'Status', type: 'select', description: 'Current interview status' },
//           { key: 'score', label: 'Score', type: 'number', description: 'Interview score out of 10' },
//           { key: 'rating', label: 'Rating', type: 'number', description: 'Interview rating out of 5' },
//           { key: 'interviewerType', label: 'Interviewer Type', type: 'select', description: 'Internal or external interviewer' },
//           { key: 'feedback', label: 'Feedback', type: 'text', description: 'Interview feedback' },
//           { key: 'billable', label: 'Billable', type: 'boolean', description: 'Whether interview is billable' },
//           { key: 'noShow', label: 'No Show', type: 'boolean', description: 'Whether candidate showed up' },
//           { key: 'cycleTime', label: 'Cycle Time', type: 'number', description: 'Days from application to interview' },
//           { key: 'createdAt', label: 'Created Date', type: 'date', description: 'When record was created' },
//           { key: 'updatedAt', label: 'Updated Date', type: 'date', description: 'Last modification date' }
//         ],
//         interviewer: [
//           { key: 'name', label: 'Name', type: 'text', description: 'Interviewer name' },
//           { key: 'type', label: 'Type', type: 'select', description: 'Internal or external' },
//           { key: 'specialization', label: 'Specialization', type: 'text', description: 'Area of expertise' },
//           { key: 'skills', label: 'Skills', type: 'array', description: 'Technical skills' },
//           { key: 'rating', label: 'Rating', type: 'number', description: 'Average rating' },
//           { key: 'totalInterviews', label: 'Total Interviews', type: 'number', description: 'Number of interviews conducted' },
//           { key: 'availability', label: 'Availability', type: 'select', description: 'Current availability status' },
//           { key: 'email', label: 'Email', type: 'text', description: 'Contact email' },
//           { key: 'phone', label: 'Phone', type: 'text', description: 'Contact phone number' },
//           { key: 'location', label: 'Location', type: 'text', description: 'Geographic location' },
//           { key: 'hourlyRate', label: 'Hourly Rate', type: 'number', description: 'Billing rate for external interviewers' },
//           { key: 'createdAt', label: 'Created Date', type: 'date', description: 'When record was created' }
//         ],
//         assessment: [
//           { key: 'candidateName', label: 'Candidate Name', type: 'text', description: 'Name of the candidate' },
//           { key: 'type', label: 'Assessment Type', type: 'text', description: 'Type of assessment' },
//           { key: 'status', label: 'Status', type: 'select', description: 'Assessment status' },
//           { key: 'score', label: 'Score', type: 'number', description: 'Assessment score' },
//           { key: 'maxScore', label: 'Max Score', type: 'number', description: 'Maximum possible score' },
//           { key: 'percentage', label: 'Percentage', type: 'number', description: 'Score as percentage' },
//           { key: 'completedDate', label: 'Completed Date', type: 'date', description: 'When assessment was completed' },
//           { key: 'timeSpent', label: 'Time Spent', type: 'number', description: 'Time spent in minutes' },
//           { key: 'skills', label: 'Skills Tested', type: 'array', description: 'Skills being assessed' },
//           { key: 'difficulty', label: 'Difficulty', type: 'select', description: 'Assessment difficulty level' },
//           { key: 'createdAt', label: 'Created Date', type: 'date', description: 'When record was created' }
//         ],
//         candidate: [
//           { key: 'name', label: 'Name', type: 'text', description: 'Candidate name' },
//           { key: 'email', label: 'Email', type: 'text', description: 'Contact email' },
//           { key: 'phone', label: 'Phone', type: 'text', description: 'Contact phone' },
//           { key: 'position', label: 'Position', type: 'text', description: 'Applied position' },
//           { key: 'stage', label: 'Current Stage', type: 'text', description: 'Current pipeline stage' },
//           { key: 'status', label: 'Status', type: 'select', description: 'Candidate status' },
//           { key: 'appliedDate', label: 'Applied Date', type: 'date', description: 'Application date' },
//           { key: 'experience', label: 'Experience', type: 'text', description: 'Years of experience' },
//           { key: 'location', label: 'Location', type: 'text', description: 'Geographic location' },
//           { key: 'skills', label: 'Skills', type: 'array', description: 'Technical skills' },
//           { key: 'source', label: 'Source', type: 'text', description: 'How candidate was sourced' },
//           { key: 'expectedSalary', label: 'Expected Salary', type: 'number', description: 'Salary expectations' },
//           { key: 'createdAt', label: 'Created Date', type: 'date', description: 'When record was created' }
//         ],
//         organization: [
//           { key: 'name', label: 'Organization Name', type: 'text', description: 'Organization name' },
//           { key: 'industry', label: 'Industry', type: 'text', description: 'Business industry' },
//           { key: 'size', label: 'Company Size', type: 'select', description: 'Number of employees' },
//           { key: 'interviewsCompleted', label: 'Interviews Completed', type: 'number', description: 'Total completed interviews' },
//           { key: 'activePositions', label: 'Active Positions', type: 'number', description: 'Currently open positions' },
//           { key: 'contractStart', label: 'Contract Start', type: 'date', description: 'Contract start date' },
//           { key: 'contractEnd', label: 'Contract End', type: 'date', description: 'Contract end date' },
//           { key: 'billingRate', label: 'Billing Rate', type: 'number', description: 'Hourly billing rate' },
//           { key: 'primaryContact', label: 'Primary Contact', type: 'text', description: 'Main contact person' },
//           { key: 'location', label: 'Location', type: 'text', description: 'Organization location' },
//           { key: 'location', label: 'Location', type: 'text', description: 'Physical or virtual location' },
//           { key: 'department', label: 'Department', type: 'text', description: 'Department or team' },
//           { key: 'region', label: 'Region', type: 'text', description: 'Geographic region' }
//         ]
//       };

//       res.json({
//         success: true,
//         data: availableColumns[reportType] || []
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         error: 'Failed to fetch available columns',
//         message: error.message
//       });
//     }
//   }
// );

// // POST /api/columns/grouping/save - Save grouping configuration
// router.post('/grouping/save',
//   userPermissionMiddleware('reports', 'update'),
//   async (req, res) => {
//     try {
//       const { reportType, grouping } = req.body;

//       const config = await ColumnConfiguration.findOneAndUpdate(
//         addTenantFilter(req, {
//           userId: req.currentUser.userId,
//           reportType
//         }),
//         {
//           $set: {
//             grouping: {
//               enabled: grouping.enabled || false,
//               column: grouping.column || '',
//               expandedGroups: grouping.expandedGroups || [],
//               showGroupCounts: grouping.showGroupCounts !== false,
//               sortGroups: grouping.sortGroups || 'asc'
//             }
//           }
//         },
//         {
//           new: true,
//           upsert: true,
//           runValidators: true
//         }
//       );

//       res.json({
//         success: true,
//         data: config,
//         message: 'Grouping configuration saved successfully'
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         error: 'Failed to save grouping configuration',
//         message: error.message
//       });
//     }
//   }
// );

// // GET /api/columns/grouping/:reportType - Get grouping configuration
// router.get('/grouping/:reportType',
//   userPermissionMiddleware('reports', 'read'),
//   async (req, res) => {
//     try {
//       const { reportType } = req.params;

//       const config = await ColumnConfiguration.findOne(
//         addTenantFilter(req, {
//           userId: req.currentUser.userId,
//           reportType
//         })
//       ).select('grouping').lean();

//       const grouping = config?.grouping || {
//         enabled: false,
//         column: '',
//         expandedGroups: [],
//         showGroupCounts: true,
//         sortGroups: 'asc'
//       };

//       res.json({
//         success: true,
//         data: grouping
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         error: 'Failed to fetch grouping configuration',
//         message: error.message
//       });
//     }
//   }
// );

// module.exports = router;
