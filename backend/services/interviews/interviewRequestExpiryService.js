const mongoose = require('mongoose');
const InterviewRequest = require('../../models/InterviewRequest');
const { InterviewRounds } = require("../../models/Interview/InterviewRounds");
const { MockInterviewRound } = require("../../models/Mockinterview/mockinterviewRound");
const { processAutoSettlement, processWithdrawnRefund } = require("../../utils/interviewWalletUtil");
const { DateTime } = require('luxon');

// ────────────────────────────────────────────────
// Helper: parse "27-02-2026 03:44 PM - 04:44 PM" → Date
// ────────────────────────────────────────────────
function parseInterviewDateTime(dateTimeStr) {
  if (!dateTimeStr || typeof dateTimeStr !== "string") return null;

  const [startPart] = dateTimeStr.split(" - ");
  if (!startPart) return null;

  const [date, time, meridian] = startPart.split(" ");
  if (!date || !time || !meridian) return null;

  const [dd, mm, yyyy] = date.split("-").map(Number);
  let [hours, minutes] = time.split(":").map(Number);

  if (meridian.toUpperCase() === "PM" && hours !== 12) hours += 12;
  if (meridian.toUpperCase() === "AM" && hours === 12) hours = 0;

  const dt = DateTime.fromObject(
    { year: yyyy, month: mm, day: dd, hour: hours, minute: minutes, second: 0 },
    { zone: "Asia/Kolkata" }
  );

  return dt.isValid ? dt.toJSDate() : null;
}

async function expireInterviewRequests() {
  const now = new Date();
  console.log('[Cron] Interview request expiry started at', now.toISOString());

  // ================================================================
  // PASS 1: Expire requests where expiryDateTime has passed (original)
  // ================================================================
  const expiredRequests = await InterviewRequest.find({
    status: "inprogress",
    expiryDateTime: { $lte: now }
  }).select("roundId isMockInterview");

  if (expiredRequests.length) {
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

    console.log(`[Cron] Expired ${expiredRequests.length} requests (by expiryDateTime)`);

    // Process affected rounds
    const roundIds = [...new Set(expiredRequests.map(r => r.roundId?.toString()).filter(Boolean))];

    for (const roundId of roundIds) {
      const sampleRequest = expiredRequests.find(r => r.roundId?.toString() === roundId);
      const isMock = sampleRequest?.isMockInterview === true;

      if (isMock) {
        await evaluateMockRoundAfterExpiry(roundId, now);
      } else {
        await evaluateRoundAfterExpiry(roundId, now);
      }
    }
  } else {
    console.log('[Cron] No expired requests found (by expiryDateTime)');
  }

  // ================================================================
  // PASS 2: Find RequestSent rounds where interview dateTime has passed
  // These still have inprogress requests but expiryDateTime hasn't reached
  // ================================================================
  await expireByInterviewTime(InterviewRounds, false, now);
  await expireByInterviewTime(MockInterviewRound, true, now);

  console.log('[Cron] Interview request expiry completed');
}

// ────────────────────────────────────────────────
// PASS 2 helper: find RequestSent rounds where interview time has passed
// ────────────────────────────────────────────────
async function expireByInterviewTime(Model, isMock, now) {
  const label = isMock ? "Mock" : "Real";

  // Find all rounds still in RequestSent status
  const requestSentRounds = await Model.find({ status: "RequestSent" }).select("_id dateTime").lean();

  if (!requestSentRounds.length) return;

  for (const round of requestSentRounds) {
    const interviewStart = parseInterviewDateTime(round.dateTime);
    if (!interviewStart) continue;

    // Check if interview time has passed
    if (interviewStart > now) continue;

    console.log(`[Cron] ${label} round ${round._id} interview time (${round.dateTime}) has passed → processing`);

    // Check if there are still inprogress requests for this round
    const inprogressCount = await InterviewRequest.countDocuments({
      roundId: round._id,
      status: "inprogress"
    });

    if (inprogressCount === 0) {
      // All requests already expired/declined/withdrawn — just evaluate
      console.log(`[Cron] ${label} round ${round._id} has no inprogress requests, just evaluating`);
    } else {
      // Withdraw remaining inprogress requests (interview time passed, no point waiting)
      await InterviewRequest.updateMany(
        { roundId: round._id, status: "inprogress" },
        { $set: { status: "withdrawn", respondedAt: now } }
      );
      console.log(`[Cron] ${label} round ${round._id}: withdrew ${inprogressCount} inprogress requests`);
    }

    // Now evaluate the round
    if (isMock) {
      await evaluateMockRoundAfterExpiry(round._id.toString(), now);
    } else {
      await evaluateRoundAfterExpiry(round._id.toString(), now);
    }
  }
}

