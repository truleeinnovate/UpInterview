const express = require('express');
const router = express.Router();
const {
    getIntegrationLogs,
    getIntegrationLogById,
    createIntegrationLog,
    deleteIntegrationLog
} = require('../controllers/integrationLogController');

// Get all integration logs with search and pagination
router.get('/', getIntegrationLogs);

// Get integration log by ID
router.get('/:id', getIntegrationLogById);

// Create new integration log
router.post('/', createIntegrationLog);

// Delete integration log
router.delete('/:id', deleteIntegrationLog);

module.exports = router;
