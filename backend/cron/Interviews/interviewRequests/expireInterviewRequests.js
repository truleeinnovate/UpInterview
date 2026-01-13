// cron/interviewRequests/expireInterviewRequests.js
const cron = require('node-cron');
const mongoose = require('mongoose');
const { expireInterviewRequests } = require('../../../services/interviews/interviewRequestExpiryService');

async function waitForConnection() {
  if (mongoose.connection.readyState === 1) {
    return; // Already connected
  }
  return new Promise((resolve, reject) => {
    mongoose.connection.once('connected', resolve);
    mongoose.connection.once('error', reject);
  });
}

cron.schedule("*/5 * * * *", async () => {
  try {
    await waitForConnection(); // Wait until connected
    await expireInterviewRequests();
  } catch (err) {
    console.error('[Cron] Expiry job failed:', err);
  }
});