const agenda = require("../../agenda");

// DEV: Reduced from 20 → 2 minutes for testing. Revert to 20 for production.
const NO_SHOW_DELAY_MINUTES = 2;

function extractStartDate(dateTimeStr) {
  console.log("[NoShow] extractStartDate called with:", dateTimeStr);

  if (!dateTimeStr || typeof dateTimeStr !== "string") {
    console.log("[NoShow] ❌ extractStartDate: dateTimeStr is null/undefined or not a string");
    return null;
  }

  const [startPart] = dateTimeStr.split(" - ");
  console.log("[NoShow] extractStartDate: startPart =", startPart);

  const [date, time, meridian] = startPart.split(" ");
  console.log("[NoShow] extractStartDate: date =", date, "time =", time, "meridian =", meridian);

  if (!date || !time || !meridian) {
    console.log("[NoShow] ❌ extractStartDate: Missing date/time/meridian components");
    return null;
  }

  const [dd, mm, yyyy] = date.split("-");
  let [hours, minutes] = time.split(":").map(Number);

  console.log("[NoShow] extractStartDate: dd =", dd, "mm =", mm, "yyyy =", yyyy, "hours =", hours, "minutes =", minutes);

  if (meridian === "PM" && hours !== 12) hours += 12;
  if (meridian === "AM" && hours === 12) hours = 0;

  const result = new Date(Number(yyyy), Number(mm) - 1, Number(dd), hours, minutes);
  console.log("[NoShow] extractStartDate: parsed Date =", result, "| isValid =", !isNaN(result.getTime()));

  return result;
}

