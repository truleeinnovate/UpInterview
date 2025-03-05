const express = require('express');
const { createOrUpdateInterviewAvailability, updateInterviewAvailability } = require('../controllers/interviewAvailabilityController');

const router = express.Router();

router.post('/', createOrUpdateInterviewAvailability);
router.patch('/:id', updateInterviewAvailability);

module.exports = router;
