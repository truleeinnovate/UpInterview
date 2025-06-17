
const sendEmail = require("../../utils/sendEmail");
const notificationMiddleware = require("../../middleware/notificationMiddleware");
const { Users } = require("../../models/Users");
const emailTemplateModel = require("../../models/EmailTemplatemodel");
const config = require("../../config");
const CustomerSubscription = require('../../models/CustomerSubscriptionmodels.js');
const cron = require('node-cron');
const moment = require('moment');
const { Organization } = require('../../models/Tenant.js');
// this controller use for sending mails in signup or reset password


// exports.afterSubscribePlan = async (req, res) => {
//   try {
//     const { ownerId, tenantId, planName, planPrice, duration } = req.body;
//     const user = await Users.findOne({ _id: ownerId });

//     // Prepare email content
//     const subject = "Subscription Activated Successfully!";
//     const emailBody = `
//       <h2>Thank You for Subscribing!</h2>
//       <p>Dear ${user.Name},</p>
//       <p>You've successfully subscribed to the <b>${planName}</b> plan.</p>
//       <p>Plan Price: <b>${planPrice}</b></p>
//       <p>Duration: <b>${duration}</b></p>
//       <br>
//       <p>We appreciate your support!</p>
//       <p>Best Regards,<br>The Team</p>
//     `;

//     // Send subscription confirmation email
//     const emailResponse = await sendEmail(user.email, subject, emailBody);

//     // Save subscription notification
//     req.notificationData = [{
//       toAddress: user.email,
//       fromAddress: process.env.EMAIL_FROM,
//       title: "Subscription Plan Activated",
//       body: `Subscription for plan ${planName} has been activated successfully.`,
//       notificationType: "email",
//       object: { objectName: "subscription", objectId: ownerId },
//       status: emailResponse.success ? "Success" : "Failed",
//       tenantId,
//       recipientId: ownerId,
//       createdBy: ownerId,
//       modifiedBy: ownerId,
//     }];

//     await notificationMiddleware(req, res, () => { });

//     return res.json({ success: true, message: "Subscription successful and email sent!" });

//   } catch (error) {
//     console.error("Subscription Error:", error);
//     return res.status(500).json({ success: false, message: "Subscription failed", error: error.message });
//   }
// };
// exports.afterSubscribeFreePlan = async (req, res) => {
//   try {
//     const { ownerId, tenantId } = req.body;
//     const user = await Users.findOne({ _id: ownerId });
//     const planName = "Base Plan";

//     // Email content for free plan
//     const subject = "Welcome to the Free Plan!";
//     const emailBody = `
//       <h2>You're Now Subscribed to Our Free Plan!</h2>
//       <p>Dear ${user.Name},</p>
//       <p>You've successfully subscribed to the <b>${planName}</b>.</p>
//       <p>Enjoy limited features, and upgrade anytime to unlock premium benefits.</p>
//       <br>
//       <h3>Upgrade to a Premium Plan!</h3>
//       <p>Unlock exclusive features and benefits by upgrading to a premium plan.</p>
//       <p><a href="https://localhost:3000/subscriptionPlan" style="color: blue;">Click here to upgrade</a></p>
//       <br>
//       <p>Best Regards,<br>The Team</p>
//     `;

//     // Send email to the user
//     const emailResponse = await sendEmail(user.email, subject, emailBody);

//     // Save notification for free plan subscription
//     req.notificationData = [{
//       toAddress: user.email,
//       fromAddress: process.env.EMAIL_FROM,
//       title: "Free Plan Activated",
//       body: `You've subscribed to the Free Plan. Upgrade anytime to unlock more features!`,
//       notificationType: "email",
//       object: { objectName: "subscription", objectId: ownerId },
//       status: emailResponse.success ? "Success" : "Failed",
//       tenantId,
//       recipientId: ownerId,
//       createdBy: ownerId,
//       modifiedBy: ownerId,
//     }];

//     await notificationMiddleware(req, res, () => { });

//     return res.json({ success: true, message: "Free Plan subscription successful and email sent!" });

//   } catch (error) {
//     console.error("Free Plan Subscription Error:", error);
//     return res.status(500).json({ success: false, message: "Free Plan subscription failed", error: error.message });
//   }
// };


