const { Agenda } = require("agenda");
const mongoose = require("mongoose");

// Use the MongoDB connection string directly
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

/**
 * Returns true if Agenda's internal MongoDB collection is initialized.
 * Use this before scheduling jobs to avoid "Cannot read properties of undefined (reading 'insertOne')" errors.
 */
agenda.isReady = function () {
  return !!(this._collection);
};

/**
 * Wait for Agenda to be fully connected and ready.
 * Returns a promise that resolves when ready or rejects on timeout.
 * @param {number} timeoutMs - Maximum time to wait (default: 30s)
 */
agenda.waitForReady = function (timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    // Already connected
    if (this._collection) {
      return resolve();
    }

    const timeout = setTimeout(() => {
      reject(new Error(`[AGENDA] Timed out waiting for MongoDB connection after ${timeoutMs}ms`));
    }, timeoutMs);

    this.once("ready", () => {
      clearTimeout(timeout);
      resolve();
    });

    this.once("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
};

module.exports = agenda;
