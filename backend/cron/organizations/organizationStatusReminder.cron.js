const cron = require("node-cron");
const {
  runOrganizationStatusReminderJob,
} = require("../../services/organizations/organizationStatusReminder.service");

console.log("[Cron] Organization Status Reminder Cron loaded");


cron.schedule("0 0 * * *", async () => {
  try {
    console.log("[Cron] Organization status reminder started");

    await runOrganizationStatusReminderJob({
      enableTest10s: false, // 🔥 SET FALSE AFTER TESTING
    });

    console.log("[Cron] Organization status reminder completed");
  } catch (err) {
    console.error("[Cron] Organization status reminder failed:", err);
  }
});

/*
// ✅ PRODUCTION (enable after testing)
cron.schedule("0 0 * * *", async () => {
  await runOrganizationStatusReminderJob({ enableTest10s: false });
});
*/