async function scheduleOrRescheduleNoShow(roundDoc) {
  console.log("\n[NoShow] ========== scheduleOrRescheduleNoShow CALLED ==========");
  console.log("[NoShow] Round ID:", roundDoc._id);
  console.log("[NoShow] Round Title:", roundDoc.roundTitle);
  console.log("[NoShow] Status:", roundDoc.status);
  console.log("[NoShow] InterviewerType:", roundDoc.interviewerType);
  console.log("[NoShow] DateTime:", roundDoc.dateTime);
  console.log("[NoShow] Existing noShowJobId:", roundDoc.noShowJobId);

  const { InterviewRounds } = require("../../models/Interview/InterviewRounds");



  if (roundDoc.roundTitle === "Assessment" && roundDoc?.assessmentId) {
    console.log("[NoShow-Job] ❌ Round title is Assessment, exiting");
    return;
  }

  // ================ CRITICAL GUARDS ================

  // 1. Only for Internal interviews
  // if (roundDoc.interviewerType !== "Internal") {
  //   console.log("[NoShow] ❌ GUARD 1 FAILED: interviewerType is", roundDoc.interviewerType, "(not Internal) → cancelling");
  //   await cancelNoShow(roundDoc);
  //   return;
  // }


  // console.log("[NoShow] ✅ GUARD 1 PASSED: interviewerType is Internal");

  // 2. Only when status is exactly "Scheduled" or "Rescheduled"
  if (!["Scheduled", "Rescheduled"].includes(roundDoc.status)) {
    console.log("[NoShow] ❌ GUARD 2 FAILED: status is", roundDoc.status, "(not Scheduled/Rescheduled) → cancelling");
    await cancelNoShow(roundDoc);
    return;
  }
  console.log("[NoShow] ✅ GUARD 2 PASSED: status is", roundDoc.status);

  // 3. Must have a valid dateTime
  if (!roundDoc.dateTime) {
    console.log("[NoShow] ❌ GUARD 3 FAILED: dateTime is missing/falsy → cancelling");
    await cancelNoShow(roundDoc);
    return;
  }
  console.log("[NoShow] ✅ GUARD 3 PASSED: dateTime =", roundDoc.dateTime);

  // ================ Parse interview start time ================
  const interviewStart = extractStartDate(roundDoc.dateTime);
  if (!interviewStart) {
    console.log("[NoShow] ❌ PARSE FAILED: Could not extract start date from:", roundDoc.dateTime, "→ cancelling");
    await cancelNoShow(roundDoc);
    return;
  }
  console.log("[NoShow] ✅ PARSE OK: interviewStart =", interviewStart);

  // ================ Calculate when to run the no-show job ================
  const runAt = new Date(
    interviewStart.getTime() + NO_SHOW_DELAY_MINUTES * 60 * 1000,
  );

  console.log("[NoShow] NO_SHOW_DELAY_MINUTES =", NO_SHOW_DELAY_MINUTES);
  console.log("[NoShow] Calculated runAt =", runAt);
  console.log("[NoShow] Current time =", new Date());
  console.log("[NoShow] runAt is in the future?", runAt > new Date());

  // Don't schedule jobs in the past
  if (runAt <= new Date()) {
    console.log("[NoShow] ❌ PAST CHECK FAILED: runAt is in the past or now → cancelling");
    await cancelNoShow(roundDoc);
    return;
  }
  console.log("[NoShow] ✅ PAST CHECK PASSED: runAt is in the future");

  // ================ Cancel any existing job ================
  if (roundDoc.noShowJobId) {
    console.log("[NoShow] Cancelling existing job:", roundDoc.noShowJobId);
    try {
      await agenda.cancel({ _id: roundDoc.noShowJobId });
      console.log("[NoShow] ✅ Old job cancelled successfully");
    } catch (err) {
      console.warn("[NoShow] ⚠️ Failed to cancel old job:", err.message);
    }
  } else {
    console.log("[NoShow] No existing job to cancel");
  }

  // ================ Schedule new job ================
  console.log("[NoShow] Scheduling new job: round-no-show at", runAt, "for roundId:", roundDoc._id.toString());

  try {
    const job = await agenda.schedule(runAt, "round-no-show", {
      roundId: roundDoc._id.toString(),
    });

    const newJobId = job.attrs._id.toString();
    console.log("[NoShow] ✅ Job scheduled successfully! newJobId =", newJobId);

    // ================ KEY FIX: Only update DB if job ID actually changed ================
    // This prevents infinite loop: update → hook → reschedule → update → ...
    if (newJobId.toString() !== (roundDoc.noShowJobId?.toString() || "")) {
      console.log("[NoShow] Job ID changed, updating DB...");
      await InterviewRounds.collection.updateOne(
        { _id: roundDoc._id },
        { $set: { noShowJobId: newJobId } },
      );
      console.log("[NoShow] ✅ Updated noShowJobId in DB for round", roundDoc._id);
    } else {
      console.log("[NoShow] Job ID unchanged, skipping DB update (prevents infinite loop)");
    }
  } catch (err) {
    console.error("[NoShow] ❌ FAILED to schedule job:", err.message);
    console.error("[NoShow] Full error:", err);
  }

  console.log("[NoShow] ========== scheduleOrRescheduleNoShow COMPLETE ==========\n");
}

async function cancelNoShow(roundDoc) {
  console.log("[NoShow] cancelNoShow called for round:", roundDoc._id, "| existing noShowJobId:", roundDoc.noShowJobId);

  const { InterviewRounds } = require("../../models/Interview/InterviewRounds");

  if (roundDoc.roundTitle === "Assessment" && roundDoc?.assessmentId) {
    console.log("[NoShow-Job] ❌ Round title is Assessment, exiting");
    return;
  }

  if (roundDoc.noShowJobId) {
    try {
      await agenda.cancel({ _id: roundDoc.noShowJobId });
      console.log("[NoShow] ✅ Cancelled job:", roundDoc.noShowJobId);
    } catch (err) {
      console.warn("[NoShow] ⚠️ Failed to cancel job during cleanup:", err.message);
    }

    await InterviewRounds.collection.updateOne(
      { _id: roundDoc._id },
      { $set: { noShowJobId: null } },
    );
    console.log("[NoShow] ✅ Cleared noShowJobId in DB");
  } else {
    console.log("[NoShow] No job to cancel (noShowJobId is null)");
  }
}

module.exports = { scheduleOrRescheduleNoShow };
