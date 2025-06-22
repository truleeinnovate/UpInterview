const express = require('express');
const router = express.Router();
const { getTenantByEmail } = require('../controllers/tenantController');

// @route   GET /api/tenants/email/:email
// @desc    Get tenant by email
// @access  Public
router.get('/email/:email', getTenantByEmail);

module.exports = router;
