//<-----v1.0.0-----Venkatesh---added getUsageByTenant route
const express = require('express');
const router = express.Router();
const { getUsageByTenant } = require('../controllers/usageController');

// GET /api/usage
router.get('/:tenantId', getUsageByTenant);

module.exports = router;
//-----v1.0.0----->