exports.afterSubscribePlan = async (req, res) => {
  try {
    const { ownerId, tenantId } = req.body;

    // Step 1: Find User
    const user = await Users.findOne({ _id: ownerId });
    if (!user || !user.email) {
      return res.status(401).json({ success: false, message: "User or email not found" });
    }

    // Step 2: Get Latest Subscription of the User
    const subscription = await CustomerSubscription.findOne({ ownerId })

    if (!subscription) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    // Extract necessary data from subscription
    const {
      selectedBillingCycle,
      price,
      totalAmount,
      status,
      startDate,
      endDate
    } = subscription;

    // Format duration based on billing cycle
    const durationMap = {
      monthly: "1 Month",
      quarterly: "3 Months",
      annual: "1 Year"
    };
    const duration = durationMap[selectedBillingCycle] || selectedBillingCycle;

    const planName = selectedBillingCycle?.toUpperCase() + " Plan";
    const planPrice = `₹${price}`;

    // Step 3: Get Email Template
    const emailTemplate = await emailTemplateModel.findOne({
      category: 'subscription_confirmation',
      isActive: true,
      isSystemTemplate: true
    });

    if (!emailTemplate) {
      return res.status(404).json({ success: false, message: "Email template not found" });
    }

    // Step 4: Replace Template Placeholders
    const emailSubject = emailTemplate.subject
      .replace('{{planName}}', planName)
      .replace('{{companyName}}', 'Upinterview');

    const formattedStartDate = new Date(startDate).toLocaleDateString('en-IN');
    const formattedEndDate = endDate ? new Date(endDate).toLocaleDateString('en-IN') : 'N/A';

    const emailBody = emailTemplate.body
      .replace(/{{userName}}/g, user.Name || '')
      .replace(/{{planName}}/g, planName)
      .replace(/{{planPrice}}/g, planPrice)
      .replace(/{{duration}}/g, duration)
      .replace(/{{startDate}}/g, formattedStartDate)
      .replace(/{{endDate}}/g, formattedEndDate)
      .replace(/{{status}}/g, status || 'Active')
      .replace(/{{companyName}}/g, 'Upinterview')
      .replace(/{{supportEmail}}/g, 'support@yourcompany.com');


    // Step 5: Send Email
    const emailResponse = await sendEmail(user.email, emailSubject, emailBody);

    // Step 6: Save Notification
    req.notificationData = [{
      toAddress: user.email,
      fromAddress: process.env.EMAIL_FROM,
      title: "Subscription Plan Activated",
      body: `Subscription for ${planName} has been activated successfully.`,
      notificationType: "email",
      object: { objectName: "subscription", objectId: ownerId },
      status: emailResponse.success ? "Success" : "Failed",
      tenantId,
      recipientId: ownerId,
      createdBy: ownerId,
      modifiedBy: ownerId,
    }];

    await notificationMiddleware(req, res, () => { });

    return res.json({ success: true, message: "Subscription successful and email sent!" });

  } catch (error) {
    console.error("Subscription Error:", error);
    return res.status(500).json({ success: false, message: "Subscription failed", error: error.message });
  }
};


