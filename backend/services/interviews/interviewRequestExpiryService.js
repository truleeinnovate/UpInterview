const mongoose = require('mongoose');
const InterviewRequest = require('../../models/InterviewRequest');
const { InterviewRounds } = require("../../models/Interview/InterviewRounds");
const { MockInterviewRound } = require("../../models/Mockinterview/mockinterviewRound");
const { processAutoSettlement, processWithdrawnRefund } = require("../../utils/interviewWalletUtil");

async function expireInterviewRequests() {
  const now = new Date();
  console.log('[Cron] Interview request expiry started at', now.toISOString());

  // 1. Find expired in-progress requests
  const expiredRequests = await InterviewRequest.find({
    status: "inprogress",
    expiryDateTime: { $lte: now }
  }).select("roundId isMockInterview");

  if (!expiredRequests.length) {
    console.log('[Cron] No expired requests found');
    return;
  }

  // 2. Expire them (same for mock & non-mock)
  await InterviewRequest.updateMany(
    {
      status: "inprogress",
      expiryDateTime: { $lte: now }
    },
    {
      $set: {
        status: "expired",
        respondedAt: now
      }
    }
  );

  console.log(`[Cron] Expired ${expiredRequests.length} requests`);

  // 3. Process affected rounds
  const roundIds = [...new Set(expiredRequests.map(r => r.roundId?.toString()).filter(Boolean))];

  for (const roundId of roundIds) {
    // Find one request to know if it's mock or real (we only need one per round)
    const sampleRequest = expiredRequests.find(r => r.roundId?.toString() === roundId);
    const isMock = sampleRequest?.isMockInterview === true;

    if (isMock) {
      await evaluateMockRoundAfterExpiry(roundId, now);
    } else {
      await evaluateRoundAfterExpiry(roundId, now);
    }
  }

  console.log('[Cron] Interview request expiry completed');
}

// ────────────────────────────────────────────────
//  Original logic - for normal (non-mock) rounds
// ────────────────────────────────────────────────
async function evaluateRoundAfterExpiry(roundId, now) {
  const stats = await InterviewRequest.aggregate([
    { $match: { roundId: new mongoose.Types.ObjectId(roundId) } },
    {
      $group: {
        _id: null,
        accepted: { $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] } },
        declined: { $sum: { $cond: [{ $eq: ["$status", "declined"] }, 1, 0] } },
        expired: { $sum: { $cond: [{ $eq: ["$status", "expired"] }, 1, 0] } },
        total: { $sum: 1 }
      }
    }
  ]);

  if (!stats.length) return;

  const { accepted, declined, expired, total } = stats[0];

  // If anyone accepted → do nothing
  if (accepted > 0) return;

  // Decide final round status (same logic as before)
  const finalStatus =
    declined === total ? "Rejected" : "Incomplete";

  await InterviewRounds.findByIdAndUpdate(
    roundId,
    {
      $set: {
        status: finalStatus,
        rejectionReason: "No interviewer accepted within acceptance window",
        currentAction: "Interviewer_NoShow",
        currentActionReason: "Auto-expired by system",
        noShowJobId: null,
        updatedAt: now
      },
      $push: {
        history: {
          scheduledAt: now,
          action: "Expired",
          reasonCode: "SYSTEM_AUTO_INCOMPLETE",
          comment: "No interviewer accepted the request before the scheduled interview time. Auto-marked by system.",
          participants: [],
          updatedBy: null,
          updatedAt: now
        }
      }
    }
  );

  console.log(`[Cron] Round ${roundId} marked as ${finalStatus} (real)`);

  // Withdraw any remaining inprogress requests for this round
  try {
    const withdrawResult = await InterviewRequest.updateMany(
      { roundId: new mongoose.Types.ObjectId(roundId), status: "inprogress" },
      { $set: { status: "withdrawn", respondedAt: now } }
    );
    console.log(`[Cron] Withdrew ${withdrawResult.modifiedCount} remaining requests for round ${roundId}`);
  } catch (withdrawErr) {
    console.error(`[Cron] Error withdrawing requests for round ${roundId}:`, withdrawErr.message);
  }

  // Auto-settlement: refund selection hold back to org
  try {
    await processWithdrawnRefund({ roundId });
    console.log(`[Cron] ✅ Selection hold refunded for round ${roundId}`);
  } catch (refundErr) {
    console.error(`[Cron] ❌ Selection hold refund error for round ${roundId}:`, refundErr.message);
  }
}

// ────────────────────────────────────────────────
//  Almost identical logic - but for MockInterviewRound
// ────────────────────────────────────────────────
async function evaluateMockRoundAfterExpiry(roundId, now) {
  const stats = await InterviewRequest.aggregate([
    { $match: { roundId: new mongoose.Types.ObjectId(roundId) } },
    {
      $group: {
        _id: null,
        accepted: { $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] } },
        declined: { $sum: { $cond: [{ $eq: ["$status", "declined"] }, 1, 0] } },
        expired: { $sum: { $cond: [{ $eq: ["$status", "expired"] }, 1, 0] } },
        total: { $sum: 1 }
      }
    }
  ]);

  if (!stats.length) return;

  const { accepted, declined, expired, total } = stats[0];

  // If anyone accepted → do nothing (same rule)
  if (accepted > 0) return;

  // Same decision logic as normal rounds
  const finalStatus =
    declined === total ? "Rejected" : "Incomplete";

  // For mock rounds we use different status values in some cases
  // but here we keep "Rejected" / "Incomplete" — change if your mock flow uses different enums
  await MockInterviewRound.findByIdAndUpdate(
    roundId,
    {
      $set: {
        status: finalStatus,
        currentAction: "Interviewer_NoShow",
        currentActionReason: "Auto-expired by system",
        noShowJobId: null,
        updatedAt: now
      },
      $push: {
        history: {
          scheduledAt: now,
          action: "Expired",
          reasonCode: "SYSTEM_AUTO_INCOMPLETE",
          comment: "No interviewer accepted the request before the scheduled interview time. Auto-marked by system.",
          interviewers: [],
          createdBy: null,
        }
      }
    }
  );

  console.log(`[Cron] Mock round ${roundId} marked as ${finalStatus}`);

  // Withdraw any remaining inprogress requests for this round
  try {
    const withdrawResult = await InterviewRequest.updateMany(
      { roundId: new mongoose.Types.ObjectId(roundId), status: "inprogress" },
      { $set: { status: "withdrawn", respondedAt: now } }
    );
    console.log(`[Cron] Withdrew ${withdrawResult.modifiedCount} remaining requests for mock round ${roundId}`);
  } catch (withdrawErr) {
    console.error(`[Cron] Error withdrawing requests for mock round ${roundId}:`, withdrawErr.message);
  }

  // Auto-settlement: refund selection hold back to org
  try {
    await processWithdrawnRefund({ roundId });
    console.log(`[Cron] ✅ Selection hold refunded for mock round ${roundId}`);
  } catch (refundErr) {
    console.error(`[Cron] ❌ Selection hold refund error for mock round ${roundId}:`, refundErr.message);
  }
}

module.exports = { expireInterviewRequests };