// ────────────────────────────────────────────────
//  For normal (non-mock) InterviewRounds
// ────────────────────────────────────────────────
async function evaluateRoundAfterExpiry(roundId, now) {
  // SAFETY: Only evaluate if interview time has passed
  const round = await InterviewRounds.findById(roundId).select("dateTime").lean();
  if (round?.dateTime) {
    const interviewStart = parseInterviewDateTime(round.dateTime);
    if (interviewStart && interviewStart > now) {
      console.log(`[Cron] Round ${roundId} interview time (${round.dateTime}) hasn't passed yet → skipping`);
      return;
    }
  }

  const stats = await InterviewRequest.aggregate([
    { $match: { roundId: new mongoose.Types.ObjectId(roundId) } },
    {
      $group: {
        _id: null,
        accepted: { $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] } },
        total: { $sum: 1 }
      }
    }
  ]);

  if (!stats.length) return;

  const { accepted, total } = stats[0];

  // Someone accepted → leave the round as-is (probably already moving forward)
  if (accepted > 0) return;

  // ─── No one accepted ─────────────────────────────────────────────
  const rejectionReason = "No interviewer accepted within the acceptance window";

  await InterviewRounds.findByIdAndUpdate(
    roundId,
    {
      $set: {
        status: "Rejected",
        rejectionReason,
        currentAction: "NoInterviewerAccepted",
        currentActionReason: "Auto-rejected by system – no acceptance received",
        noShowJobId: null,
        updatedAt: now
      },
      $push: {
        history: {
          scheduledAt: now,
          action: "Rejected",
          reasonCode: "SYSTEM_NO_ACCEPTANCE",
          comment: `${rejectionReason}. Automatically rejected by system.`,
          participants: [],
          updatedBy: null,
          updatedAt: now
        }
      }
    }
  );

  console.log(`[Cron] Round ${roundId} marked as Rejected (no acceptance – real interview)`);

  // Withdraw any lingering inprogress requests (cleanup)
  try {
    const withdrawResult = await InterviewRequest.updateMany(
      { roundId: new mongoose.Types.ObjectId(roundId), status: "inprogress" },
      { $set: { status: "withdrawn", respondedAt: now } }
    );
    if (withdrawResult.modifiedCount > 0) {
      console.log(`[Cron] Withdrew ${withdrawResult.modifiedCount} remaining inprogress requests for round ${roundId}`);
    }
  } catch (withdrawErr) {
    console.error(`[Cron] Error withdrawing requests for round ${roundId}:`, withdrawErr.message);
  }

  // Refund org's selection hold (no interview happened)
  try {
    await processWithdrawnRefund({ roundId });
    console.log(`[Cron] ✅ Selection hold refunded for round ${roundId}`);
  } catch (refundErr) {
    console.error(`[Cron] ❌ Selection hold refund error for round ${roundId}:`, refundErr.message);
  }
}

// ────────────────────────────────────────────────
//  For MockInterviewRound
// ────────────────────────────────────────────────
async function evaluateMockRoundAfterExpiry(roundId, now) {
  // SAFETY: Only evaluate if interview time has passed
  const mockRound = await MockInterviewRound.findById(roundId).select("dateTime").lean();
  if (mockRound?.dateTime) {
    const interviewStart = parseInterviewDateTime(mockRound.dateTime);
    if (interviewStart && interviewStart > now) {
      console.log(`[Cron] Mock round ${roundId} interview time (${mockRound.dateTime}) hasn't passed yet → skipping`);
      return;
    }
  }

  const stats = await InterviewRequest.aggregate([
    { $match: { roundId: new mongoose.Types.ObjectId(roundId) } },
    {
      $group: {
        _id: null,
        accepted: { $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] } },
        total: { $sum: 1 }
      }
    }
  ]);

  if (!stats.length) return;

  const { accepted, total } = stats[0];

  // Someone accepted → leave the round as-is
  if (accepted > 0) return;

  // ─── No one accepted ─────────────────────────────────────────────
  const rejectionReason = "No mock interviewer accepted within the acceptance window";

  await MockInterviewRound.findByIdAndUpdate(
    roundId,
    {
      $set: {
        status: "Rejected",
        rejectionReason,
        currentAction: "NoInterviewerAccepted",
        currentActionReason: "Auto-rejected by system – no acceptance received",
        noShowJobId: null,
        updatedAt: now
      },
      $push: {
        history: {
          scheduledAt: now,
          action: "Rejected",
          reasonCode: "SYSTEM_NO_ACCEPTANCE",
          comment: `${rejectionReason}. Automatically rejected by system.`,
          interviewers: [],
          createdBy: null,
        }
      }
    }
  );

  console.log(`[Cron] Mock round ${roundId} marked as Rejected (no acceptance – mock interview)`);

  // Withdraw any lingering inprogress requests
  try {
    const withdrawResult = await InterviewRequest.updateMany(
      { roundId: new mongoose.Types.ObjectId(roundId), status: "inprogress" },
      { $set: { status: "withdrawn", respondedAt: now } }
    );
    if (withdrawResult.modifiedCount > 0) {
      console.log(`[Cron] Withdrew ${withdrawResult.modifiedCount} remaining inprogress requests for mock round ${roundId}`);
    }
  } catch (withdrawErr) {
    console.error(`[Cron] Error withdrawing requests for mock round ${roundId}:`, withdrawErr.message);
  }

  // Refund org's selection hold
  try {
    await processWithdrawnRefund({ roundId });
    console.log(`[Cron] ✅ Selection hold refunded for mock round ${roundId}`);
  } catch (refundErr) {
    console.error(`[Cron] ❌ Selection hold refund error for mock round ${roundId}:`, refundErr.message);
  }
}
module.exports = { expireInterviewRequests };