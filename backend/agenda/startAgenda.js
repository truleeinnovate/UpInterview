const agenda = require("./index");

// load jobs
require("./jobs/roundNoShow.job")(agenda);

module.exports = async function startAgenda() {
  try {
    // Agenda v5 with db.address auto-connects; just need to start processing
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
