const cron = require('node-cron');
const mongoose = require('mongoose');
const moment = require('moment');
const Task = require('../../models/Task'); // Adjust path as per your structure
const { Users } = require('../../models/Users'); // Adjust path as per your structure
const PushNotification = require('../../models/PushNotifications');
//const { sendEmail } = require('../../utils/sendEmail'); // Adjust path as per your structure
//const emailTemplateModel = require('../../models/EmailTemplatemodel'); // Adjust path as per your structure


// console.log('pushNotificationEmailController.js LOADED at', new Date().toISOString(), ' - If you see this, the file is being executed.');

// Function to manually test the task reminder logic
function testTaskReminder() {
  console.log('Manually testing task reminder logic at', new Date().toISOString());

  runTaskReminderJob();
}

// The actual cron job logic extracted for reuse
const runTaskReminderJob = async () => {

  // console.log('Running automated task email reminder job at', new Date().toISOString());


  try {
    // Find tasks due in the next 24 hours
    const now = moment();
    const dueIn24Hours = moment(now).add(24, 'hours');

    // console.log(`Checking tasks due between ${now.toISOString()} and ${dueIn24Hours.toISOString()}`);

    const tasks = await Task.find({
      dueDate: {
        $gte: now.toDate(),
        $lte: dueIn24Hours.toDate()
      }
    });

    if (tasks.length === 0) {
      // console.log('No tasks due in the next 24 hours.');
      return;
    }


    
    // console.log(`Found ${tasks.length} tasks due in the next 24 hours.`);

    // // Fetch email template for task reminder
    // const emailTemplate = await emailTemplateModel.findOne({
    //   category: 'task_due_reminder',
    //   isActive: true,
    //   isSystemTemplate: true,
    // });

    // if (!emailTemplate) {
    //   console.error('No email template found for task_due_reminder');
    //   return;
    // }

    // for (const task of tasks) {
    //   if (!task.ownerId) {
    //     console.warn(`Task ${task._id} has no ownerId.`);
    //     continue;
    //   }

    //   const userId = task.ownerId.toString();
    //   if (!mongoose.Types.ObjectId.isValid(task.ownerId)) {
    //     console.warn(`Invalid user ObjectId ${userId} for task ${task._id}`);
    //     continue;
    //   }

    //   let user;
    //   try {
    //     user = await Users.findOne({ _id: task.ownerId });
    //   } catch (err) {
    //     console.error(`Error fetching user for ID ${userId}:`, err.message);
    //   }

    //   if (!user || !user.email) {
    //     console.warn(`No valid user/email for task ${task._id}`);
    //     continue;
    //   }
    //   const userName = (user.firstName ? user.firstName + ' ' : '') + (user.lastName || '');
    //   const formattedDueDate = moment(task.dueDate).format('MMMM Do, YYYY, h:mm a');

    //   const emailSubject = emailTemplate.subject
    //     .replace('{{taskTitle}}', task.title || 'Task')
    //     .replace('{{companyName}}', process.env.COMPANY_NAME)
    //     .replace('{{dueDate}}', formattedDueDate);

    //   const emailBody = emailTemplate.body
    //     .replace(/{{userName}}/g, userName)
    //     .replace(/{{taskTitle}}/g, task.title || 'Task')
    //     .replace(/{{companyName}}/g, process.env.COMPANY_NAME)
    //     .replace(/{{supportEmail}}/g, process.env.SUPPORT_EMAIL)
    //     .replace(/{{dueDate}}/g, formattedDueDate);

    //   const emailResponse = await sendEmail(user.email, emailSubject, emailBody);

    for (const task of tasks) {
      if (!task.ownerId) {

        // console.warn(`Task ${task._id} has no ownerId.`);

        continue;
      }

      const userId = task.ownerId.toString();
      if (!mongoose.Types.ObjectId.isValid(task.ownerId)) {

        console.warn(`Invalid user ObjectId ${userId} for task ${task._id}`);

        continue;
      }

      let user;
      try {
        user = await Users.findOne({ _id: task.ownerId });
      } catch (err) {
        console.error(`Error fetching user for ID ${userId}:`, err.message);
      }

      if (!user || !user.email) {

        console.warn(`No valid user/email for task ${task._id}`);

        continue;
      }
      const userName = (user.firstName ? user.firstName + ' ' : '') + (user.lastName || '');
      const formattedDueDate = moment(task.dueDate).format('MMMM Do, YYYY, h:mm a');

      // Save notification to PushNotifications schema only if one doesn't already exist
      const existingNotification = await PushNotification.findOne({
        ownerId: user._id.toString(),
        category: 'task_reminder',
        // Rough match to ensure this task's reminder isn't duplicated
        message: `Your task "${task.title}" is due on ${formattedDueDate}.`
      });

      if (!existingNotification) {
        const notification = new PushNotification({
          ownerId: user._id.toString(),
          tenantId: task.tenantId ? task.tenantId.toString() : '',
          title: 'Task Due Reminder',
          message: `Your task "${task.title}" is due on ${formattedDueDate}.`,
          type: 'email',
          category: 'task_reminder',
          unread: true
        });
        await notification.save();

        // console.log(`Task reminder notification stored for user ${user.email} and task ${task._id}`);
      } else {
        // console.log(`Task reminder notification already exists for user ${user.email} and task ${task._id}, skipping save.`);
      }
    }

    // console.log('Automated task email reminder job completed successfully.');

  } catch (error) {
    console.error('Automated Task Email Reminder Job Error:', error);
  }
};

// Cron job to automate email reminders for tasks due in 24 hours
cron.schedule('* * * * *', async () => {
  runTaskReminderJob();
});


// console.log('Task reminder cron job scheduled to run every minute for testing.');

// Run immediately on file load for testing
// console.log('Running initial test of task reminder job at startup...');
runTaskReminderJob();
