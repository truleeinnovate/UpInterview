// Service for tracking bandwidth usage
const mongoose = require('mongoose');
const Usage = require('../models/Usage');

/**
 * Updates bandwidth usage for a tenant
 * @param {string} tenantId - Tenant ID
 * @param {string} ownerId - Owner ID (optional for individual plans)
 * @param {number} sizeInBytes - Size of file in bytes
 * @param {string} operation - 'upload' or 'download'
 */
async function updateBandwidthUsage(tenantId, ownerId, sizeInBytes, operation = 'unknown') {
  try {
    console.log(`[BANDWIDTH] Updating bandwidth usage: tenantId=${tenantId}, sizeInBytes=${sizeInBytes}, operation=${operation}`);
    
    if (!tenantId) {
      console.warn('[BANDWIDTH] No tenantId provided, skipping bandwidth update');
      return { success: false, message: 'No tenantId provided' };
    }

    // Convert bytes to GB (1 GB = 1024^3 bytes)
    const sizeInGB = sizeInBytes / (1024 * 1024 * 1024);
    
    // Get current date for finding active usage period
    const now = new Date();

    // Find current active usage document
    let usage = await Usage.findOne({
      tenantId,
      fromDate: { $lte: now },
      toDate: { $gte: now }
    });

    // If no current period, find the latest one
    if (!usage) {
      usage = await Usage.findOne({ tenantId }).sort({ toDate: -1 });
    }

    if (!usage) {
      console.error('[BANDWIDTH] No usage document found for tenant:', tenantId);
      return { success: false, message: 'No usage document found' };
    }

    // Find User Bandwidth attribute in usageAttributes
    const bandwidthIndex = usage.usageAttributes.findIndex(
      attr => attr.type === 'User Bandwidth'
    );

    if (bandwidthIndex === -1) {
      console.warn('[BANDWIDTH] No User Bandwidth attribute found in usage document');
      return { success: false, message: 'No User Bandwidth usage attribute found' };
    }

    const currentAttr = usage.usageAttributes[bandwidthIndex];
    const newUtilized = Math.max(0, currentAttr.utilized + sizeInGB);
    const newRemaining = Math.max(0, currentAttr.entitled - newUtilized);

    // Update the usage attribute
    usage.usageAttributes[bandwidthIndex].utilized = newUtilized;
    usage.usageAttributes[bandwidthIndex].remaining = newRemaining;

    // Save the updated usage
    await usage.save();

    console.log(`[BANDWIDTH] Successfully updated bandwidth usage:`, {
      operation,
      sizeInGB: sizeInGB.toFixed(4),
      previousUtilized: currentAttr.utilized.toFixed(2),
      newUtilized: newUtilized.toFixed(2),
      entitled: currentAttr.entitled,
      remaining: newRemaining.toFixed(2)
    });

    return {
      success: true,
      usage: {
        utilized: newUtilized,
        entitled: currentAttr.entitled,
        remaining: newRemaining,
        percentage: currentAttr.entitled > 0 ? Math.min((newUtilized / currentAttr.entitled) * 100, 100) : 0
      }
    };
  } catch (error) {
    console.error('[BANDWIDTH] Error updating bandwidth usage:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Checks if there's enough bandwidth remaining for a tenant
 * @param {string} tenantId - Tenant ID
 * @param {string} ownerId - Owner ID (optional)
 * @param {number} sizeInBytes - Size to check in bytes (optional)
 * @returns {Object} - { canUse: boolean, remaining: number, message: string }
 */
async function checkBandwidthUsageLimit(tenantId, ownerId, sizeInBytes = 0) {
  try {
    if (!tenantId) {
      return { canUse: false, remaining: 0, message: 'No tenantId provided' };
    }

    const now = new Date();

    // Find current active usage document
    let usage = await Usage.findOne({
      tenantId,
      fromDate: { $lte: now },
      toDate: { $gte: now }
    });

    // If no current period, find the latest one
    if (!usage) {
      usage = await Usage.findOne({ tenantId }).sort({ toDate: -1 });
    }

    if (!usage) {
      return { canUse: false, remaining: 0, message: 'No usage document found' };
    }

    // Find User Bandwidth attribute
    const bandwidthAttr = usage.usageAttributes.find(
      attr => attr.type === 'User Bandwidth'
    );

    if (!bandwidthAttr) {
      // No bandwidth tracking means unlimited
      return { canUse: true, remaining: Infinity, message: 'Bandwidth tracking not configured' };
    }

    const entitled = Number(bandwidthAttr.entitled) || 0;
    const utilized = Number(bandwidthAttr.utilized) || 0;
    const remaining = Math.max(0, entitled - utilized);

    // If entitled is 0, consider it unlimited
    if (entitled === 0) {
      return { 
        canUse: true, 
        remaining: Infinity, 
        message: 'Unlimited bandwidth',
        usage: { utilized, entitled, remaining: Infinity, percentage: 0 }
      };
    }

    // Convert bytes to GB if size provided
    const sizeInGB = sizeInBytes > 0 ? sizeInBytes / (1024 * 1024 * 1024) : 0;
    
    if (sizeInGB > 0 && remaining < sizeInGB) {
      return { 
        canUse: false, 
        remaining,
        message: `Insufficient bandwidth. Required: ${sizeInGB.toFixed(2)} GB, Available: ${remaining.toFixed(2)} GB`,
        usage: { utilized, entitled, remaining, percentage: Math.min((utilized / entitled) * 100, 100) }
      };
    }

    return { 
      canUse: true,
      remaining,
      message: `You have ${remaining.toFixed(2)} GB of bandwidth remaining`,
      usage: { utilized, entitled, remaining, percentage: Math.min((utilized / entitled) * 100, 100) }
    };
  } catch (error) {
    console.error('[BANDWIDTH] Error checking bandwidth usage:', error);
    return { canUse: false, remaining: 0, message: 'Error checking bandwidth usage' };
  }
}

/**
 * Gets bandwidth usage stats for a tenant
 * @param {string} tenantId - Tenant ID
 * @param {string} ownerId - Owner ID (optional)
 * @returns {Object} - Usage statistics
 */
async function getBandwidthUsageStats(tenantId, ownerId) {
  try {
    if (!tenantId) {
      return { success: false, message: 'No tenantId provided' };
    }

    const now = new Date();

    // Find current active usage document
    let usage = await Usage.findOne({
      tenantId,
      fromDate: { $lte: now },
      toDate: { $gte: now }
    });

    // If no current period, find the latest one
    if (!usage) {
      usage = await Usage.findOne({ tenantId }).sort({ toDate: -1 });
    }

    if (!usage) {
      return { success: false, message: 'No usage document found' };
    }

    // Find User Bandwidth attribute
    const bandwidthAttr = usage.usageAttributes.find(
      attr => attr.type === 'User Bandwidth'
    );

    if (!bandwidthAttr) {
      return {
        success: true,
        usage: {
          utilized: 0,
          entitled: 0,
          remaining: 0,
          percentage: 0,
          unlimited: true
        }
      };
    }

    const entitled = Number(bandwidthAttr.entitled) || 0;
    const utilized = Number(bandwidthAttr.utilized) || 0;
    const remaining = Math.max(0, entitled - utilized);
    const percentage = entitled > 0 ? Math.min((utilized / entitled) * 100, 100) : 0;

    return {
      success: true,
      usage: {
        utilized,
        entitled,
        remaining,
        percentage,
        unlimited: entitled === 0
      }
    };
  } catch (error) {
    console.error('[BANDWIDTH] Error getting bandwidth usage stats:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  updateBandwidthUsage,
  checkBandwidthUsageLimit,
  getBandwidthUsageStats
};
