const express = require('express');
const router = express.Router();
const {
    createLog,
    getLogs,
    getLogById,
    deleteLog
} = require('../controllers/internalLogController');
// Internal log routes
router.get('/', getLogs); // Get all logs
router.get('/:id', getLogById); // Get log by ID
router.post('/',  createLog); // Create new log with middleware
router.delete('/:id', deleteLog); // Delete log by ID

module.exports = router;
