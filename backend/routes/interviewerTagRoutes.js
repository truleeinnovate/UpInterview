// routes/interviewerTagRoutes.js - Express routes for InterviewerTag CRUD
const express = require('express');
const router = express.Router();
const {
    getAllTags,
    getPaginatedTags,
    getTagById,
    createTag,
    updateTag,
    deleteTag
} = require('../controllers/interviewerTagController');

const loggingService = require('../middleware/loggingService');

// GET /api/interviewer-tags - All tags (for dropdowns/selects)
router.get('/', getAllTags);

// GET /api/interviewer-tags/paginated - Paginated list with filters
router.get('/paginated', getPaginatedTags);

// GET /api/interviewer-tags/:id - Get single tag
router.get('/:id', getTagById);

// POST /api/interviewer-tags - Create new tag
router.post(
    '/',
    loggingService.internalLoggingMiddleware,
    createTag
);

// PATCH /api/interviewer-tags/:id - Update tag
router.patch(
    '/:id',
    loggingService.internalLoggingMiddleware,
    updateTag
);

// DELETE /api/interviewer-tags/:id - Delete tag
router.delete(
    '/:id',
    loggingService.internalLoggingMiddleware,
    deleteTag
);

module.exports = router;
