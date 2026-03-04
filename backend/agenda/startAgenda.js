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

    // Process any overdue jobs immediately
    const overdueCount = await agenda.jobs({
      name: "round-no-show",
      nextRunAt: { $lte: new Date() },
      lockedAt: null,
    });
    if (overdueCount.length > 0) {
      console.log(`[AGENDA] ⚠️ Found ${overdueCount.length} overdue round-no-show jobs — will process shortly`);
    }
  } catch (err) {
    console.error("[AGENDA] ❌ Failed to start:", err.message);
    console.error("[AGENDA] Full error:", err);
  }
};
