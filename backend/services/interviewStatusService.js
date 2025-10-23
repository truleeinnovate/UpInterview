const { Interview } = require('../models/Interview/Interview');
const { InterviewRounds } = require('../models/Interview/InterviewRounds');
const { createInterviewStatusUpdateNotification } = require('../controllers/PushNotificationControllers/pushNotificationInterviewController');
const cron = require('node-cron');

const TERMINAL_ROUND_STATUSES = ["Completed", "Selected", "Cancelled", "Rejected"];

/**
 * Determine new interview status based on its rounds
 */
const determineInterviewStatusFromRounds = (rounds) => {
  if (!rounds || rounds.length === 0) return null;

  const allDraft = rounds.every(r => r.status === "Draft");
  if (allDraft) return null; // no change

  const allCancelled = rounds.every(r => r.status === "Cancelled");
  if (allCancelled) return "Cancelled";

  const allTerminal = rounds.every(r => TERMINAL_ROUND_STATUSES.includes(r.status));
  if (allTerminal) return "Completed";

  const hasActive = rounds.some(r =>
    ["InProgress", "Scheduled", "RequestSent", "Rescheduled"].includes(r.status)
  );
  if (hasActive) return "In Progress";

  // If some are mixed terminal/non-terminal → treat as In Progress
  const hasAnyTerminal = rounds.some(r => TERMINAL_ROUND_STATUSES.includes(r.status));
  if (hasAnyTerminal) return "In Progress";

  return null;
};

/**
 * Update a single interview’s status based on rounds
 */
const updateInterviewStatusCore = async (interviewId) => {
  try {
    const interview = await Interview.findById(interviewId);
    if (!interview) return null;

    // Skip completed interviews
    if (interview.status === "Completed" || interview.status === "Cancelled") return null;

    const rounds = await InterviewRounds.find({ interviewId });
    if (!rounds || rounds.length === 0) return null;

    const newStatus = determineInterviewStatusFromRounds(rounds);
    if (!newStatus) return null; // No change needed

    if (newStatus !== interview.status) {
      const oldStatus = interview.status;
      interview.status = newStatus;
      await interview.save();

      console.log(`[CRON] Interview ${interviewId} status changed: ${oldStatus} → ${newStatus}`);

      try {
        await createInterviewStatusUpdateNotification(interview, oldStatus, newStatus);
      } catch (notifErr) {
        console.error(`[CRON] Notification error for interview ${interviewId}:`, notifErr);
      }
    }

    return interview;
  } catch (error) {
    console.error(`[CRON] Error updating interview ${interviewId}:`, error);
    return null;
  }
};

/**
 * Process all interviews periodically
 */
const processAllInterviews = async () => {
  try {
    console.log(`[CRON] Checking interviews at ${new Date().toLocaleTimeString()}`);

    const interviews = await Interview.find({
      status: { $in: ["Draft", "In Progress", "Cancelled", "Rejected", "Selected"] }
    });

    console.log(`[CRON] Found ${interviews.length} interviews to verify`);

    for (const interview of interviews) {
      await updateInterviewStatusCore(interview._id);
    }

    console.log(`[CRON] Interview status verification completed`);
  } catch (error) {
    console.error(`[CRON] Error in processAllInterviews:`, error);
  }
};

/**
 * Setup cron job to run every minute
 */
const setupInterviewStatusCronJob = () => {
  cron.schedule('*/5 * * * *', async () => {
    await processAllInterviews();
  }, {
    timezone: 'Asia/Kolkata'
  });

  console.log('[CRON] Interview status checker running every 5 minutes (Asia/Kolkata)');
};

module.exports = {
  updateInterviewStatusCore,
  processAllInterviews,
  setupInterviewStatusCronJob
};
