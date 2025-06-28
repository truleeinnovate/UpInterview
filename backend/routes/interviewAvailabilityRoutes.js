const express = require('express');
const { 
    createOrUpdateInterviewAvailability, 
    updateInterviewAvailability, 
    getAvailabilityByContactId 
  } = require('../controllers/interviewAvailabilityController');
  
const router = express.Router();

router.post('/', createOrUpdateInterviewAvailability);
router.patch('/:id', updateInterviewAvailability);
router.get('/contact/:contactId', getAvailabilityByContactId);

module.exports = router;
