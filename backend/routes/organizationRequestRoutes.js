const express = require('express');
const router = express.Router();
const organizationRequestController = require('../controllers/organizationRequestController');

// Get all organization requests
router.get('/', organizationRequestController.getOrganizationRequests);

// Create a new organization request
router.post('/', organizationRequestController.createOrganizationRequest);

// Get organization request by ID
router.get('/:id', organizationRequestController.getOrganizationRequestById);

// Update organization request status
router.patch('/:id/status', organizationRequestController.updateOrganizationRequestStatus);

module.exports = router;
