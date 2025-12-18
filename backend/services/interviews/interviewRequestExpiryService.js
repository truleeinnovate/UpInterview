const InterviewRequest = require('../../models/InterviewRequest');
const { InterviewRounds } = require("../../models/Interview/InterviewRounds");

async function expireInterviewRequests() {
  const now = new Date();
  console.log('[Cron] Interview request expiry started at', now.toISOString());

  // 1. Find expired in-progress requests
  const expiredRequests = await InterviewRequest.find({
    status: "inprogress",
    expiryDateTime: { $lte: now }
  }).select("roundId");

  if (!expiredRequests.length) {
    console.log('[Cron] No expired requests found');
    return;
  }

  // 2. Expire them
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
    await evaluateRoundAfterExpiry(roundId, now);
  }

  console.log('[Cron] Interview request expiry completed');
}

async function evaluateRoundAfterExpiry(roundId, now) {
  const stats = await InterviewRequest.aggregate([
    { $match: { roundId } },
    {
      $group: {
        _id: null,
        accepted: { $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] } },
        declined: { $sum: { $cond: [{ $eq: ["$status", "declined"] }, 1, 0] } },
        expired:  { $sum: { $cond: [{ $eq: ["$status", "expired"] }, 1, 0] } },
        total:    { $sum: 1 }
      }
    }
  ]);

  if (!stats.length) return;

  const { accepted, declined, expired, total } = stats[0];

  // If anyone accepted → do nothing
  if (accepted > 0) return;

  // Decide final round status
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
        updatedAt: now
      },
      $push: {
        history: {
          scheduledAt: now,
          action: "Expired",
          reason: "System auto-expiry (no interviewer response)",
          participants: [],
          updatedBy: null,
          updatedAt: now
        }
      }
    }
  );

  console.log(`[Cron] Round ${roundId} marked as ${finalStatus}`);
}

module.exports = { expireInterviewRequests };