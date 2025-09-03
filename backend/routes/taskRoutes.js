const express = require('express');
const router = express.Router();

const { getTasks, createTask, updateTask, getTaskById } = require('../controllers/taskController');
const loggingService = require('../middleware/loggingService.js');


router.get('/', getTasks);
router.post('/',loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, createTask);
router.get('/:id', getTaskById);
router.patch('/:id',loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, updateTask);

module.exports = router;