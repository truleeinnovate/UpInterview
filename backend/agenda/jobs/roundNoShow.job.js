const { InterviewRounds } = require("../../models/Interview/InterviewRounds");
const { MockInterviewRound } = require("../../models/Mockinterview/mockinterviewRound");
const { processAutoSettlement } = require("../../utils/interviewWalletUtil");
const { updateSchedulingStatus } = require("../../services/interviewerSchedulingService");

module.exports = (agenda) => {
  agenda.define(
    "round-no-show",
    { lockLifetime: 60000 }, // Lock job for 60s to prevent duplicate execution
    async (job) => {
      const { roundId: rawRoundId, isMock } = job.attrs.data;
      // Convert to plain string — Agenda uses its own mongodb driver with a
      // different BSON version than mongoose, so ObjectIds are incompatible
      const roundId = typeof rawRoundId === "string" ? rawRoundId : rawRoundId.toString();

      console.log("\n[NoShow-Job] ========== round-no-show JOB FIRED ==========");
      console.log("[NoShow-Job] roundId:", roundId, "| isMock:", isMock);

      // Use the correct model based on interview type
      const Model = isMock ? MockInterviewRound : InterviewRounds;

      await processNoShow(isMock, Model, roundId);

      console.log("[NoShow-Job] ========== round-no-show JOB COMPLETE ==========\n");
    }
  );
};

async function processNoShow(isMock, Model, roundId) {
  // ============================================================
  // Fetch the round to check its current status
  // ============================================================
  const existingRound = await Model.findById(roundId);

  if (!existingRound) {
    console.log("[NoShow-Job] ❌ Round not found → skipping");
    return;
  }

  // Assessment rounds — skip
  if (existingRound.roundTitle === "Assessment" && existingRound?.assessmentId) {
    console.log("[NoShow-Job] ❌ Round is Assessment → skipping");
    return;
  }

  const currentStatus = existingRound.status;
  console.log("[NoShow-Job] Current status:", currentStatus, "| interviewerType:", existingRound.interviewerType);

  // RequestSent rounds are handled by interviewRequestExpiryService.js
  // This job only handles Scheduled/Rescheduled rounds
  if (!["Scheduled", "Rescheduled"].includes(currentStatus)) {
    console.log("[NoShow-Job] ❌ Status is", currentStatus, "(not Scheduled/Rescheduled) → skipping");
    return;
  }

  // ============================================================
  // Scheduled/Rescheduled → Check who joined → NoShow
  // ============================================================
  console.log("[NoShow-Job] 📌 Checking participants for Scheduled/Rescheduled round");

  // Check participants
  const participants = existingRound.participants || [];
  const candidateJoined = participants.some(
    (p) => p.role === "Candidate" && p.status === "Joined"
  );
  const interviewerJoined = participants.some(
    (p) => p.role === "Interviewer" && p.status === "Joined"
  );

  console.log("[NoShow-Job] candidateJoined:", candidateJoined, "| interviewerJoined:", interviewerJoined);

  // Both joined → no action needed
  if (candidateJoined && interviewerJoined) {
    console.log("[NoShow-Job] ✅ Both joined — no NoShow, clearing job ID only");
    await Model.findByIdAndUpdate(roundId, { $set: { noShowJobId: null } });
    return;
  }

  // Determine clear reason based on who didn't join
  let reasonCode;
  let comment;

  if (!candidateJoined && !interviewerJoined) {
    reasonCode = "SYSTEM_AUTO_NOSHOW_BOTH";
    comment = "Neither candidate nor interviewer joined within 20 minutes of the scheduled interview time. Auto-marked by system.";
  } else if (!interviewerJoined) {
    reasonCode = "SYSTEM_AUTO_NOSHOW_INTERVIEWER";
    comment = "Interviewer did not join within 20 minutes of the scheduled interview time. Candidate was present. Auto-marked by system.";
  } else {
    reasonCode = "SYSTEM_AUTO_NOSHOW_CANDIDATE";
    comment = "Candidate did not join within 20 minutes of the scheduled interview time. Interviewer was present. Auto-marked by system.";
  }

  // Atomic update to NoShow with clear reason
  const updated = await Model.findOneAndUpdate(
    {
      _id: roundId,
      status: { $in: ["Scheduled", "Rescheduled"] },
    },
    {
      $set: {
        status: "NoShow",
        noShowJobId: null,
        meetingId: "",
        meetPlatform: "",
        interviewers: [],
        interviewerType: ""
      },
      $push: {
        history: {
          action: "NoShow",
          reasonCode: reasonCode,
          comment: comment,
          scheduledAt: existingRound.dateTime,
        },
      },
    },
    { new: false }
  );

  if (!updated) {
    console.log("[NoShow-Job] ❌ Could not update (already changed) → skipping");
    return;
  }

  console.log("[NoShow-Job] ✅ Status updated to NoShow | reason:", reasonCode);

  // Update InterviewerScheduling status to NoShow
  try {
    await updateSchedulingStatus(roundId, "NoShow", reasonCode);
    console.log("[NoShow-Job] ✅ InterviewerScheduling updated to NoShow for round:", roundId);
  } catch (schedError) {
    console.error("[NoShow-Job] ❌ Error updating InterviewerScheduling:", schedError.message);
  }

  // Auto-settlement for scheduler-triggered NoShow
  try {
    if (!interviewerJoined) {
      console.log("[NoShow-Job] 📤 Calling processAutoSettlement...");
      const result = await processAutoSettlement({
        roundId: roundId,
        action: "NoShow",
        reasonCode: reasonCode,
        isMockInterview: isMock || false,
      });
      console.log("[NoShow-Job] ✅ Auto-settlement completed:", JSON.stringify(result));
    }
  } catch (settlementError) {
    console.error("[NoShow-Job] ❌ Auto-settlement error:", settlementError.message);
    // Round is already marked NoShow — settlement failure is logged but doesn't revert
  }
}
