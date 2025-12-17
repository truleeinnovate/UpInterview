const express = require('express');
const router = express.Router();
const organizationRequestController = require('../controllers/organizationRequestController');
const loggingService = require('../middleware/loggingService.js');

// Get all organization requests for payment pending page
router.get("/all-req-for-payment-pending-page", organizationRequestController.getAllReqForPaymentPendingPage);

// Get all organization requests
router.get('/', organizationRequestController.getOrganizationRequests);

// Create a new organization request
router.post(
  '/',
  loggingService.internalLoggingMiddleware,
  organizationRequestController.createOrganizationRequest
);

// Update organization request status
router.put(
  '/:id/status',
  loggingService.internalLoggingMiddleware,
  organizationRequestController.updateStatus
);

// Get organization request by ID (keep this last as it's a catch-all for GET /:id)
router.get('/:id', organizationRequestController.getOrganizationRequestById);




module.exports = router;
