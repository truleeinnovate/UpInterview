const cron = require("node-cron");
const {
  runScheduleAssessmentStatusUpdateJob,
} = require("../../controllers/candidateAssessmentController");

const {
  checkAndUpdateExpiredAssessments,
} = require("../../controllers/candidateAssessmentController");

cron.schedule("*/5 * * * *", async () => {
  await runScheduleAssessmentStatusUpdateJob();
  console.log("Schedule assessment status update job executed");
});

// This is used to auto status expiry in candidate assessments
cron.schedule("*/5 * * * *", async () => {
  await checkAndUpdateExpiredAssessments({}, {});
  console.log("Expired candidate assessments job executed");
});
