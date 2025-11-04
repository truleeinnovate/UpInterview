//<-----v1.0.0-----Venkatesh---added getUsageByTenant route
const express = require('express');
const router = express.Router();
const { getUsageByTenant,
        getUsageHistory,
        //initializeUsage
       } = require('../controllers/usageController');

// POST /usage/initialize/:tenantId - Initialize usage for testing
//router.post('/initialize/:tenantId', initializeUsage);

// GET /api/usage
router.get('/:tenantId', getUsageByTenant);
// GET /usage/history/:tenantId?ownerId=...&from=YYYY-MM-DD&to=YYYY-MM-DD&page=1&limit=10
router.get('/history/:tenantId', getUsageHistory);

module.exports = router;
//-----v1.0.0----->
