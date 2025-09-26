const cron = require('node-cron');
const mongoose = require('mongoose');
const moment = require('moment');
const os = require('os');
const Task = require('../../models/task'); // Fix case-sensitive path on Linux/CI
const PushNotification = require('../../models/PushNotifications');
//const { sendEmail } = require('../../utils/sendEmail'); // Adjust path as per your structure
//const emailTemplateModel = require('../../models/EmailTemplatemodel'); // Adjust path as per your structure


// Runtime configuration for cron in different environments (e.g., Azure App Service)
const CRON_ENABLED = process.env.TASK_REMINDER_CRON_ENABLED !== 'false'; // default: enabled
const CRON_TZ = process.env.TASK_REMINDER_CRON_TZ || 'UTC'; // Azure typically runs in UTC
const LOCK_TTL_MS = parseInt(process.env.TASK_REMINDER_LOCK_TTL_MS || '', 10) || (55 * 60 * 1000); // 55 mins
const INSTANCE_ID = process.env.WEBSITE_INSTANCE_ID || process.env.HOSTNAME || os.hostname();
const LOCK_NAME = process.env.TASK_REMINDER_LOCK_NAME || 'task_reminder_cron_dev';
const USE_LOCKS = process.env.TASK_REMINDER_USE_LOCKS === 'true'; // default: no locks in dev/testing

//console.log('[TASK REMINDER] Module loaded at', new Date().toISOString());

// Function to manually test the task reminder logic - useful for debugging


