const express = require('express');
const router = express.Router();
const { 
  checkBandwidthUsage, 
  trackBandwidthUsage, 
  getBandwidthStats 
} = require('../controllers/bandwidthController');

// Check bandwidth usage
router.get('/check', checkBandwidthUsage);

// Track bandwidth usage
router.post('/track', trackBandwidthUsage);

// Get bandwidth statistics
router.get('/stats', getBandwidthStats);

module.exports = router;
