const cron = require('node-cron');
const mongoose = require('mongoose');
const moment = require('moment');
const os = require('os');
const Task = require('../../models/task'); // Fix case-sensitive path on Linux/CI
const { Users } = require('../../models/Users'); // Adjust path as per your structure
const PushNotification = require('../../models/PushNotifications');
//const { sendEmail } = require('../../utils/sendEmail'); // Adjust path as per your structure
//const emailTemplateModel = require('../../models/EmailTemplatemodel'); // Adjust path as per your structure


// Runtime configuration for cron in different environments (e.g., Azure App Service)
const CRON_ENABLED = process.env.TASK_REMINDER_CRON_ENABLED !== 'false'; // default: enabled
const CRON_TZ = process.env.TASK_REMINDER_CRON_TZ || 'UTC'; // Azure typically runs in UTC
const LOCK_TTL_MS = parseInt(process.env.TASK_REMINDER_LOCK_TTL_MS || '', 10) || (55 * 60 * 1000); // 55 mins
const INSTANCE_ID = process.env.WEBSITE_INSTANCE_ID || process.env.HOSTNAME || os.hostname();

// console.log('pushNotificationEmailController.js LOADED at', new Date().toISOString(), ' - If you see this, the file is being executed.');

// Function to manually test the task reminder logic
// function testTaskReminder() {
//   console.log('Manually testing task reminder logic at', new Date().toISOString());

//   runTaskReminderJob();
// }

// The actual cron job logic extracted for reuse
const runTaskReminderJob = async () => {
  // Ensure DB connection is ready to avoid queries before initial connection completes
  if (mongoose.connection.readyState !== 1) {
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    // Skip this run and wait for the connection to be established
    // console.warn('Skipping task reminder job: MongoDB not connected yet.');
    return;
  }

  //console.log('Running automated task email reminder job at', new Date().toISOString());


  try {
    // Find tasks due in the next 24 hours
    const now = moment();
    const dueIn24Hours = moment(now).add(24, 'hours');

    console.log(`Checking tasks due between ${now.toISOString()} and ${dueIn24Hours.toISOString()}`);

    const tasks = await Task.find({
      dueDate: {
        $gte: now.toDate(),
        $lte: dueIn24Hours.toDate()
      }
    });

    if (tasks.length === 0) {
      console.log('No tasks due in the next 24 hours.');
      return;
    }


    
    console.log(`Found ${tasks.length} tasks due in the next 24 hours.`);

   

    for (const task of tasks) {
      // Prefer notifying the assigned user; fall back to ownerId if not present
      const recipientUserId = (task.assignedToId && String(task.assignedToId)) || (task.ownerId && String(task.ownerId));

      if (!recipientUserId) {
        // console.warn(`Task ${task._id} has no assignedToId/ownerId to notify.`);
        continue;
      }

      if (!mongoose.Types.ObjectId.isValid(recipientUserId)) {
        // console.warn(`Invalid user ObjectId ${recipientUserId} for task ${task._id}`);
        continue;
      }

      let user;
      try {
        user = await Users.findById(recipientUserId).select('email firstName lastName');
      } catch (err) {
        console.error(`Error fetching user for ID ${recipientUserId}:`, err.message);
      }

      if (!user || !user.email) {
        // console.warn(`No valid user/email for task ${task._id}`);
        continue;
      }

      const formattedDueDate = moment(task.dueDate).format('MMMM Do, YYYY, h:mm a');

      // Save notification to PushNotifications schema only if one doesn't already exist
      const existingNotification = await PushNotification.findOne({
        ownerId: String(user._id),
        category: 'task_reminder',
        // Rough match to ensure this task's reminder isn't duplicated
        message: `Your task "${task.title}" is due on ${formattedDueDate} status: ${task.status}.`
      });

      if (!existingNotification) {
        const notification = new PushNotification({
          ownerId: String(user._id),
          tenantId: task.tenantId ? String(task.tenantId) : '',
          title: 'Task Due Reminder',
          message: `Your task "${task.title}" is due on ${formattedDueDate} status: ${task.status}.`,
          type: 'system',
          category: 'task_reminder',
          unread: true
        });
        await notification.save();

        // console.log(`Task reminder notification stored for user ${user.email} and task ${task._id}`);
      } else {
        // console.log(`Task reminder notification already exists for user ${user.email} and task ${task._id}, skipping save.`);
      }
    }

    //console.log('Automated task email reminder job completed successfully.');

  } catch (error) {
    console.error('Automated Task Email Reminder Job Error:', error);
  }
};

// Simple distributed lock using MongoDB to prevent duplicate cron runs across multiple instances
// Strategy: try to take over an expired lock via update; if none, attempt to insert a new lock.
// This avoids upsert races that can cause E11000 errors.
async function acquireJobLock(lockName, ttlMs) {
  if (mongoose.connection.readyState !== 1) return false;
  const now = new Date();
  const lockUntil = new Date(now.getTime() + ttlMs);
  const coll = mongoose.connection.collection('jobLocks');

  // 1) Try to update an existing, expired lock atomically
  try {
    const res = await coll.findOneAndUpdate(
      { _id: lockName, lockUntil: { $lte: now } },
      { $set: { lockUntil, holder: INSTANCE_ID, updatedAt: now } },
      { returnDocument: 'after' }
    );
    if (res && res.value) {
      return true; // we took ownership
    }
  } catch (err) {
    console.error('Job lock takeover attempt failed:', err);
    // fall through to insert attempt
  }

  // 2) Try to insert a new lock if none existed
  try {
    await coll.insertOne({ _id: lockName, lockUntil, holder: INSTANCE_ID, updatedAt: now, createdAt: now });
    return true; // created new lock
  } catch (err) {
    // If another instance inserted concurrently, treat as not acquired (noisy logs avoided)
    if (err && (err.code === 11000 || err.codeName === 'DuplicateKey')) {
      return false;
    }
    console.error('Job lock acquisition failed:', err);
    return false;
  }
}
// Cron job to automate email reminders for tasks due in 24 hours.
// Schedule only AFTER MongoDB connection is established to prevent pre-connection queries.
let cronTask;
function scheduleTaskReminderCron() {
  if (cronTask || !CRON_ENABLED) return; // prevent duplicate schedules or disabled
  // Run every hour at minute 0
  cronTask = cron.schedule(
    '0 * * * *',
    async () => {
      try {
        const hasLock = await acquireJobLock('task_reminder_cron', LOCK_TTL_MS);
        if (!hasLock) {
          // Another instance owns the lock; skip this tick
          return;
        }
        await runTaskReminderJob();
      } catch (err) {
        console.error('Automated Task Email Reminder Job Error:', err);
      }
    },
    { timezone: CRON_TZ }
  );
  // console.log(`Task reminder cron job scheduled to run hourly (TZ=${CRON_TZ}).`);
}

if (mongoose.connection.readyState === 1) {
  scheduleTaskReminderCron();
  // Optionally run once immediately after confirmed connection (guarded by lock to avoid duplicates)
  acquireJobLock('task_reminder_cron', 5 * 60 * 1000)
    .then((ok) => ok && runTaskReminderJob())
    .catch((err) => console.error('Initial task reminder lock/run error:', err));
} else {
  mongoose.connection.once('connected', () => {
    scheduleTaskReminderCron();
    acquireJobLock('task_reminder_cron', 5 * 60 * 1000)
      .then((ok) => ok && runTaskReminderJob())
      .catch((err) => console.error('Initial task reminder lock/run error after connect:', err));
  });
}
