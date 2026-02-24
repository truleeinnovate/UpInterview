const sendEmail = require("../../utils/sendEmail");
const notificationMiddleware = require("../../middleware/notificationMiddleware");
const { Users } = require("../../models/Users");
const { Contacts } = require("../../models/Contacts");
const jwt = require("jsonwebtoken");
const emailTemplateModel = require("../../models/EmailTemplatemodel");
const config = require("../../config");

const mongoose = require("mongoose");
// const cron = require("node-cron");
const moment = require("moment");
const Tenant = require("../../models/Tenant.js");
const { generateEmailVerificationToken } = require("../../utils/jwt");

exports.sendSignUpEmail = async (req, res) => {
  try {
    const { tenantId, ownerId } = req.body;
    if (!ownerId) {
      return res
        .status(401)
        .json({ success: false, message: "ownerId not found" });
    }
    const user = await Users.findOne({ _id: ownerId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const email = user.email;
    const lastName = user.lastName;
    const firstName = user.firstName;

    // Get email template
    const emailTemplate = await emailTemplateModel.findOne({
      category: "welcome",
      isActive: true,
      isSystemTemplate: true,
    });
    if (!emailTemplate) {
      return res
        .status(404)
        .json({ success: false, message: "Email template not found" });
    }

    // Replace placeholders
    const emailSubject = emailTemplate.subject.replace(
      "{{companyName}}",
      process.env.COMPANY_NAME
    );

    const emailBody = emailTemplate.body
      .replace(/{{firstName}}/g, firstName || "")
      .replace(/{{lastName}}/g, lastName || "")
      .replace(/{{email}}/g, email)
      .replace(/{{companyName}}/g, process.env.COMPANY_NAME)
      .replace(/{{supportEmail}}/g, process.env.SUPPORT_EMAIL);

    // Send email
    const emailResponse = await sendEmail(email, emailSubject, emailBody);

    // Save notification
    // req.notificationData = [{
    //   toAddress: email,
    //   fromAddress: process.env.EMAIL_FROM,
    //   title: "Welcome Email Sent",
    //   body: `Welcome ${firstName} ${lastName}`,
    //   notificationType: "email",
    //   object: { objectName: "login", objectId: ownerId },
    //   status: emailResponse.success ? "Success" : "Failed",
    //   tenantId,
    //   ownerId,
    //   recipientId: ownerId,
    //   createdBy: ownerId,
    //   updatedBy: ownerId,
    // }];

    req.notificationData = [
      {
        toAddress: email,
        fromAddress: process.env.EMAIL_FROM,
        title: emailSubject,
        body: emailBody,
        notificationType: "email",
        object: { objectName: "login", objectId: ownerId },
        status: emailResponse.success ? "Success" : "Failed",
        tenantId,
        ownerId,
        recipientId: ownerId,
        createdBy: ownerId,
        updatedBy: ownerId,
      },
    ];

    const notificationResponse = await notificationMiddleware(
      req,
      res,
      () => { }
    );

    return res.json({
      success: true,
      message: "Signup email sent successfully",
    });
  } catch (error) {
    console.error("Signup Email Error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to send signup email",
        error: error.message,
      });
  }
};

exports.forgotPasswordSendEmail = async (req, res) => {
  try {
    const { email, type } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await Users.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate token
    const resetToken = jwt.sign(
      { id: user._id, type },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    const actionLink = `${config.REACT_APP_API_URL_FRONTEND
      }/resetPassword?token=${encodeURIComponent(resetToken)}&type=${type}`;

    // Get email template
    const emailTemplate = await emailTemplateModel.findOne({
      category: "reset_or_create_password",
      isActive: true,
      isSystemTemplate: true,
    });
    if (!emailTemplate) {
      return res
        .status(404)
        .json({ success: false, message: "Email template not found" });
    }

    // Set dynamic values based on type
    const actionType =
      type === "usercreatepass" ? "Account Setup" : "Password Reset";
    const actionTitle =
      type === "usercreatepass"
        ? "Create Your Password"
        : "Reset Your Password";
    const actionDescription =
      type === "usercreatepass"
        ? "set up your account password"
        : "reset your password";
    const actionButtonText =
      type === "usercreatepass" ? "Create Password" : "Reset Password";

    // Replace placeholders
    const emailSubject = emailTemplate.subject
      .replace("{{actionType}}", actionType)
      .replace("{{companyName}}", process.env.COMPANY_NAME);

    const emailBody = emailTemplate.body
      .replace(/{{actionType}}/g, actionType)
      .replace(/{{actionTitle}}/g, actionTitle)
      .replace(/{{actionDescription}}/g, actionDescription)
      .replace(/{{actionButtonText}}/g, actionButtonText)
      .replace(/{{actionLink}}/g, actionLink)
      .replace(/{{companyName}}/g, process.env.COMPANY_NAME)
      .replace(/{{supportEmail}}/g, process.env.SUPPORT_EMAIL);

    await sendEmail(email, emailSubject, emailBody);

    return res.json({
      success: true,
      message: `${actionTitle} email sent`,
      data: { actionLink }, // For testing purposes only
    });
  } catch (error) {
    console.error("Password Email Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send password email" });
  }
};

// cron.schedule("0 0 * * *", async () => {
//   try {
//     const submittedOrganizations = await Organization.find({
//       status: "submitted",
//     });

//     const emailTemplateSubmitted = await emailTemplateModel.findOne({
//       category: "submitted_status_reminder",
//       isActive: true,
//       isSystemTemplate: true,
//     });

//     if (!emailTemplateSubmitted) {
//       console.error(
//         "[ERROR] No email template found for submitted_status_reminder"
//       );
//       return;
//     }

//     for (const organization of submittedOrganizations) {
//       const createdAt = moment(organization.createdAt);
//       const now = moment();

//       // const secondsSinceCreation = now.diff(createdAt, 'seconds');
//       const hoursSinceCreation = now.diff(createdAt, "hours");
//       const daysSinceCreation = now.diff(createdAt, "days");

//       const reminderTriggers = [
//         // secondsSinceCreation >= 10 && secondsSinceCreation <= 20,
//         hoursSinceCreation === 24,
//         hoursSinceCreation === 48,
//         daysSinceCreation === 7,
//         daysSinceCreation === 30,
//       ];

//       if (reminderTriggers.some((trigger) => trigger)) {
//         const user = await Users.findOne({ _id: organization.ownerId });

//         if (!user || !user.email) {
//           console.warn(
//             `[WARNING] No user or email found for ownerId: ${organization.ownerId}`
//           );
//           continue;
//         }

//         const userName =
//           (user.firstName ? user.firstName + " " : "") + (user.lastName || "");

//         const emailSubject = emailTemplateSubmitted.subject;
//         // .replace('{{companyName}}', process.env.COMPANY_NAME);
//         const emailBody = emailTemplateSubmitted.body
//           .replace(/{{userName}}/g, userName)
//           .replace(/{{companyName}}/g, process.env.COMPANY_NAME)
//           .replace(/{{supportEmail}}/g, process.env.SUPPORT_EMAIL)
//           .replace(
//             /{{paymentLink}}/g,
//             `${config.REACT_APP_API_URL_FRONTEND}/account-settings/payment`
//           );

//         const emailResponse = await sendEmail(
//           user.email,
//           emailSubject,
//           emailBody
//         );
//       } else {
//       }
//     }

//     const draftOrganizations = await Organization.find({ status: "draft" });

//     const emailTemplateDraft = await emailTemplateModel.findOne({
//       category: "draft_status_reminder",
//       isActive: true,
//       isSystemTemplate: true,
//     });

//     if (!emailTemplateDraft) {
//       console.error(
//         "[ERROR] No email template found for draft_status_reminder"
//       );
//       return;
//     }

//     for (const organization of draftOrganizations) {
//       const createdAt = moment(organization.createdAt);
//       const now = moment();

//       const hoursSinceCreation = now.diff(createdAt, "hours");
//       const daysSinceCreation = now.diff(createdAt, "days");

//       const reminderTriggers = [
//         hoursSinceCreation === 24,
//         hoursSinceCreation === 48,
//         daysSinceCreation === 7,
//         daysSinceCreation === 30,
//       ];

//       if (reminderTriggers.some((trigger) => trigger)) {
//         const user = await Users.findOne({ _id: organization.ownerId });

//         if (!user || !user.email) {
//           console.warn(
//             `[WARNING] No user or email found for ownerId: ${organization.ownerId}`
//           );
//           continue;
//         }

//         const userName =
//           (user.firstName ? user.firstName + " " : "") + (user.lastName || "");

//         const emailSubject = emailTemplateDraft.subject.replace(
//           "{{companyName}}",
//           process.env.COMPANY_NAME
//         );
//         const emailBody = emailTemplateDraft.body
//           .replace(/{{userName}}/g, userName)
//           .replace(/{{companyName}}/g, process.env.COMPANY_NAME)
//           .replace(/{{supportEmail}}/g, process.env.SUPPORT_EMAIL)
//           .replace(
//             /{{profileLink}}/g,
//             `${config.REACT_APP_API_URL_FRONTEND}/account-settings/profile`
//           );

//         const emailResponse = await sendEmail(
//           user.email,
//           emailSubject,
//           emailBody
//         );
//       } else {
//       }
//     }
//   } catch (error) {
//     console.error("\n❌ Organization Status Email Reminder Job Error:", error);
//   }
// });

// First, define the sendVerificationEmail function (can be at the top of the file)
const sendVerificationEmail = async ({ type, to, data }) => {
  try {
    const { email, userId, firstName, lastName, actionLink } = data;

    // Validate email
    if (!email || typeof email !== "string") {
      throw new Error("Invalid email address");
    }

    // Generate verification token (if not using the provided actionLink)
    const verificationToken = jwt.sign({ userId, email }, config.JWT_SECRET, {
      expiresIn: "72h",
    });
    const verificationLink =
      actionLink ||
      `${config.REACT_APP_API_URL_FRONTEND}/verify-email?token=${verificationToken}`;

    // Get email template
    const emailTemplate = await emailTemplateModel.findOne({
      category: "email_verification",
      isActive: true,
    });

    if (!emailTemplate) {
      throw new Error("Email template not found");
    }

    // Replace placeholders in email body
    const emailBody = emailTemplate.body
      .replace(/{{verificationLink}}/g, verificationLink)
      .replace(/{{firstName}}/g, firstName || "")
      .replace(/{{lastName}}/g, lastName || "")
      .replace(/{{companyName}}/g, process.env.COMPANY_NAME)
      .replace(/{{supportEmail}}/g, process.env.SUPPORT_EMAIL);

    // Call sendEmail with correct parameters
    const emailResult = await sendEmail(
      email, // toEmail: string
      emailTemplate.subject, // subject
      emailBody, // messageBody
      undefined // ccEmail: optional, set to undefined as not used
    );

    return emailResult; // Return the result from sendEmail
  } catch (error) {
    console.error("Error sending verification email:", error);
    return {
      success: false,
      message: "Failed to send verification email",
      error: error.message,
    };
  }
};

// Then export it so it can be used elsewhere
exports.sendVerificationEmail = sendVerificationEmail;

//users tab emails
exports.requestEmailChangeVerification = async (req, res) => {
  try {
    const { oldEmail, newEmail, userId } = req.body;

    if (!oldEmail || !newEmail || !userId) {
      return res.status(400).json({
        success: false,
        message: "Old email, new email, and user ID are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid new email format" });
    }

    // Check if newEmail is already in use
    // const existingUser = await Users.findOne({
    //   $or: [{ email: newEmail }, { newEmail: newEmail }]
    // });

    const existingUser = await Users.findOne({
      email: newEmail,
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "New email is already in use" });
    }

    // Get user by ID
    const user = await Users.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Ensure oldEmail matches the current email
    if (user.email !== oldEmail) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Old email does not match current email",
        });
    }

    // Store the new email temporarily
    user.newEmail = newEmail;
    await user.save();

    // Create JWT token for email change verification
    const verificationToken = jwt.sign(
      { userId: user._id, newEmail },
      // config.JWT_SECRET,
      process.env.JWT_SECRET,
      //  const decoded = jwt.verify(token, config.JWT_SECRET);
      { expiresIn: "72h" }
    );

    // Create verification link
    const verificationLink = `${config.REACT_APP_API_URL_FRONTEND}/verify-user-email?token=${verificationToken}`;

    // Fetch the email template for email change
    const emailTemplate = await emailTemplateModel.findOne({
      category: "email_change_verification",
      isActive: true,
    });

    if (!emailTemplate) {
      return res
        .status(500)
        .json({ success: false, message: "Email template not found" });
    }

    // Replace placeholders
    const emailSubject = emailTemplate.subject.replace(
      "{{companyName}}",
      process.env.COMPANY_NAME
    );

    // const emailBody = emailTemplate.body
    //   .replace(/{{firstName}}/g, firstName || '')
    //   .replace(/{{lastName}}/g, lastName || '')
    //   .replace(/{{email}}/g, email)
    //   .replace(/{{companyName}}/g, process.env.COMPANY_NAME)
    //   .replace(/{{supportEmail}}/g, process.env.SUPPORT_EMAIL);

    // // Send email
    // const emailResponse = await sendEmail(email, emailSubject, emailBody);

    // Replace placeholders in email template
    const emailBody = emailTemplate.body
      .replace(/{{firstName}}/g, user.firstName || "")
      .replace(/{{lastName}}/g, user.lastName || "")
      .replace(/{{oldEmail}}/g, oldEmail)
      .replace(/{{newEmail}}/g, newEmail)
      .replace(/{{actionLink}}/g, verificationLink)
      .replace(/{{companyName}}/g, process.env.COMPANY_NAME)
      .replace(/{{supportEmail}}/g, process.env.SUPPORT_EMAIL);

    // Send email
    await sendEmail(newEmail, emailSubject, emailBody);

    return res.json({
      success: true,
      message: "Verification email sent for email change",
    });
  } catch (error) {
    console.error("Error in requestEmailChangeVerification:", error);
    return res.status(500).json({
      success: false,
      message: "Error sending email change verification",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.verifyEmailChange = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Verification token is required" });
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const { userId, newEmail } = decoded;

    const user = await Users.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.newEmail !== newEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email change request" });
    }

    // Update Users collection
    user.email = newEmail;
    user.newEmail = null;
    user.isEmailVerified = true;
    await user.save();

    // Update Contacts collection
    await Contacts.updateOne(
      { ownerId: userId },
      { $set: { email: newEmail } }
    );

    return res.json({ success: true, message: "Email updated successfully" });
  } catch (error) {
    console.error("Error in verifyEmailChange:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying email change",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Reuse your provided resendVerification function
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await Users.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const organization = await Tenant.findOne({ ownerId: user._id });
    if (!organization) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }

    if (user.isEmailVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email already verified" });
    }

    // Generate verification token
    const verificationToken = jwt.sign(
      { userId: user._id, email },
      config.JWT_SECRET,
      { expiresIn: "72h" }
    );

    // Send verification email
    const emailResult = await sendVerificationEmail({
      type: "initial_email_verification",
      to: email,
      data: {
        email,
        userId: user._id,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        // actionLink: `${config.REACT_APP_API_URL_FRONTEND}/auth/verify-email?token=${verificationToken}`
      },
    });

    if (!emailResult.success) {
      return res
        .status(500)
        .json({ success: false, message: emailResult.message });
    }

    return res.json({ success: true, message: "Verification email resent" });
  } catch (error) {
    console.error("Error in resendVerification:", error);
    return res.status(500).json({
      success: false,
      message: "Error resending verification",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// when organization request is approved
exports.sendApprovalEmail = async ({ to, data }) => {
  try {
    const { email, userId, tenantId, firstName, lastName, actionLink } = data;

    // Validate email
    if (!email || typeof email !== "string") {
      throw new Error("Invalid email address");
    }
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      throw new Error("Tenant not found");
    }
    const orgCompanyName = tenant.company;

    // Get email template
    const emailTemplate = await emailTemplateModel.findOne({
      category: "organization_approval",
      isActive: true,
      isSystemTemplate: true,
    });

    if (!emailTemplate) {
      throw new Error("Email template for organization approval not found");
    }

    // Replace placeholders in email subject and body
    const emailSubject = emailTemplate.subject.replace(
      "{{orgCompanyName}}",
      orgCompanyName
    );

    const emailBody = emailTemplate.body
      .replace(/{{firstName}}/g, firstName || "")
      .replace(/{{lastName}}/g, lastName || "")
      .replace(/{{companyName}}/g, process.env.COMPANY_NAME)
      .replace(/{{actionLink}}/g, actionLink)
      .replace(/{{supportEmail}}/g, process.env.SUPPORT_EMAIL)
      .replace(/{{orgCompanyName}}/g, orgCompanyName)
      .replace(/{{companyName}}/g, process.env.COMPANY_NAME);

    // Send email
    const emailResult = await sendEmail(email, emailSubject, emailBody);

    return emailResult;
  } catch (error) {
    console.error("Error sending approval email:", error);
    return {
      success: false,
      message: "Failed to send approval email",
      error: error.message,
    };
  }
};

// when outsource interviewer request is approved
exports.sendOutsourceApprovalEmail = async ({ to, data }) => {
  try {
    const { email, tenantId, firstName, lastName } = data;

    if (!email || typeof email !== "string") {
      throw new Error("Invalid email address");
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      throw new Error("Tenant not found");
    }
    const companyName = process.env.COMPANY_NAME || "UpInterview";

    const emailTemplate = await emailTemplateModel.findOne({
      category: "outsource_approval",
      isActive: true,
      isSystemTemplate: true,
    });

    if (!emailTemplate) {
      throw new Error("Email template for outsource approval not found");
    }

    // Replace placeholders (no actionLink anymore)
    const emailSubject = emailTemplate.subject
      .replace(/{{companyName}}/g, companyName);

    const emailBody = emailTemplate.body
      .replace(/{{firstName}}/g, firstName || "")
      .replace(/{{lastName}}/g, lastName || "")
      .replace(/{{supportEmail}}/g, process.env.SUPPORT_EMAIL)
      .replace(/{{companyName}}/g, companyName);

    const emailResult = await sendEmail(email, emailSubject, emailBody);

    return emailResult;
  } catch (error) {
    console.error("Error sending outsource approval email:", error);
    return {
      success: false,
      message: "Failed to send outsource approval email",
      error: error.message,
    };
  }
};

//cancel subscription send email
exports.sendEmailNotification = async ({ to, category, data }) => {
  try {
    // Validate inputs
    if (!to || typeof to !== "string") {
      throw new Error("Invalid email address");
    }
    if (!category || typeof category !== "string") {
      throw new Error("Invalid template category");
    }

    // Fetch email template
    const emailTemplate = await emailTemplateModel.findOne({
      category,
      isActive: true,
      isSystemTemplate: true,
    });

    if (!emailTemplate) {
      throw new Error(`Email template for category "${category}" not found`);
    }

    // Replace placeholders in subject and body
    let emailSubject = emailTemplate.subject.replace(
      "{{companyName}}",
      process.env.COMPANY_NAME || "Your Company"
    );

    let emailBody = emailTemplate.body;
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`;
      emailBody = emailBody.replace(new RegExp(placeholder, "g"), value || "");
      emailSubject = emailSubject.replace(
        new RegExp(placeholder, "g"),
        value || ""
      );
    }

    // Send email
    const emailResult = await sendEmail(
      to,
      emailSubject,
      emailBody,
      undefined // ccEmail, if needed
    );

    return {
      success: emailResult.success,
      message: emailResult.success
        ? "Email sent successfully"
        : "Failed to send email",
      error: emailResult.error || null,
    };
  } catch (error) {
    console.error(`Error sending email for category "${category}":`, error);
    return {
      success: false,
      message: "Failed to send email",
      error: error.message,
    };
  }
};