exports.afterSubscribeFreePlan = async (req, res) => {
  try {
    const { ownerId, tenantId } = req.body;
    const user = await Users.findOne({ _id: ownerId });
    const planName = "Base Plan";
    if (!user || !user.email) {
      return res.status(401).json({ success: false, message: "User or email not found" });
    }

    // Get email template
    const emailTemplate = await emailTemplateModel.findOne({ category: 'free_plan_subscription', isActive: true, isSystemTemplate: true });
    if (!emailTemplate) {
      // console.error(`No email template found for category: ${EMAIL_CATEGORIES.FREE_PLAN_SUBSCRIPTION}`);
      return res.status(404).json({ success: false, message: "Email template not found" });
    }
    const userName = (user.firstName ? user.firstName + ' ' : '') + (user.lastName);

    // Replace placeholders
    const emailSubject = emailTemplate.subject
      .replace('{{planName}}', planName)
      .replace('{{companyName}}', 'Upinterview');

    const emailBody = emailTemplate.body
      .replace(/{{userName}}/g, userName)
      .replace(/{{planName}}/g, planName)
      .replace(/{{companyName}}/g, 'Upinterview')
      .replace(/{{supportEmail}}/g, 'support@yourcompany.com')
      .replace(/{{upgradeLink}}/g, `${config.REACT_APP_API_URL_FRONTEND}/account-settings/subscription`);

    // Send email
    const emailResponse = await sendEmail(user.email, emailSubject, emailBody);

    // Save notification
    req.notificationData = [{
      toAddress: user.email,
      fromAddress: process.env.EMAIL_FROM,
      title: "Free Plan Activated",
      body: `You've subscribed to the Free Plan. Upgrade anytime to unlock more features!`,
      notificationType: "email",
      object: { objectName: "subscription", objectId: ownerId },
      status: emailResponse.success ? "Success" : "Failed",
      tenantId,
      recipientId: ownerId,
      createdBy: ownerId,
      modifiedBy: ownerId,
    }];

    await notificationMiddleware(req, res, () => { });

    return res.json({ success: true, message: "Free Plan subscription successful and email sent!" });
  } catch (error) {
    console.error("Free Plan Subscription Error:", error);
    return res.status(500).json({ success: false, message: "Free Plan subscription failed", error: error.message });
  }
};

