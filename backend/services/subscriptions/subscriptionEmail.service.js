const moment = require("moment");
const Tenant = require("../../models/Tenant.js");
const Users = require("../../models/Users.js");
const CustomerSubscription = require("../../models/CustomerSubscriptionmodels.js");
const emailTemplateModel = require("../../models/EmailTemplatemodel.js");
const { sendEmail } = require("../../utils/sendEmail.js");
const notificationMiddleware = require("../../middleware/notificationMiddleware.js");
const config = require("../../config.js");

/**
 * Main job runner
 */
async function runSubscriptionEmailReminderJob({ enableTest10s = false } = {}) {
  console.log("[Cron] Subscription email reminder job started");

  await handleIncompletePaymentReminders(enableTest10s);
  await handleRenewalReminders();

  console.log("[Cron] Subscription email reminder job finished");
}

/**
 * 1️⃣ Incomplete payment reminders
 */
async function handleIncompletePaymentReminders(enableTest10s) {
  const pendingOrganizations = await Tenant.find({
    status: "payment_pending",
  });

  const emailTemplate = await emailTemplateModel.findOne({
    category: "incomplete_payment_reminder",
    isActive: true,
    isSystemTemplate: true,
  });

  if (!emailTemplate) {
    console.error("No email template found for incomplete_payment_reminder");
    return;
  }

  for (const organization of pendingOrganizations) {
    const subscription = await CustomerSubscription.findOne({
      ownerId: organization.ownerId,
    }).populate("subscriptionPlanId", "name");

    if (!subscription) continue;

    const createdAt = moment(organization.createdAt);
    const now = moment();

    const secondsSinceCreation = now.diff(createdAt, "seconds");
    const hoursSinceCreation = now.diff(createdAt, "hours");
    const daysSinceCreation = now.diff(createdAt, "days");

    const reminderTriggers = [
      enableTest10s && secondsSinceCreation === 10, // 🔥 TEST ONLY
      hoursSinceCreation === 24,
      hoursSinceCreation === 48,
      daysSinceCreation === 7,
      daysSinceCreation === 30,
    ].filter(Boolean);

    if (!reminderTriggers.length) continue;

    const user = await Users.findById(organization.ownerId);
    if (!user?.email) continue;

    const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    const planName =
      subscription.subscriptionPlanId?.name ||
      `${subscription.selectedBillingCycle?.toUpperCase()} Plan`;

    const emailSubject = emailTemplate.subject.replace("{{planName}}", planName);

    const emailBody = emailTemplate.body
      .replace(/{{userName}}/g, userName)
      .replace(/{{planName}}/g, planName)
      .replace(/{{companyName}}/g, process.env.COMPANY_NAME)
      .replace(/{{supportEmail}}/g, process.env.SUPPORT_EMAIL)
      .replace(
        /{{paymentLink}}/g,
        `${config.REACT_APP_API_URL_FRONTEND}/subscription-plans`
      );

    const emailResponse = await sendEmail(
      user.email,
      emailSubject,
      emailBody
    );

    await saveNotification({
      user,
      subscription,
      emailSubject,
      emailBody,
      success: emailResponse.success,
    });
  }
}

/**
 * 2️⃣ Payment renewal reminders
 */
async function handleRenewalReminders() {
  const subscriptions = await CustomerSubscription.find({
    status: "active",
    autoRenew: true,
  });

  const emailTemplate = await emailTemplateModel.findOne({
    category: "payment_renewal_reminder",
    isActive: true,
    isSystemTemplate: true,
  });

  if (!emailTemplate) {
    console.error("No email template found for payment_renewal_reminder");
    return;
  }

  for (const subscription of subscriptions) {
    const nextBillingDate = moment(subscription.nextBillingDate);
    const daysUntilBilling = nextBillingDate.diff(moment(), "days");

    const reminderDays =
      subscription.selectedBillingCycle === "monthly"
        ? [7, 2, 1]
        : [30, 15, 2, 1];

    if (!reminderDays.includes(daysUntilBilling)) continue;

    const user = await Users.findById(subscription.ownerId);
    if (!user?.email) continue;

    const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    const planName =
      `${subscription.subscriptionPlanId?.name ||
        subscription.selectedBillingCycle.toUpperCase()} Plan`;

    const formattedDate = nextBillingDate.format("MMMM Do, YYYY");

    const emailSubject = emailTemplate.subject
      .replace("{{planName}}", planName)
      .replace("{{nextBillingDate}}", formattedDate);

    const emailBody = emailTemplate.body
      .replace(/{{userName}}/g, userName)
      .replace(/{{planName}}/g, planName)
      .replace(/{{companyName}}/g, process.env.COMPANY_NAME)
      .replace(/{{supportEmail}}/g, process.env.SUPPORT_EMAIL)
      .replace(/{{nextBillingDate}}/g, formattedDate)
      .replace(/{{billingCycle}}/g, subscription.selectedBillingCycle);

    const emailResponse = await sendEmail(
      user.email,
      emailSubject,
      emailBody
    );

    await saveNotification({
      user,
      subscription,
      emailSubject,
      emailBody,
      success: emailResponse.success,
    });
  }
}

/**
 * Notification helper
 */
async function saveNotification({
  user,
  subscription,
  emailSubject,
  emailBody,
  success,
}) {
  const notificationData = [
    {
      toAddress: user.email,
      fromAddress: process.env.EMAIL_FROM,
      title: emailSubject,
      body: emailBody,
      notificationType: "email",
      object: { objectName: "subscription", objectId: subscription.ownerId },
      status: success ? "Success" : "Failed",
      tenantId: subscription.tenantId,
      ownerId: subscription.ownerId,
      recipientId: subscription.ownerId,
      createdBy: subscription.ownerId,
      updatedBy: subscription.ownerId,
    },
  ];

  await notificationMiddleware(
    { notificationData },
    { json: () => {} },
    () => {}
  );
}

module.exports = { runSubscriptionEmailReminderJob };
