// cron/Interviews/roundNoShow/roundNoShowCron.js
// DEV replacement for Agenda-based NoShow scheduling
// Runs every minute to check for Scheduled/Rescheduled rounds
// where interview time + 5 min has passed → marks as NoShow

const cron = require('node-cron');
const mongoose = require('mongoose');
const { InterviewRounds } = require('../../../models/Interview/InterviewRounds');
const { MockInterviewRound } = require('../../../models/Mockinterview/mockinterviewRound');
const { processAutoSettlement } = require('../../../utils/interviewWalletUtil');
const { extractStartDate, NO_SHOW_DELAY_MINUTES } = require('../../../services/interviews/roundNoShowScheduler');

async function waitForConnection() {
    if (mongoose.connection.readyState === 1) {
        return; // Already connected
    }
    return new Promise((resolve, reject) => {
        mongoose.connection.once('connected', resolve);
        mongoose.connection.once('error', reject);
    });
}

// ────────────────────────────────────────────────
// Core NoShow processing (same logic as roundNoShow.job.js)
// ────────────────────────────────────────────────
async function processNoShow(isMock, Model, roundId) {
    const existingRound = await Model.findById(roundId);

    if (!existingRound) {
        console.log("[NoShow-Cron] ❌ Round not found → skipping");
        return;
    }

    // Assessment rounds — skip
    if (existingRound.roundTitle === "Assessment" && existingRound?.assessmentId) {
        console.log("[NoShow-Cron] ❌ Round is Assessment → skipping");
        return;
    }

    const currentStatus = existingRound.status;
    console.log("[NoShow-Cron] Current status:", currentStatus, "| interviewerType:", existingRound.interviewerType);

    // RequestSent rounds are handled by interviewRequestExpiryService.js
    // This job only handles Scheduled/Rescheduled rounds
    if (!["Scheduled", "Rescheduled"].includes(currentStatus)) {
        return; // Silently skip — not an error, just not applicable
    }

    // ============================================================
    // Scheduled/Rescheduled → Check who joined → NoShow
    // ============================================================
    console.log("[NoShow-Cron] 📌 Checking participants for round", roundId);

    // Check participants
    const participants = existingRound.participants || [];
    const candidateJoined = participants.some(
        (p) => p.role === "Candidate" && p.status === "Joined"
    );
    const interviewerJoined = participants.some(
        (p) => p.role === "Interviewer" && p.status === "Joined"
    );

    console.log("[NoShow-Cron] candidateJoined:", candidateJoined, "| interviewerJoined:", interviewerJoined);

    // Both joined → no action needed
    if (candidateJoined && interviewerJoined) {
        console.log("[NoShow-Cron] ✅ Both joined — no NoShow");
        return;
    }

    // Determine clear reason based on who didn't join
    let reasonCode;
    let comment;

    if (!candidateJoined && !interviewerJoined) {
        reasonCode = "SYSTEM_AUTO_NOSHOW_BOTH";
        comment = "Neither candidate nor interviewer joined within the scheduled interview time. Auto-marked by system.";
    } else if (!interviewerJoined) {
        reasonCode = "SYSTEM_AUTO_NOSHOW_INTERVIEWER";
        comment = "Interviewer did not join within the scheduled interview time. Candidate was present. Auto-marked by system.";
    } else {
        reasonCode = "SYSTEM_AUTO_NOSHOW_CANDIDATE";
        comment = "Candidate did not join within the scheduled interview time. Interviewer was present. Auto-marked by system.";
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
        console.log("[NoShow-Cron] ❌ Could not update (already changed) → skipping");
        return;
    }

    console.log("[NoShow-Cron] ✅ Status updated to NoShow | reason:", reasonCode);

    // Auto-settlement for NoShow
    try {
        console.log("[NoShow-Cron] 📤 Calling processAutoSettlement...");
        const result = await processAutoSettlement({
            roundId: roundId.toString(),
            action: "NoShow",
            reasonCode: reasonCode,
            isMockInterview: isMock || false,
        });
        console.log("[NoShow-Cron] ✅ Auto-settlement completed:", JSON.stringify(result));
    } catch (settlementError) {
        console.error("[NoShow-Cron] ❌ Auto-settlement error:", settlementError.message);
        // Round is already marked NoShow — settlement failure is logged but doesn't revert
    }
}

// ────────────────────────────────────────────────
// Cron: Check all Scheduled/Rescheduled rounds
// ────────────────────────────────────────────────
async function checkNoShowRounds() {
    const now = new Date();

    // Process real interview rounds
    await checkNoShowForModel(InterviewRounds, false, now);

    // Process mock interview rounds
    await checkNoShowForModel(MockInterviewRound, true, now);
}

async function checkNoShowForModel(Model, isMock, now) {
    const label = isMock ? "Mock" : "Real";

    // Find all rounds in Scheduled/Rescheduled status
    const rounds = await Model.find({
        status: { $in: ["Scheduled", "Rescheduled"] },
    }).select("_id dateTime roundTitle assessmentId").lean();

    if (!rounds.length) return;

    for (const round of rounds) {
        // Skip assessment rounds
        if (round.roundTitle === "Assessment" && round?.assessmentId) continue;

        const interviewStart = extractStartDate(round.dateTime);
        if (!interviewStart) continue;

        // Check if interview time + delay has passed
        const noShowTime = new Date(interviewStart.getTime() + NO_SHOW_DELAY_MINUTES * 60 * 1000);

        if (noShowTime > now) continue; // Not yet time to check

        console.log(`[NoShow-Cron] ${label} round ${round._id} NoShow time (${round.dateTime} + ${NO_SHOW_DELAY_MINUTES}min) has passed → processing`);

        try {
            await processNoShow(isMock, Model, round._id);
        } catch (err) {
            console.error(`[NoShow-Cron] Error processing ${label} round ${round._id}:`, err.message);
        }
    }
}

// Schedule: runs every minute
cron.schedule("* * * * *", async () => {
    try {
        await waitForConnection();
        await checkNoShowRounds();
    } catch (err) {
        console.error('[NoShow-Cron] Job failed:', err);
    }
});

console.log("[NoShow-Cron] ✅ NoShow cron job registered (runs every minute)");