// Cron job to automate email sending for all subscriptions
cron.schedule('0 0 * * *', async () => {
  console.log('Running automated email reminder job at 1', new Date().toISOString());

  try {
    console.log('Running automated email reminder job at', new Date().toISOString());

    // 1. Incomplete Payment Reminders (10s, 24h, 48h, 1 week, 1 month)
    const pendingOrganizations = await Organization.find({ status: 'payment_pending' });
    const emailTemplateIncomplete = await emailTemplateModel.findOne({
      category: 'incomplete_payment_reminder',
      isActive: true,
      isSystemTemplate: true,
    });

    if (!emailTemplateIncomplete) {
      console.error('No email template found for incomplete_payment_reminder');
      return;
    }

    for (const organization of pendingOrganizations) {
      const subscription = await CustomerSubscription.findOne({ ownerId: organization.ownerId });
      if (!subscription) {
        console.warn(`No subscription found for ownerId: ${organization.ownerId}`);
        continue;
      }

      const createdAt = moment(organization.CreatedDate);
      const now = moment();
      const secondsSinceCreation = now.diff(createdAt, 'seconds');
      const hoursSinceCreation = now.diff(createdAt, 'hours');
      const daysSinceCreation = now.diff(createdAt, 'days');

      // Send reminders at 10 seconds (for testing), 24h, 48h, 7 days, 30 days
      const reminderTriggers = [
        secondsSinceCreation === 10, // Test case
        hoursSinceCreation === 24,
        hoursSinceCreation === 48,
        daysSinceCreation === 7,
        daysSinceCreation === 30
      ];

      if (reminderTriggers.some(trigger => trigger)) {
        const user = await Users.findOne({ _id: organization.ownerId });
        if (!user || !user.email) {
          console.warn(`No user or email found for ownerId: ${organization.ownerId}`);
          continue;
        }

        const userName = (user.firstName ? user.firstName + ' ' : '') + (user.lastName || '');
        const planName = subscription.subscriptionPlanId ? 'Selected Plan' : 'Base Plan';
        const planDetails = subscription.subscriptionPlanId ?
          `Plan: ${planName}, Billing Cycle: ${subscription.selectedBillingCycle}` :
          'Base Plan with standard features';

        const emailSubject = emailTemplateIncomplete.subject
          .replace('{{planName}}', planName)
          .replace('{{companyName}}', 'Upinterview');

        const emailBody = emailTemplateIncomplete.body
          .replace(/{{userName}}/g, userName)
          .replace(/{{planName}}/g, planName)
          .replace(/{{companyName}}/g, 'Upinterview')
          .replace(/{{supportEmail}}/g, 'support@yourcompany.com')
          .replace(/{{paymentLink}}/g, `${config.REACT_APP_API_URL_FRONTEND}/account-settings/subscription`)
          .replace(/{{planDetails}}/g, planDetails);

        const emailResponse = await sendEmail(user.email, emailSubject, emailBody);

        // Save notification
        // const notificationData = [{
        //   toAddress: user.email,
        //   fromAddress: process.env.EMAIL_FROM,
        //   title: 'Complete Your Payment',
        //   body: `Please complete the payment for your ${planName} subscription. Details: ${planDetails}`,
        //   notificationType: 'email',
        //   object: { objectName: 'subscription', objectId: organization.ownerId },
        //   status: emailResponse.success ? 'Success' : 'Failed',
        //   tenantId: subscription.tenantId,
        //   recipientId: organization.ownerId,
        //   createdBy: organization.ownerId,
        //   modifiedBy: organization.ownerId,
        // }];

        // await notificationMiddleware({ notificationData }, { json: () => {} }, () => {});
        console.log(`Incomplete payment reminder sent to ${user.email} for organization ${organization._id} at ${hoursSinceCreation} hours/${daysSinceCreation} days`);
      }
    }

    // 2. Payment Renewal Reminders
    const activeSubscriptions = await CustomerSubscription.find({ status: 'active', autoRenew: true });
    const emailTemplateRenewal = await emailTemplateModel.findOne({
      category: 'payment_renewal_reminder',
      isActive: true,
      isSystemTemplate: true,
    });

    if (!emailTemplateRenewal) {
      console.error('No email template found for payment_renewal_reminder');
      return;
    }

    for (const subscription of activeSubscriptions) {
      const nextBillingDate = moment(subscription.nextBillingDate);
      const now = moment();
      const daysUntilBilling = nextBillingDate.diff(now, 'days');

      const reminderDays = subscription.selectedBillingCycle === 'monthly'
        ? [7, 2, 1] // 1 week, 2 days, 1 day before
        : [30, 15, 2, 1]; // 1 month, 15 days, 2 days, 1 day before

      if (reminderDays.includes(daysUntilBilling)) {
        const user = await Users.findOne({ _id: subscription.ownerId });
        if (!user || !user.email) {
          console.warn(`No user or email found for ownerId: ${subscription.ownerId}, subscription: ${subscription._id}`);
          continue;
        }

        const userName = (user.firstName ? user.firstName + ' ' : '') + (user.lastName || '');
        const planName = subscription.subscriptionPlanId ? 'Selected Plan' : 'Base Plan';
        const billingCycle = subscription.selectedBillingCycle;
        const formattedBillingDate = nextBillingDate.format('MMMM Do, YYYY');

        const emailSubject = emailTemplateRenewal.subject
          .replace('{{planName}}', planName)
          .replace('{{companyName}}', 'Upinterview')
          .replace('{{nextBillingDate}}', formattedBillingDate);

        const emailBody = emailTemplateRenewal.body
          .replace(/{{userName}}/g, userName)
          .replace(/{{planName}}/g, planName)
          .replace(/{{companyName}}/g, 'Upinterview')
          .replace(/{{supportEmail}}/g, 'support@yourcompany.com')
          .replace(/{{nextBillingDate}}/g, formattedBillingDate)
          .replace(/{{billingCycle}}/g, billingCycle);

        const emailResponse = await sendEmail(user.email, emailSubject, emailBody);

        // Save notification
        const notificationData = [{
          toAddress: user.email,
          fromAddress: process.env.EMAIL_FROM,
          title: 'Upcoming Payment Reminder',
          body: `Your ${planName} subscription will renew on ${formattedBillingDate}.`,
          notificationType: 'email',
          object: { objectName: 'subscription', objectId: subscription.ownerId },
          status: emailResponse.success ? 'Success' : 'Failed',
          tenantId: subscription.tenantId,
          recipientId: subscription.ownerId,
          createdBy: subscription.ownerId,
          modifiedBy: subscription.ownerId,
        }];

        await notificationMiddleware({ notificationData }, { json: () => { } }, () => { });
        console.log(`Payment renewal reminder sent to ${user.email} for subscription ${subscription._id} at ${daysUntilBilling} days remaining`);
      }
    }

    console.log('Automated email reminder job completed successfully.');
  } catch (error) {
    console.error('Automated Email Reminder Job Error:', error);
  }
});
