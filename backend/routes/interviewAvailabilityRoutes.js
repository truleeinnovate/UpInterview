const express = require('express');
const { 
    createOrUpdateInterviewAvailability, 
    updateInterviewAvailability, 
    getAvailabilityByContactId 
  } = require('../controllers/interviewAvailabilityController');
const loggingService = require('../middleware/loggingService');
  
const router = express.Router();

router.post(
    '/',
    loggingService.internalLoggingMiddleware,
    createOrUpdateInterviewAvailability
);
router.patch(
    '/:id',
    loggingService.internalLoggingMiddleware,
    updateInterviewAvailability
);
router.get('/contact/:contactId', getAvailabilityByContactId);

module.exports = router;
