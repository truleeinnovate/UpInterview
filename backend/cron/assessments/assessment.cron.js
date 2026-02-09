const cron = require("node-cron");
const {
  runScheduleAssessmentStatusUpdateJob
} = require("../../controllers/candidateAssessmentController");

cron.schedule("*/5 * * * *", async () => {
  await runScheduleAssessmentStatusUpdateJob();
  console.log("Schedule assessment status update job executed");
});
