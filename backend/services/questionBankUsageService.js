// Service for tracking question bank access usage
// IMPORTANT: The Question Bank Access limit is COMBINED across both
// Interview and Assessment questions. For example, if a user has a
// limit of 1000 questions, they can access a total of 1000 questions
// from both types combined, not 1000 of each type.

const mongoose = require("mongoose");
const Usage = require("../models/Usage");

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
 * Checks if there's enough usage remaining for question bank access
 * The limit applies globally across all question types (Interview + Assessment)
 * @param {string} tenantId - Tenant ID
 * @param {string} ownerId - Owner ID (optional for individual plans)
 * @returns {Object} - { canAccess: boolean, remaining: number, utilized: number, entitled: number, message: string }
 */
async function checkQuestionBankUsageLimit(tenantId, ownerId) {
  try {
    if (!tenantId) {
      return {
        canAccess: false,
        remaining: 0,
        utilized: 0,
        entitled: 0,
        message: "No tenantId provided",
      };
    }

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
      console.warn(
        "[QUESTION_BANK_USAGE] No usage document found for limit check"
      );
      return {
        canAccess: false,
        remaining: 0,
        utilized: 0,
        entitled: 0,
        message: "No usage document found",
      };
    }

    // Find Question Bank Access attribute
    const questionBankAttr = usage.usageAttributes.find(
      (attr) => attr.type === "Question Bank Access"
    );

    if (!questionBankAttr) {
      console.warn(
        "[QUESTION_BANK_USAGE] No Question Bank Access attribute found"
      );
      return {
        canAccess: true, // Allow unlimited access if not configured
        remaining: Infinity,
        utilized: 0,
        entitled: Infinity,
        message: "Unlimited question bank access",
      };
    }

    const utilized = questionBankAttr.utilized || 0;
    const entitled = questionBankAttr.entitled || 0;
    const remaining = Math.max(0, entitled - utilized);
    const canAccess = remaining > 0 || entitled === 0; // Allow if remaining > 0 or unlimited (0 means unlimited)

    return {
      canAccess,
      remaining: entitled === 0 ? Infinity : remaining,
      utilized,
      entitled: entitled === 0 ? Infinity : entitled,
      message: canAccess
        ? `You can access ${
            remaining === Infinity ? "unlimited" : remaining
          } more question(s)`
        : "You have reached your question bank access limit. Please upgrade your plan for more access.",
    };
  } catch (error) {
    console.error(
      "[QUESTION_BANK_USAGE] Error checking question bank usage limit:",
      error
    );
    return {
      canAccess: false,
      remaining: 0,
      utilized: 0,
      entitled: 0,
      message: "Error checking usage limits",
    };
  }
}

/**
 * Updates usage count for question bank access
 * @param {string} tenantId - Tenant ID
 * @param {string} ownerId - Owner ID
 * @param {number} delta - Change in usage (number of questions accessed)
 * @param {string} operation - 'view' or other operation type
 */
async function updateQuestionBankUsage(
  tenantId,
  ownerId,
  delta,
  operation = "view"
) {
  try {
    if (!tenantId) {
      console.warn(
        "[QUESTION_BANK_USAGE] No tenantId provided, skipping usage update"
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
        "[QUESTION_BANK_USAGE] No usage document found for tenant:",
        tenantId
      );
      return { success: false, message: "No usage document found" };
    }

    // Find Question Bank Access attribute in usageAttributes
    const questionBankIndex = usage.usageAttributes.findIndex(
      (attr) => attr.type === "Question Bank Access"
    );

    if (questionBankIndex === -1) {
      console.warn(
        "[QUESTION_BANK_USAGE] No Question Bank Access attribute found in usage document"
      );
      return {
        success: true,
        message: "No Question Bank Access usage tracking configured",
      };
    }

    const currentAttr = usage.usageAttributes[questionBankIndex];
    const newUtilized = Math.max(0, currentAttr.utilized + delta);
    const newRemaining = Math.max(0, currentAttr.entitled - newUtilized);

    // Update the usage attribute
    usage.usageAttributes[questionBankIndex].utilized = newUtilized;
    usage.usageAttributes[questionBankIndex].remaining = newRemaining;

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
      "[QUESTION_BANK_USAGE] Error updating question bank usage:",
      error
    );
    return { success: false, error: error.message };
  }
}

/**
 * Get current question bank usage stats
 * @param {string} tenantId - Tenant ID
 * @param {string} ownerId - Owner ID (optional)
 */
async function getQuestionBankUsageStats(tenantId, ownerId) {
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

    // Find Question Bank Access attribute
    const questionBankAttr = usage.usageAttributes.find(
      (attr) => attr.type === "Question Bank Access"
    );

    if (!questionBankAttr) {
      // Return unlimited access if not configured
      return {
        utilized: 0,
        entitled: Infinity,
        remaining: Infinity,
        percentage: 0,
        fromDate: usage.fromDate,
        toDate: usage.toDate,
      };
    }

    return {
      utilized: questionBankAttr.utilized || 0,
      entitled: questionBankAttr.entitled || 0,
      remaining: questionBankAttr.remaining || 0,
      percentage:
        questionBankAttr.entitled > 0
          ? Math.round(
              (questionBankAttr.utilized / questionBankAttr.entitled) * 100
            )
          : 0,
      fromDate: usage.fromDate,
      toDate: usage.toDate,
    };
  } catch (error) {
    console.error(
      "[QUESTION_BANK_USAGE] Error getting question bank usage stats:",
      error
    );
    return null;
  }
}

module.exports = {
  checkQuestionBankUsageLimit,
  updateQuestionBankUsage,
  getQuestionBankUsageStats,
};
