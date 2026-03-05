const agenda = require("./index");

// load jobs
require("./jobs/roundNoShow.job")(agenda);
require("./jobs/email.job")(agenda);

module.exports = async function startAgenda() {
  try {
    // Wait for Agenda's MongoDB connection to be fully established
    // This prevents "Cannot read properties of undefined (reading 'insertOne')" on Azure cold starts
    console.log("[AGENDA] ⏳ Waiting for MongoDB connection...");
    await agenda.waitForReady(30000); // 30 second timeout
    console.log("[AGENDA] ✅ MongoDB connection confirmed");

    await agenda.start();
    console.log("[AGENDA] ✅ Started successfully — processing jobs every 30s");

    // Process any overdue/missed jobs immediately after restart
    // This is critical for Azure App Service where restarts can cause missed jobs
    const overdueJobs = await agenda.jobs({
      name: "round-no-show",
      nextRunAt: { $lte: new Date() },
      lastFinishedAt: null,
    });
    if (overdueJobs.length > 0) {
      console.log(`[AGENDA] ⚠️ Found ${overdueJobs.length} overdue round-no-show jobs — unlocking and processing now`);
      // Unlock any stuck jobs so they run on the next poll cycle
      for (const job of overdueJobs) {
        job.attrs.lockedAt = null;
        await job.save();
      }
      console.log(`[AGENDA] ✅ Unlocked ${overdueJobs.length} overdue jobs — will process within 30s`);
    }
  } catch (err) {
    console.error("[AGENDA] ❌ Failed to start:", err.message);
    console.error("[AGENDA] Full error:", err);
  }
};
