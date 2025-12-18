const moment = require("moment");
const Tenant = require("../../models/Tenant.js");
const Users = require("../../models/Users");
const emailTemplateModel = require("../../models/EmailTemplatemodel");
const sendEmail = require("../../utils/sendEmail");
const config = require("../../config");

exports.runOrganizationStatusReminderJob = async ({
  enableTest10s = false,
} = {}) => {
  console.log(
    "[Service] Tenant Status Reminder Job started",
    enableTest10s ? "(10s TEST MODE)" : ""
  );

  try {
    /* ================= SUBMITTED ================= */
    const submittedTenants = await Tenant.find({ status: "submitted" });

    const emailTemplateSubmitted = await emailTemplateModel.findOne({
      category: "submitted_status_reminder",
      isActive: true,
      isSystemTemplate: true,
    });

    if (!emailTemplateSubmitted) return;

    for (const tenant of submittedTenants) {
      const createdAt = moment(tenant.createdAt);
      const now = moment();

      const seconds = now.diff(createdAt, "seconds");
      const hours = now.diff(createdAt, "hours");
      const days = now.diff(createdAt, "days");

      const shouldSend = [
        enableTest10s && seconds >= 10 && seconds <= 20,
        hours === 24,
        hours === 48,
        days === 7,
        days === 30,
      ].some(Boolean);

      if (!shouldSend) continue;

      const user = await Users.findById(tenant.ownerId);
      if (!user?.email) continue;

      const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

      const body = emailTemplateSubmitted.body
        .replace(/{{userName}}/g, userName)
        .replace(/{{companyName}}/g, process.env.COMPANY_NAME)
        .replace(/{{supportEmail}}/g, process.env.SUPPORT_EMAIL)
        .replace(
          /{{paymentLink}}/g,
          `${config.REACT_APP_API_URL_FRONTEND}/account-settings/payment`
        );

      await sendEmail(user.email, emailTemplateSubmitted.subject, body);
      console.log(`[Email] Submitted → ${user.email}`);
    }

    /* ================= DRAFT ================= */
    const draftTenants = await Tenant.find({ status: "draft" });

    const emailTemplateDraft = await emailTemplateModel.findOne({
      category: "draft_status_reminder",
      isActive: true,
      isSystemTemplate: true,
    });

    if (!emailTemplateDraft) return;

    for (const tenant of draftTenants) {
      const createdAt = moment(tenant.createdAt);
      const now = moment();

      const seconds = now.diff(createdAt, "seconds");
      const hours = now.diff(createdAt, "hours");
      const days = now.diff(createdAt, "days");

      const shouldSend = [
        enableTest10s && seconds >= 10 && seconds <= 20,
        hours === 24,
        hours === 48,
        days === 7,
        days === 30,
      ].some(Boolean);

      if (!shouldSend) continue;

      const user = await Users.findById(tenant.ownerId);
      if (!user?.email) continue;

      const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

      const body = emailTemplateDraft.body
        .replace(/{{userName}}/g, userName)
        .replace(/{{companyName}}/g, process.env.COMPANY_NAME)
        .replace(/{{supportEmail}}/g, process.env.SUPPORT_EMAIL)
        .replace(
          /{{profileLink}}/g,
          `${config.REACT_APP_API_URL_FRONTEND}/account-settings/profile`
        );

      await sendEmail(user.email, emailTemplateDraft.subject, body);
      console.log(`[Email] Draft → ${user.email}`);
    }

    console.log("[Service] Tenant Status Reminder Job completed");
  } catch (error) {
    console.error("❌ Tenant Status Reminder Job Error:", error);
  }
};
