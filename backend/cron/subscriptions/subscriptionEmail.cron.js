const cron = require("node-cron");
const {
  runSubscriptionEmailReminderJob
} = require("../../services/subscriptions/subscriptionEmail.service");
// console.log("[Cron] Subscription Email Cron file loaded");

// 🔁 Runs daily at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    await runSubscriptionEmailReminderJob({
      enableTest10s: false, // 🔥 SET FALSE AFTER TESTING
    });
    console.log("[Cron] Subscription email job completed");
  } catch (err) {
    console.error("[Cron] Subscription email job failed:", err);
  }
});
