// Controller for bandwidth usage operations
const { 
  updateBandwidthUsage, 
  checkBandwidthUsageLimit, 
  getBandwidthUsageStats 
} = require('../services/bandwidthUsageService');

/**
 * Check bandwidth usage for a tenant
 * GET /api/bandwidth/check?tenantId=xxx&ownerId=yyy
 */
const checkBandwidthUsage = async (req, res) => {
  try {
    const { tenantId, ownerId } = req.query;
    
    if (!tenantId) {
      return res.status(400).json({ 
        success: false, 
        message: 'tenantId is required' 
      });
    }

    const result = await getBandwidthUsageStats(tenantId, ownerId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json({
      success: true,
      canUse: result.usage.remaining > 0 || result.usage.unlimited,
      message: result.usage.unlimited 
        ? 'Unlimited bandwidth available' 
        : `You have ${result.usage.remaining.toFixed(2)} GB bandwidth remaining`,
      usage: result.usage
    });
  } catch (error) {
    console.error('[BANDWIDTH] Error checking bandwidth usage:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Track bandwidth usage for file operations
 * POST /api/bandwidth/track
 */
const trackBandwidthUsage = async (req, res) => {
  try {
    const { tenantId, ownerId, sizeInBytes, operation } = req.body;
    
    if (!tenantId || !sizeInBytes || !operation) {
      return res.status(400).json({ 
        success: false, 
        message: 'tenantId, sizeInBytes, and operation are required' 
      });
    }

    // First check if there's enough bandwidth
    const checkResult = await checkBandwidthUsageLimit(tenantId, ownerId, sizeInBytes);
    
    if (!checkResult.canUse) {
      return res.status(403).json({
        success: false,
        message: checkResult.message,
        usage: checkResult.usage
      });
    }

    // Update the usage
    const result = await updateBandwidthUsage(tenantId, ownerId, sizeInBytes, operation);
    
    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.json({
      success: true,
      message: `Bandwidth usage tracked successfully`,
      usage: result.usage
    });
  } catch (error) {
    console.error('[BANDWIDTH] Error tracking bandwidth usage:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Get bandwidth usage statistics
 * GET /api/bandwidth/stats?tenantId=xxx&ownerId=yyy
 */
const getBandwidthStats = async (req, res) => {
  try {
    const { tenantId, ownerId } = req.query;
    
    if (!tenantId) {
      return res.status(400).json({ 
        success: false, 
        message: 'tenantId is required' 
      });
    }

    const result = await getBandwidthUsageStats(tenantId, ownerId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json({
      success: true,
      usage: result.usage,
      period: {
        message: result.usage.unlimited 
          ? 'Unlimited bandwidth' 
          : `${result.usage.utilized.toFixed(2)} GB of ${result.usage.entitled} GB used`
      }
    });
  } catch (error) {
    console.error('[BANDWIDTH] Error getting bandwidth stats:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

module.exports = {
  checkBandwidthUsage,
  trackBandwidthUsage,
  getBandwidthStats
};
