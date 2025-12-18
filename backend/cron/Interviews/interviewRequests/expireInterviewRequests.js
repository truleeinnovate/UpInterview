const cron = require("node-cron");
const { expireInterviewRequests } = require("../../../services/interviews/interviewRequestExpiryService");

cron.schedule("*/5 * * * *", async () => {
  try {
    await expireInterviewRequests();
  } catch (err) {
    console.error("[Cron] Expiry job failed:", err);
  }
});