// The actual cron job logic extracted for reuse
const runTaskReminderJob = async () => {
  // Ensure DB connection is ready to avoid queries before initial connection completes
  if (mongoose.connection.readyState !== 1) {
    // console.warn('[TASK REMINDER] Skipping: MongoDB not connected yet (readyState:', mongoose.connection.readyState, ')');
    return;
  }

  // console.log('[TASK REMINDER] ===========================================');
  // console.log('[TASK REMINDER] Running job at', new Date().toISOString());

  try {
    // Find tasks due in the next 24 hours (including tasks that are slightly overdue)
    const now = moment();
    const startTime = moment(now).subtract(2, 'hours'); // Include tasks from 2 hours ago
    const endTime = moment(now).add(25, 'hours'); // Extended to 25 hours to catch edge cases

    // console.log(`[TASK REMINDER] Current time: ${now.format('YYYY-MM-DD HH:mm:ss')}`);
    // console.log(`[TASK REMINDER] Checking for tasks due between:`);
    // console.log(`[TASK REMINDER]   Start: ${startTime.format('YYYY-MM-DD HH:mm:ss')} (${startTime.toISOString()})`);
    // console.log(`[TASK REMINDER]   End:   ${endTime.format('YYYY-MM-DD HH:mm:ss')} (${endTime.toISOString()})`);

    // First, let's see ALL tasks to debug
    const allTasks = await Task.find({}).select('title dueDate status assignedToId ownerId');
    //console.log(`[TASK REMINDER] Total tasks in database: ${allTasks.length}`);
    if (allTasks.length > 0) {
      //console.log('[TASK REMINDER] All tasks:');
      allTasks.forEach(task => {
        const dueDate = task.dueDate ? moment(task.dueDate) : null;
        const hoursFromNow = dueDate ? dueDate.diff(now, 'hours', true).toFixed(1) : 'N/A';
        //console.log(`[TASK REMINDER]   - "${task.title}" | Due: ${dueDate ? dueDate.format('YYYY-MM-DD HH:mm:ss') : 'NO DUE DATE'} | Hours from now: ${hoursFromNow} | Status: ${task.status}`);
      });
    }

    const tasks = await Task.find({
      dueDate: {
        $gte: startTime.toDate(),
        $lte: endTime.toDate()
      },
      // Only include tasks that haven't been completed or cancelled
      status: { $nin: ['completed', 'cancelled', 'done'] }
    });

    if (tasks.length === 0) {
    //   console.log('[TASK REMINDER] No tasks found due in the next 24 hours.');
      return;
    }



    // console.log(`[TASK REMINDER] Found ${tasks.length} tasks due in the next 24 hours:`);
    // tasks.forEach(task => {
    //   console.log(`  - Task: "${task.title}" | Due: ${moment(task.dueDate).toISOString()} | Status: ${task.status}`);
    // });



    for (const task of tasks) {
      //console.log(`[TASK REMINDER] Processing task: "${task.title}" (ID: ${task._id})`);

      // Prefer notifying the assigned user; fall back to ownerId if not present
      const recipientUserId = (task.ownerId && String(task.ownerId));
      // console.log(`[TASK REMINDER]   - assignedToId: ${task.assignedToId || 'none'}`);
      // console.log(`[TASK REMINDER]   - ownerId: ${task.ownerId || 'none'}`);
      // console.log(`[TASK REMINDER]   - Using recipientUserId: ${recipientUserId || 'none'}`);

      if (!recipientUserId) {
        // console.warn(`[TASK REMINDER]   ❌ Skipping: No assignedToId or ownerId`);
        continue;
      }

      // We no longer require Users lookup or a valid ObjectId. Notifications are keyed by ownerId string.
      const ownerIdForNotification = String(recipientUserId);
      const formattedDueDate = moment(task.dueDate).format('MMMM Do, YYYY, h:mm a');

      // Save notification to PushNotifications schema only if one doesn't already exist for this specific task
      //console.log(`[TASK REMINDER]   - Checking for existing notification...`);

      // Create a more reliable unique identifier for the task
      const taskIdentifier = task.taskCode || task._id;

      // Check for existing notification using both task identifier and due date
      const existingNotification = await PushNotification.findOne({
        ownerId: ownerIdForNotification,
        category: 'task_reminder',
        $or: [
          { message: { $regex: `taskID: ${taskIdentifier}`, $options: 'i' } },
          { message: { $regex: `TaskId:${taskIdentifier}`, $options: 'i' } },
          {
            $and: [
              { 'metadata.taskId': taskIdentifier },
              { 'metadata.dueDate': task.dueDate.toISOString() }
            ]
          }
        ]
      });

      if (!existingNotification) {
        const notificationData = {
          ownerId: ownerIdForNotification,
          tenantId: task.tenantId ? String(task.tenantId) : '',
          title: 'Task Due Reminder',
          // Include consistent task ID in the message and store additional metadata
          message: `Your task "${task.title}" is due on ${formattedDueDate} status: ${task.status}. TaskID: ${task.taskCode || task._id}`,
          metadata: {
            taskId: task.taskCode || task._id,
            dueDate: task.dueDate.toISOString(),
            taskTitle: task.title
          },
          type: 'system',
          category: 'task_reminder',
          unread: true
        };

       // console.log(`[TASK REMINDER]   - Creating notification with data:`, JSON.stringify(notificationData, null, 2));

        try {
          const notification = new PushNotification(notificationData);
          await notification.save();
        //   console.log(`[TASK REMINDER]   ✅ Notification created successfully! ID: ${notification._id}`);
        } catch (saveError) {
        //   console.error(`[TASK REMINDER]   ❌ Failed to save notification:`, saveError.message);
        }
      } else {
        continue;
        //console.log(`[TASK REMINDER]   ⚠️ Notification already exists (ID: ${existingNotification._id}), skipping.`);
      }
    }

    // console.log('[TASK REMINDER] Job completed successfully.');

  } catch (error) {
    // console.error('[TASK REMINDER] Job Error:', error);
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
  // Run every 10 seconds for testing/development (change to '0 * * * *' for production)
  cronTask = cron.schedule(
    '*/10 * * * * *', // Every 10 seconds
    async () => {
      try {
        if (USE_LOCKS) {
          const hasLock = await acquireJobLock(LOCK_NAME, 10 * 1000); // 10 second lock for quick runs
          if (!hasLock) {
            // Another instance owns the lock; skip this tick (log holder/expiry for visibility)
            try {
              const lockDoc = await mongoose.connection.collection('jobLocks').findOne({ _id: LOCK_NAME });
              if (lockDoc) {
                // console.log(`[TASK REMINDER] ⏳ Skipping tick: lock held by ${lockDoc.holder} until ${new Date(lockDoc.lockUntil).toISOString()}`);
              } else {
                // console.log('[TASK REMINDER] ⏳ Skipping tick: lock not acquired');
              }
            } catch (e) {
            //   console.log('[TASK REMINDER] ⏳ Skipping tick: lock not acquired (failed to read lock doc)');
            }
            return;
          }
          await runTaskReminderJob();
        } else {
          await runTaskReminderJob();
        }
      } catch (err) {
        console.error('Automated Task Email Reminder Job Error:', err);
      }
    },
    { timezone: CRON_TZ }
  );
//   console.log(`[TASK REMINDER] ⚡ Cron job scheduled to run EVERY 10 SECONDS for testing (TZ=${CRON_TZ}, locks=${USE_LOCKS ? 'on' : 'off'}).`);
}

if (mongoose.connection.readyState === 1) {
  scheduleTaskReminderCron();
  // Run once immediately after confirmed connection
//   console.log('[TASK REMINDER] 🚀 Running initial check immediately...');
  if (USE_LOCKS) {
    acquireJobLock(LOCK_NAME, 10 * 1000) // 10 second lock
      .then((ok) => {
        if (!ok) {
        //   console.log('[TASK REMINDER] ⏳ Initial check skipped: lock not acquired');
          return;
        }
        return runTaskReminderJob();
      })
      .catch((err) => console.error('Initial task reminder lock/run error:', err));
  } else {
    runTaskReminderJob().catch((err) => console.error('Initial task reminder run error:', err));
  }
} else {
  mongoose.connection.once('connected', () => {
    scheduleTaskReminderCron();
    // console.log('[TASK REMINDER] 🚀 MongoDB connected, running initial check...');
    if (USE_LOCKS) {
      acquireJobLock(LOCK_NAME, 10 * 1000) // 10 second lock
        .then((ok) => {
          if (!ok) {
            // console.log('[TASK REMINDER] ⏳ Initial check after connect skipped: lock not acquired');
            return;
          }
          return runTaskReminderJob();
        })
        .catch((err) => console.error('Initial task reminder lock/run error after connect:', err));
    } else {
      runTaskReminderJob().catch((err) => console.error('Initial task reminder run error after connect:', err));
    }
  });
}

// Export the functions so they can be called manually from an API endpoint for testing
module.exports = {
  runTaskReminderJob,
  scheduleTaskReminderCron
};
