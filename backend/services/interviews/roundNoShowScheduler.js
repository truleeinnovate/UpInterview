const agenda = require("../../agenda");

const NO_SHOW_DELAY_MINUTES = 20;

function extractStartDate(dateTimeStr) {
  if (!dateTimeStr || typeof dateTimeStr !== "string") return null;

  const [startPart] = dateTimeStr.split(" - ");
  const [date, time, meridian] = startPart.split(" ");

  if (!date || !time || !meridian) return null;

  const [dd, mm, yyyy] = date.split("-");
  let [hours, minutes] = time.split(":").map(Number);

  if (meridian === "PM" && hours !== 12) hours += 12;
  if (meridian === "AM" && hours === 12) hours = 0;

  return new Date(Number(yyyy), Number(mm) - 1, Number(dd), hours, minutes);
}

async function scheduleOrRescheduleNoShow(roundDoc) {
  const { InterviewRounds } = require("../../models/Interview/InterviewRounds");

  // ================ CRITICAL GUARDS ================

  // 1. Only for Internal interviews
  if (roundDoc.interviewerType !== "Internal") {
    await cancelNoShow(roundDoc);
    return;
  }

  // 2. Only when status is exactly "Scheduled"
  // if (roundDoc.status !== "Scheduled") {
  //   await cancelNoShow(roundDoc);
  //   return;
  // }

  // 2. Only when status is exactly "Scheduled" or "Rescheduled"
  if (!["Scheduled", "Rescheduled"].includes(roundDoc.status)) {
    await cancelNoShow(roundDoc);
    return;
  }

  // 3. Must have a valid dateTime
  if (!roundDoc.dateTime) {
    await cancelNoShow(roundDoc);
    return;
  }

  // ================ Parse interview start time ================
  const interviewStart = extractStartDate(roundDoc.dateTime);
  if (!interviewStart) {
    await cancelNoShow(roundDoc);
    return;
  }

  // ================ Calculate when to run the no-show job ================
  const runAt = new Date(
    interviewStart.getTime() + NO_SHOW_DELAY_MINUTES * 60 * 1000,
  );

  // Don't schedule jobs in the past
  if (runAt <= new Date()) {
    await cancelNoShow(roundDoc);
    return;
  }

  // ================ Cancel any existing job ================
  if (roundDoc.noShowJobId) {
    try {
      await agenda.cancel({ _id: roundDoc.noShowJobId });
    } catch (err) {
      console.warn("[NoShow] Failed to cancel old job:", err.message);
    }
  }

  // ================ Schedule new job ================
  const job = await agenda.schedule(runAt, "round-no-show", {
    roundId: roundDoc._id.toString(),
  });

  // const newJobId = job.attrs._id;
  const newJobId = job.attrs._id.toString();

  console.log(`[NoShow] Scheduled job for round ${roundDoc._id}`);

  console.log(`newJobId ${newJobId}`);

  // ================ KEY FIX: Only update DB if job ID actually changed ================
  // This prevents infinite loop: update → hook → reschedule → update → ...
  if (newJobId.toString() !== (roundDoc.noShowJobId?.toString() || "")) {
    // await InterviewRounds.findByIdAndUpdate(
    //   roundDoc._id,
    //   { noShowJobId: newJobId },
    //   { timestamps: false }, // optional: avoid updating updatedAt unnecessarily
    // );
    // Use direct MongoDB update to bypass Mongoose hooks
    await InterviewRounds.collection.updateOne(
      { _id: roundDoc._id },
      { $set: { noShowJobId: newJobId } },
    );
    console.log(`[NoShow] Updated noShowJobId for round ${roundDoc._id}`);
  }
  // If same job ID (very rare), skip update → no hook triggered → no loop!
}

async function cancelNoShow(roundDoc) {
  const { InterviewRounds } = require("../../models/Interview/InterviewRounds");

  if (roundDoc.noShowJobId) {
    try {
      await agenda.cancel({ _id: roundDoc.noShowJobId });
    } catch (err) {
      console.warn(
        "[NoShow] Failed to cancel job during cleanup:",
        err.message,
      );
    }

    // Only update if noShowJobId is currently set
    // await InterviewRounds.findByIdAndUpdate(
    //   roundDoc._id,
    //   { noShowJobId: null },
    //   { timestamps: false },
    // );
    // Use direct MongoDB update to bypass hooks
    await InterviewRounds.collection.updateOne(
      { _id: roundDoc._id },
      { $set: { noShowJobId: null } },
    );
  }
}

module.exports = { scheduleOrRescheduleNoShow };
