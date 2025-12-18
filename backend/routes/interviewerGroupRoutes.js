const express = require('express');
const router = express.Router();
const {
    createGroup,
    getAllGroups,
    getPaginatedGroups,
    getGroupById,
    updateGroup
} = require('../controllers/interviewerGroupController');

const loggingService = require('../middleware/loggingService');

// Create a new group
router.post(
    '/',
    loggingService.internalLoggingMiddleware,
    createGroup
);

// Paginated list of groups
router.get('/', getPaginatedGroups);

// Legacy endpoint returning all groups for a tenant
router.get('/data', getAllGroups);

// Update group
router.patch(
	'/update/:id',
	loggingService.internalLoggingMiddleware,
	updateGroup
);

// Get single group by ID
router.get('/:id', getGroupById);

module.exports = router;
