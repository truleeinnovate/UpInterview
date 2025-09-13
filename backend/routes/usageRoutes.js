//<-----v1.0.0-----Venkatesh---added getUsageByTenant route
const express = require('express');
const router = express.Router();
const { getUsageByTenant, getUsageHistory } = require('../controllers/usageController');

// GET /api/usage
router.get('/:tenantId', getUsageByTenant);
// GET /usage/history/:tenantId?ownerId=...&from=YYYY-MM-DD&to=YYYY-MM-DD&page=1&limit=10
router.get('/history/:tenantId', getUsageHistory);

module.exports = router;
//-----v1.0.0----->
