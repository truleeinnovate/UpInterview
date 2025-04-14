const express = require('express');
const router = express.Router();
const outsourceInterviewRequestController = require('../controllers/outsourceInterviewRequestController.js');

router.get('/', outsourceInterviewRequestController.getAllRequests);
router.post('/', outsourceInterviewRequestController.createRequest);
router.patch('/:id', outsourceInterviewRequestController.updateRequestStatus);

module.exports = router;