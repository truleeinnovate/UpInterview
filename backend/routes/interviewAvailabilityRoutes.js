const express = require('express');
const { createOrUpdateInterviewAvailability, updateInterviewAvailability } = require('../controllers/interviewAvailabilityController.js');

const router = express.Router();

router.post('/', createOrUpdateInterviewAvailability);
router.patch('/:id', updateInterviewAvailability);

module.exports = router;
