// routes/interviewerRoutes.js - Express routes for Interviewer CRUD
const express = require('express');
const router = express.Router();
const {
    getAllInterviewers,
    getAllInterviewersData,
    getInterviewerById,
    createInterviewer,
    updateInterviewer,
    deleteInterviewer,
    toggleInterviewerActive
} = require('../controllers/interviewerController');

const loggingService = require('../middleware/loggingService');

// GET /api/interviewers - Paginated list with filters
router.get('/', getAllInterviewers);

// GET /api/interviewers/data - All interviewers (for dropdowns)
router.get('/data', getAllInterviewersData);

// GET /api/interviewers/:id - Get single interviewer
router.get('/:id', getInterviewerById);

// POST /api/interviewers - Create new interviewer
router.post(
    '/',
    loggingService.internalLoggingMiddleware,
    createInterviewer
);

// PATCH /api/interviewers/:id - Update interviewer
router.patch(
    '/:id',
    loggingService.internalLoggingMiddleware,
    updateInterviewer
);

// DELETE /api/interviewers/:id - Delete interviewer
router.delete(
    '/:id',
    loggingService.internalLoggingMiddleware,
    deleteInterviewer
);

// PATCH /api/interviewers/:id/toggle-active - Toggle active status
router.patch(
    '/:id/toggle-active',
    loggingService.internalLoggingMiddleware,
    toggleInterviewerActive
);

module.exports = router;
