const { Agenda } = require("agenda");

// Use the MongoDB connection string directly (Agenda v5 recommended approach)
const mongoUri = process.env.MONGODB_URI;

const agenda = new Agenda({
  db: {
    address: mongoUri,
    collection: "agendaJobs",
    options: { useUnifiedTopology: true },
  },
  processEvery: "30 seconds",
  maxConcurrency: 5,
  // Disable automatic index creation — Azure CosmosDB may not support
  // all compound index types that Agenda tries to create
  disableAutoIndex: true,
});

// Log when Agenda connects to MongoDB
agenda.on("ready", () => {
  console.log("[AGENDA] ✅ Connected to MongoDB and ready");
});

agenda.on("error", (err) => {
  console.error("[AGENDA] ❌ Error:", err.message);
});

module.exports = agenda;
