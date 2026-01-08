const { Interview } = require('../models/Interview/Interview');
const { InterviewRounds } = require('../models/Interview/InterviewRounds');
const { createInterviewStatusUpdateNotification } = require('../controllers/PushNotificationControllers/pushNotificationInterviewController');
const cron = require('node-cron');

/**
 * Round statuses that mean interview has started
 */
const ROUND_PROGRESS_STATUSES = [
  "InProgress",
  "Scheduled",
  "Rescheduled",
  "Completed"
];


/**
 * Determine if interview should move to InProgress
 * ONLY returns "InProgress" or null
 */
const determineInterviewStatusFromRounds = (rounds) => {
  if (!rounds || rounds.length === 0) return null;

  const hasProgressRound = rounds.some(round =>
    ROUND_PROGRESS_STATUSES.includes(round.status)
  );

  return hasProgressRound ? "InProgress" : null;
};

/**
 * Update a single interview (Draft → InProgress ONLY)
 */
const updateInterviewStatusCore = async (interviewId) => {
  try {
    const interview = await Interview.findById(interviewId);
    if (!interview) return null;

    // 🔒 Only Draft interviews are auto-updated
    if (interview.status !== "Draft") return null;

    const rounds = await InterviewRounds.find({ interviewId });
    if (!rounds || rounds.length === 0) return null;

    const newStatus = determineInterviewStatusFromRounds(rounds);
    if (newStatus !== "InProgress") return null;

    interview.status = "InProgress";
    await interview.save();

    console.log(
      `[CRON] Interview ${interviewId} status changed: Draft → InProgress`
    );

    try {
      await createInterviewStatusUpdateNotification(
        interview,
        "Draft",
        "InProgress"
      );
    } catch (notifErr) {
      console.error(
        `[CRON] Notification error for interview ${interviewId}:`,
        notifErr
      );
    }

    return interview;
  } catch (error) {
    console.error(`[CRON] Error updating interview ${interviewId}:`, error);
    return null;
  }
};

/**
 * Process all Draft interviews
 */
const processAllInterviews = async () => {
  try {
    console.log(`[CRON] Checking Draft interviews at ${new Date().toLocaleTimeString()}`);

    const interviews = await Interview.find({ status: "Draft" });

    console.log(`[CRON] Found ${interviews.length} Draft interviews`);

    for (const interview of interviews) {
      await updateInterviewStatusCore(interview._id);
    }

    console.log(`[CRON] Draft → InProgress verification completed`);
  } catch (error) {
    console.error(`[CRON] Error in processAllInterviews:`, error);
  }
};

/**
 * Setup cron job (every 5 minutes)
 */
const setupInterviewStatusCronJob = () => {
  cron.schedule(
    '*/5 * * * *',
    async () => {
      await processAllInterviews();
    },
    {
      timezone: 'Asia/Kolkata'
    }
  );

  console.log(
    '[CRON] Interview Draft → InProgress checker running every 5 minutes (Asia/Kolkata)'
  );
};

module.exports = {
  updateInterviewStatusCore,
  processAllInterviews,
  setupInterviewStatusCronJob
};
