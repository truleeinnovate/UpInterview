// Service for tracking internal interview usage
const mongoose = require('mongoose');
const Usage = require('../models/Usage');
const { InterviewRounds } = require('../models/Interview/InterviewRounds');

/**
 * Updates usage count for internal interviews
 * @param {string} tenantId - Tenant ID
 * @param {string} ownerId - Owner ID
 * @param {number} delta - Change in usage (+1 for schedule, -1 for cancel)
 * @param {string} operation - 'schedule' or 'cancel'
 */
async function updateInternalInterviewUsage(tenantId, ownerId, delta, operation = 'unknown') {
  try {
    console.log(`[USAGE] Updating internal interview usage: tenantId=${tenantId}, delta=${delta}, operation=${operation}`);
    
    if (!tenantId) {
      console.warn('[USAGE] No tenantId provided, skipping usage update');
      return { success: false, message: 'No tenantId provided' };
    }

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
      console.error('[USAGE] No usage document found for tenant:', tenantId);
      return { success: false, message: 'No usage document found' };
    }

    // Find Internal Interviews attribute in usageAttributes
    const internalInterviewerIndex = usage.usageAttributes.findIndex(
      attr => attr.type === 'Internal Interviews'
    );

    if (internalInterviewerIndex === -1) {
      console.warn('[USAGE] No Internal Interviews attribute found in usage document');
      return { success: false, message: 'No Internal Interviews usage attribute found' };
    }

    const currentAttr = usage.usageAttributes[internalInterviewerIndex];
    const newUtilized = Math.max(0, currentAttr.utilized + delta); // Ensure non-negative
    const newRemaining = Math.max(0, currentAttr.entitled - newUtilized);

    // Update the usage attribute
    usage.usageAttributes[internalInterviewerIndex].utilized = newUtilized;
    usage.usageAttributes[internalInterviewerIndex].remaining = newRemaining;

    // Save the updated usage
    await usage.save();

    console.log(`[USAGE] Successfully updated internal interview usage:`, {
      operation,
      previousUtilized: currentAttr.utilized,
      newUtilized,
      entitled: currentAttr.entitled,
      remaining: newRemaining
    });

    return {
      success: true,
      usage: {
        utilized: newUtilized,
        entitled: currentAttr.entitled,
        remaining: newRemaining
      }
    };
  } catch (error) {
    console.error('[USAGE] Error updating internal interview usage:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Checks if there's enough usage remaining for internal interviews
 * @param {string} tenantId - Tenant ID
 * @param {string} ownerId - Owner ID (optional for individual plans)
 * @returns {Object} - { canSchedule: boolean, remaining: number, message: string }
 */
async function checkInternalInterviewUsageLimit(tenantId, ownerId) {
  try {
    if (!tenantId) {
      return { canSchedule: false, remaining: 0, message: 'No tenantId provided' };
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
      console.warn('[USAGE] No usage document found for limit check');
      return { canSchedule: false, remaining: 0, message: 'No usage document found' };
    }

    // Find Internal Interviews attribute
    const internalInterviewerAttr = usage.usageAttributes.find(
      attr => attr.type === 'Internal Interviews'
    );

    if (!internalInterviewerAttr) {
      console.warn('[USAGE] No Internal Interviews attribute found');
      return { canSchedule: false, remaining: 0, message: 'No internal interview usage limits configured' };
    }

    const remaining = internalInterviewerAttr.remaining || 0;
    const canSchedule = remaining > 0;

    return {
      canSchedule,
      remaining,
      utilized: internalInterviewerAttr.utilized || 0,
      entitled: internalInterviewerAttr.entitled || 0,
      message: canSchedule 
        ? `You have ${remaining} internal interview(s) remaining`
        : 'You have reached your internal interview limit'
    };
  } catch (error) {
    console.error('[USAGE] Error checking internal interview usage limit:', error);
    return { canSchedule: false, remaining: 0, message: 'Error checking usage limits' };
  }
}

/**
 * Handles interview round status change and updates usage accordingly
 * @param {string} roundId - Interview Round ID
 * @param {string} oldStatus - Previous status
 * @param {string} newStatus - New status
 * @param {Object} interviewData - Additional interview data (tenantId, ownerId, etc.)
 */
async function handleInterviewStatusChange(roundId, oldStatus, newStatus, interviewData = {}) {
  try {
    console.log(`[USAGE] Interview status change: ${oldStatus} -> ${newStatus}`, { roundId, ...interviewData });

    // Get the interview round to check if it's internal
    const round = await InterviewRounds.findById(roundId).populate('interviewId');
    
    if (!round) {
      console.warn('[USAGE] Interview round not found:', roundId);
      return { success: false, message: 'Round not found' };
    }

    // Only track internal interviews
    if (round.interviewerType !== 'internal') {
      console.log('[USAGE] Not an internal interview, skipping usage tracking');
      return { success: true, message: 'Not an internal interview' };
    }

    // Get tenantId and ownerId from interview or provided data
    const tenantId = interviewData.tenantId || round.interviewId?.tenantId;
    const ownerId = interviewData.ownerId || round.interviewId?.ownerId;

    // Track usage based on status transitions
    let usageResult = { success: true };

    // Status changed TO Scheduled (increase usage)
    if (newStatus === 'Scheduled' && oldStatus !== 'Scheduled') {
      // Check if we have enough usage first
      const limitCheck = await checkInternalInterviewUsageLimit(tenantId, ownerId);
      if (!limitCheck.canSchedule) {
        return { 
          success: false, 
          message: limitCheck.message,
          remaining: limitCheck.remaining 
        };
      }
      
      usageResult = await updateInternalInterviewUsage(tenantId, ownerId, +1, 'schedule');
    }
    
    // Status changed FROM Scheduled to Cancelled (decrease usage)
    else if (oldStatus === 'Scheduled' && newStatus === 'Cancelled') {
      usageResult = await updateInternalInterviewUsage(tenantId, ownerId, -1, 'cancel');
    }
    
    // Status changed FROM Scheduled to any other status (except Completed)
    // This handles rescheduling, rejection, etc.
    else if (oldStatus === 'Scheduled' && 
             newStatus !== 'Scheduled' && 
             newStatus !== 'Completed' && 
             newStatus !== 'InProgress') {
      usageResult = await updateInternalInterviewUsage(tenantId, ownerId, -1, 'release');
    }

    return usageResult;
  } catch (error) {
    console.error('[USAGE] Error handling interview status change:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get current internal interview usage stats
 * @param {string} tenantId - Tenant ID
 * @param {string} ownerId - Owner ID (optional)
 */
async function getInternalInterviewUsageStats(tenantId, ownerId) {
  try {
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
      return null;
    }

    // Find Internal Interviews attribute
    const internalInterviewerAttr = usage.usageAttributes.find(
      attr => attr.type === 'Internal Interviews'
    );

    if (!internalInterviewerAttr) {
      return null;
    }

    return {
      utilized: internalInterviewerAttr.utilized || 0,
      entitled: internalInterviewerAttr.entitled || 0,
      remaining: internalInterviewerAttr.remaining || 0,
      percentage: internalInterviewerAttr.entitled > 0 
        ? Math.round((internalInterviewerAttr.utilized / internalInterviewerAttr.entitled) * 100)
        : 0,
      fromDate: usage.fromDate,
      toDate: usage.toDate
    };
  } catch (error) {
    console.error('[USAGE] Error getting internal interview usage stats:', error);
    return null;
  }
}

module.exports = {
  updateInternalInterviewUsage,
  checkInternalInterviewUsageLimit,
  handleInterviewStatusChange,
  getInternalInterviewUsageStats
};
