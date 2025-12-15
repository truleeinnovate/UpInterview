// Service for tracking assessment usage
const mongoose = require("mongoose");
const Usage = require("../models/Usage");
const {
  CandidateAssessment,
} = require("../models/Assessment/candidateAssessment");
const ScheduleAssessment = require("../models/Assessment/assessmentsSchema");
const Assessment = require("../models/Assessment/assessmentTemplates");

async function findLatestUsageForTenant(tenantId) {
  const allUsages = await Usage.find({ tenantId });
  if (!allUsages || allUsages.length === 0) {
    return null;
  }

  let latest = allUsages[0];
  for (let i = 1; i < allUsages.length; i++) {
    if (allUsages[i].toDate > latest.toDate) {
      latest = allUsages[i];
    }
  }

  return latest;
}

/**
 * Updates usage count for assessments
 * @param {string} tenantId - Tenant ID
 * @param {string} ownerId - Owner ID
 * @param {number} delta - Change in usage (+1 for completed/pass, -1 for cancelled/expired)
 * @param {string} operation - 'completed', 'pass', 'cancel', 'expired'
 */
async function updateAssessmentUsage(
  tenantId,
  ownerId,
  delta,
  operation = "unknown"
) {
  try {
    if (!tenantId) {
      console.warn(
        "[ASSESSMENT_USAGE] No tenantId provided, skipping usage update"
      );
      return { success: false, message: "No tenantId provided" };
    }

    // Get current date for finding active usage period
    const now = new Date();

    // Find current active usage document
    let usage = await Usage.findOne({
      tenantId,
      fromDate: { $lte: now },
      toDate: { $gte: now },
    });

    // If no current period, find the latest one
    if (!usage) {
      usage = await findLatestUsageForTenant(tenantId);
    }

    if (!usage) {
      console.error(
        "[ASSESSMENT_USAGE] No usage document found for tenant:",
        tenantId
      );
      return { success: false, message: "No usage document found" };
    }

    // Find Assessments attribute in usageAttributes
    const assessmentIndex = usage.usageAttributes.findIndex(
      (attr) => attr.type && attr.type.toLowerCase() === "assessments"
    );

    if (assessmentIndex === -1) {
      console.warn(
        "[ASSESSMENT_USAGE] No Assessments attribute found in usage document"
      );
      return {
        success: false,
        message: "No Assessments usage attribute found",
      };
    }

    const currentAttr = usage.usageAttributes[assessmentIndex];
    const newUtilized = Math.max(0, currentAttr.utilized + delta); // Ensure non-negative
    const newRemaining = Math.max(0, currentAttr.entitled - newUtilized);

    // Update the usage attribute
    usage.usageAttributes[assessmentIndex].utilized = newUtilized;
    usage.usageAttributes[assessmentIndex].remaining = newRemaining;

    // Save the updated usage
    await usage.save();

    return {
      success: true,
      usage: {
        utilized: newUtilized,
        entitled: currentAttr.entitled,
        remaining: newRemaining,
      },
    };
  } catch (error) {
    console.error("[ASSESSMENT_USAGE] Error updating assessment usage:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Handles candidate assessment status change and updates usage accordingly
 * @param {string} candidateAssessmentId - Candidate Assessment ID
 * @param {string} oldStatus - Previous status
 * @param {string} newStatus - New status
 * @param {Object} assessmentData - Additional assessment data (tenantId, ownerId, etc.)
 */
async function handleAssessmentStatusChange(
  candidateAssessmentId,
  oldStatus,
  newStatus,
  assessmentData = {}
) {
  try {
    // Get the candidate assessment to get tenantId and ownerId
    const candidateAssessment = await CandidateAssessment.findById(
      candidateAssessmentId
    ).populate({
      path: "scheduledAssessmentId",
      populate: {
        path: "assessmentId",
        select: "tenantId ownerId",
      },
    });

    if (!candidateAssessment) {
      console.warn(
        "[ASSESSMENT_USAGE] Candidate assessment not found:",
        candidateAssessmentId
      );
      return { success: false, message: "Candidate assessment not found" };
    }

    // Get tenantId and ownerId from assessment or provided data
    const tenantId =
      assessmentData.tenantId ||
      candidateAssessment.scheduledAssessmentId?.assessmentId?.tenantId;
    const ownerId =
      assessmentData.ownerId ||
      candidateAssessment.scheduledAssessmentId?.assessmentId?.ownerId;

    if (!tenantId) {
      console.warn(
        "[ASSESSMENT_USAGE] No tenantId found for candidate assessment:",
        candidateAssessmentId
      );
      return { success: false, message: "No tenantId found" };
    }

    // Track usage based on status transitions
    let usageResult = { success: true };

    // Helper to check if status is counted (any active share)
    const isCountedStatus = (status) =>
      ["pending", "in_progress", "completed", "pass", "extended"].includes(
        status
      );
    // Helper to check if status decreases usage (cancelled or expired)
    const isDecreasedStatus = (status) =>
      status === "cancelled" || status === "expired";

    const wasCounted = isCountedStatus(oldStatus);
    const isNowCounted = isCountedStatus(newStatus);
    const wasDecreased = isDecreasedStatus(oldStatus);
    const isNowDecreased = isDecreasedStatus(newStatus);

    // Status moved into a counted state (e.g., created/scheduled/pending/in_progress/completed/pass)
    if (isNowCounted && !wasCounted) {
      // From cancelled/expired back to active -> increase by 1 (undo a previous decrease)
      // From no status/non-counted to active -> increase by 1
      usageResult = await updateAssessmentUsage(
        tenantId,
        ownerId,
        +1,
        `${oldStatus}->${newStatus}`
      );
    }
    // Status moved into a decreased state (cancelled/expired) from any counted state -> decrease by 1
    else if (isNowDecreased && wasCounted && !wasDecreased) {
      usageResult = await updateAssessmentUsage(
        tenantId,
        ownerId,
        -1,
        `${oldStatus}->${newStatus}`
      );
    }
    // Changes within counted states (e.g., pending->completed/pass) have no effect
    else if (isNowCounted && wasCounted && oldStatus !== newStatus) {
      usageResult = {
        success: true,
        message: "No usage change - transition within active states",
      };
    }
    // Changes within decreased states have no effect
    else if (isNowDecreased && wasDecreased && oldStatus !== newStatus) {
      usageResult = {
        success: true,
        message: "No usage change - transition within decreased states",
      };
    }

    return usageResult;
  } catch (error) {
    console.error(
      "[ASSESSMENT_USAGE] Error handling assessment status change:",
      error
    );
    return { success: false, error: error.message };
  }
}

/**
 * Recalculates assessment usage based on actual candidate assessment statuses
 * This ensures accuracy by counting all candidate assessments with completed/pass status
 * @param {string} tenantId - Tenant ID
 */
async function recalculateAssessmentUsage(tenantId) {
  try {
    if (!tenantId) {
      console.warn("[ASSESSMENT_USAGE] No tenantId provided for recalculation");
      return { success: false, message: "No tenantId provided" };
    }

    // Find all scheduled assessments for this tenant by getting assessments first
    const assessments = await Assessment.find({ tenantId }).select("_id");
    const assessmentIds = assessments.map((a) => a._id);

    // Find all scheduled assessments for these assessment IDs
    // Also filter by organizationId (which should match tenantId) to ensure we only count this tenant's assessments
    const scheduledAssessments = await ScheduleAssessment.find({
      $or: [
        { assessmentId: { $in: assessmentIds } },
        { organizationId: tenantId }, // Also check by organizationId in case it matches tenantId
      ],
    }).select("_id");

    const scheduledAssessmentIds = scheduledAssessments.map((sa) => sa._id);

    // Count active candidate assessments (scheduled/shared) for usage
    // Count statuses that consume capacity: pending, in_progress, completed, pass, extended
    const utilizedCount = await CandidateAssessment.countDocuments({
      scheduledAssessmentId: { $in: scheduledAssessmentIds },
      status: {
        $in: ["pending", "in_progress", "completed", "pass", "extended"],
      },
    });

    // Debug: Check total candidate assessments for these scheduled assessments
    const totalCandidateAssessments = await CandidateAssessment.countDocuments({
      scheduledAssessmentId: { $in: scheduledAssessmentIds },
    });

    // Get current date for finding active usage period
    const now = new Date();

    // Find current active usage document
    let usage = await Usage.findOne({
      tenantId,
      fromDate: { $lte: now },
      toDate: { $gte: now },
    });

    // If no current period, find the latest one
    if (!usage) {
      usage = await findLatestUsageForTenant(tenantId);
    }

    if (!usage) {
      console.error(
        "[ASSESSMENT_USAGE] No usage document found for tenant:",
        tenantId
      );
      return { success: false, message: "No usage document found" };
    }

    // Find Assessments attribute in usageAttributes
    const assessmentIndex = usage.usageAttributes.findIndex(
      (attr) => attr.type && attr.type.toLowerCase() === "assessments"
    );

    if (assessmentIndex === -1) {
      console.warn(
        "[ASSESSMENT_USAGE] No Assessments attribute found in usage document"
      );
      return {
        success: false,
        message: "No Assessments usage attribute found",
      };
    }

    const currentAttr = usage.usageAttributes[assessmentIndex];
    const newUtilized = utilizedCount;
    const newRemaining = Math.max(0, currentAttr.entitled - newUtilized);

    // Update the usage attribute
    usage.usageAttributes[assessmentIndex].utilized = newUtilized;
    usage.usageAttributes[assessmentIndex].remaining = newRemaining;

    // Save the updated usage
    await usage.save();

    return {
      success: true,
      usage: {
        utilized: newUtilized,
        entitled: currentAttr.entitled,
        remaining: newRemaining,
      },
    };
  } catch (error) {
    console.error(
      "[ASSESSMENT_USAGE] Error recalculating assessment usage:",
      error
    );
    return { success: false, error: error.message };
  }
}

/**
 * Get current assessment usage stats
 * @param {string} tenantId - Tenant ID
 * @param {string} ownerId - Owner ID (optional)
 */
async function getAssessmentUsageStats(tenantId, ownerId) {
  try {
    const now = new Date();

    // Find current active usage document
    let usage = await Usage.findOne({
      tenantId,
      fromDate: { $lte: now },
      toDate: { $gte: now },
    });

    // If no current period, find the latest one
    if (!usage) {
      usage = await findLatestUsageForTenant(tenantId);
    }

    if (!usage) {
      return null;
    }

    // Find Assessments attribute
    const assessmentAttr = usage.usageAttributes.find(
      (attr) => attr.type && attr.type.toLowerCase() === "assessments"
    );

    if (!assessmentAttr) {
      return null;
    }

    return {
      utilized: assessmentAttr.utilized || 0,
      entitled: assessmentAttr.entitled || 0,
      remaining: assessmentAttr.remaining || 0,
      percentage:
        assessmentAttr.entitled > 0
          ? Math.round(
              (assessmentAttr.utilized / assessmentAttr.entitled) * 100
            )
          : 0,
      fromDate: usage.fromDate,
      toDate: usage.toDate,
    };
  } catch (error) {
    console.error(
      "[ASSESSMENT_USAGE] Error getting assessment usage stats:",
      error
    );
    return null;
  }
}

module.exports = {
  updateAssessmentUsage,
  handleAssessmentStatusChange,
  recalculateAssessmentUsage,
  getAssessmentUsageStats,
};

/**
 * Check assessment usage limit and remaining capacity
 * @param {string} tenantId
 * @returns {{canShare:boolean, remaining:number, utilized:number, entitled:number, fromDate:Date, toDate:Date, message:string}}
 */
async function checkAssessmentUsageLimit(tenantId) {
  try {
    if (!tenantId) {
      return {
        canShare: false,
        remaining: 0,
        utilized: 0,
        entitled: 0,
        message: "No tenantId provided",
      };
    }

    const now = new Date();
    let usage = await Usage.findOne({
      tenantId,
      fromDate: { $lte: now },
      toDate: { $gte: now },
    });
    if (!usage) {
      usage = await findLatestUsageForTenant(tenantId);
    }
    if (!usage) {
      return {
        canShare: false,
        remaining: 0,
        utilized: 0,
        entitled: 0,
        message: "No active usage period",
      };
    }

    const assessmentAttr = usage.usageAttributes.find(
      (attr) => attr.type && attr.type.toLowerCase() === "assessments"
    );
    if (!assessmentAttr) {
      return {
        canShare: true,
        remaining: Infinity,
        utilized: 0,
        entitled: 0,
        fromDate: usage.fromDate,
        toDate: usage.toDate,
        message: "Unlimited assessments",
      };
    }

    const entitled = Number(assessmentAttr.entitled) || 0;
    const utilized = Number(assessmentAttr.utilized) || 0;
    const remaining =
      entitled === 0 ? Infinity : Math.max(entitled - utilized, 0);
    const canShare = remaining > 0 || remaining === Infinity;

    // Determine period label roughly
    const ms = new Date(usage.toDate) - new Date(usage.fromDate);
    const days = Math.round(ms / (1000 * 60 * 60 * 24));
    const period = days > 330 ? "annual" : "monthly";

    return {
      canShare,
      remaining,
      utilized,
      entitled,
      fromDate: usage.fromDate,
      toDate: usage.toDate,
      message: canShare
        ? `You can share up to ${
            remaining === Infinity ? "unlimited" : remaining
          } more ${
            remaining === 1 ? "candidate" : "candidates"
          } this ${period} period.`
        : `Your ${period} assessment limit is used. Wait until the next ${period} cycle or upgrade your plan.`,
    };
  } catch (error) {
    console.error(
      "[ASSESSMENT_USAGE] Error checking assessment usage limit:",
      error
    );
    return {
      canShare: false,
      remaining: 0,
      utilized: 0,
      entitled: 0,
      message: "Error checking usage limits",
    };
  }
}

module.exports.checkAssessmentUsageLimit = checkAssessmentUsageLimit;
