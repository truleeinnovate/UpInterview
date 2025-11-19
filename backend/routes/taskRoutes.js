const express = require('express');
const router = express.Router();

const { getTasks, createTask, updateTask, getTaskById, deleteTask } = require('../controllers/taskController');
const loggingService = require('../middleware/loggingService.js');
const { permissionMiddleware } = require('../middleware/permissionMiddleware.js');


router.get('/',permissionMiddleware, getTasks);
router.post('/',loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, createTask);
router.get('/:id', getTaskById);
router.patch('/:id',loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, updateTask);
router.delete('/delete-task/:id', deleteTask);

module.exports = router;