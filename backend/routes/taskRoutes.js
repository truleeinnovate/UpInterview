const express = require('express');
const router = express.Router();

const { getTasks, createTask, updateTask, getTaskById } = require('../controllers/taskController');

router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTaskById);
router.patch('/:id', updateTask);

module.exports = router;