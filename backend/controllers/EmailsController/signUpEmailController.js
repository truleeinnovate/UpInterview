const sendEmail = require("../../utils/sendEmail");
const notificationMiddleware = require("../../middleware/notificationMiddleware");
const { Users } = require("../../models/Users");
const jwt = require("jsonwebtoken");
const emailTemplateModel = require("../../models/EmailTemplatemodel");
const config = require("../../config");

const mongoose = require('mongoose');
const cron = require('node-cron');
const moment = require('moment');
const { Organization } = require('../../models/Tenant.js');
const { generateEmailVerificationToken } = require('../../utils/jwt');


// exports.sendSignUpEmail = async (req, res) => {
//     try {
//         const { email, tenantId, ownerId, lastName, firstName } = req.body;
//         if (!email) {
//             return res.status(401).json({ success: false, message: "email not found" });
//         }

//         // Send welcome email
//         const subject = "Welcome to Our Application!";
//         const emailBody = `
//         <h2>Welcome ${firstName}${lastName}!</h2>
//         <p>We're excited to have you on board.</p>
//         <p>You can now explore all features of our platform.</p>
//         <br>
//         <p>Best Regards,</p>
//         <p>The Team</p>
//       `;

//         const emailResponse = await sendEmail(email, subject, emailBody);

//         // Save notification
//         req.notificationData = [{
//             toAddress: email,
//             fromAddress: process.env.EMAIL_FROM,
//             title: "Welcome Email Sent",
//             body: `welcome ${firstName}${lastName}.`,
//             notificationType: "email",
//             object: { objectName: "login", objectId: ownerId },
//             status: emailResponse.success ? "Success" : "Failed",
//             tenantId,
//             recipientId: ownerId,
//             createdBy: ownerId,
//             modifiedBy: ownerId,
//         }];

//         await notificationMiddleware(req, res, () => { });

//         return res.json({ success: true, message: "Login successful" });

//     } catch (error) {
//         console.error("Login Error:", error);
//         return res.status(500).json({ success: false, message: "Login failed", error: error.message });
//     }
// };

exports.sendSignUpEmail = async (req, res) => {
  try {
    const { email, tenantId, ownerId, lastName, firstName } = req.body;
    if (!email) {
      return res.status(401).json({ success: false, message: "Email not found" });
    }

    // Get email template
    const emailTemplate = await emailTemplateModel.findOne({ category: 'welcome', isActive: true, isSystemTemplate: true });
    if (!emailTemplate) {
      return res.status(404).json({ success: false, message: "Email template not found" });
    }

    // Replace placeholders
    const emailSubject = emailTemplate.subject
      .replace('{{companyName}}', 'Your Company Name');

    const emailBody = emailTemplate.body
      .replace(/{{firstName}}/g, firstName || '')
      .replace(/{{lastName}}/g, lastName || '')
      .replace(/{{email}}/g, email)
      .replace(/{{companyName}}/g, 'Your Company Name')
      .replace(/{{supportEmail}}/g, 'support@yourcompany.com');

    // Send email
    const emailResponse = await sendEmail(email, emailSubject, emailBody);

    // Save notification
    req.notificationData = [{
      toAddress: email,
      fromAddress: process.env.EMAIL_FROM,
      title: "Welcome Email Sent",
      body: `Welcome ${firstName} ${lastName}`,
      notificationType: "email",
      object: { objectName: "login", objectId: ownerId },
      status: emailResponse.success ? "Success" : "Failed",
      tenantId,
      recipientId: ownerId,
      createdBy: ownerId,
      modifiedBy: ownerId,
    }];

    await notificationMiddleware(req, res, () => { });

    return res.json({ success: true, message: "Signup email sent successfully" });

  } catch (error) {
    console.error("Signup Email Error:", error);
    return res.status(500).json({ success: false, message: "Failed to send signup email", error: error.message });
  }
};






// this code will send email for forgot password and also organization new user creation then user can create there password from mail
// exports.forgotPasswordSendEmail = async (req, res) => {
//     try {
//         const { email, type } = req.body;
//         if (!email) {
//             return res.status(400).json({ success: false, message: "Email is required" });
//         }

//         const user = await Users.findOne({ email });
//         console.log('user', user)
//         if (!user) {
//             return res.status(404).json({ success: false, message: "user not found" });
//         }

//         // Generate a secure token
//         const resetToken = jwt.sign({ id: user._id, type }, process.env.JWT_SECRET, { expiresIn: "15m" });
//         const actionLink = `http://localhost:3000/resetPassword?token=${encodeURIComponent(resetToken)}&type=${type}`;

//         // Define email content dynamically
//         const subject = type === "usercreatepass" ? "Create Your Password" : "Reset Your Password";
//         const emailBody = `
//         <h2>${type === "usercreatepass" ? "Create Your Password" : "Password Reset Request"}</h2>
//         <p>Click the button below to ${type === "usercreatepass" ? "set up your password" : "reset your password"}.</p>
//         <a href="${actionLink}" style="padding:10px 15px; background-color:#28a745; color:white; text-decoration:none; border-radius:5px;">
//           ${type === "usercreatepass" ? "Create Password" : "Reset Password"}
//         </a>
//         <p>If you did not request this, please ignore this email.</p>
//       `;

//         await sendEmail(email, subject, emailBody);

//         return res.json({ success: true, message: `${type === "usercreatepass" ? "Create password" : "Reset password"} email sent`, actionLink });
//     } catch (error) {
//         console.error("Password Email Error:", error);
//         return res.status(500).json({ success: false, message: "Something went wrong" });
//     }
// };



exports.forgotPasswordSendEmail = async (req, res) => {
  try {
    const { email, type } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate token
    const resetToken = jwt.sign({ id: user._id, type }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const actionLink = `${config.REACT_APP_API_URL_FRONTEND}/resetPassword?token=${encodeURIComponent(resetToken)}&type=${type}`;

    // Get email template
    const emailTemplate = await emailTemplateModel.findOne({ category: 'reset_or_create_password', isActive: true, isSystemTemplate: true });
    if (!emailTemplate) {
      return res.status(404).json({ success: false, message: "Email template not found" });
    }

    // Set dynamic values based on type
    const actionType = type === "usercreatepass" ? "Account Setup" : "Password Reset";
    const actionTitle = type === "usercreatepass" ? "Create Your Password" : "Reset Your Password";
    const actionDescription = type === "usercreatepass" ? "set up your account password" : "reset your password";
    const actionButtonText = type === "usercreatepass" ? "Create Password" : "Reset Password";

    // Replace placeholders
    const emailSubject = emailTemplate.subject
      .replace('{{actionType}}', actionType)
      .replace('{{companyName}}', 'Your Company Name');

    const emailBody = emailTemplate.body
      .replace(/{{actionType}}/g, actionType)
      .replace(/{{actionTitle}}/g, actionTitle)
      .replace(/{{actionDescription}}/g, actionDescription)
      .replace(/{{actionButtonText}}/g, actionButtonText)
      .replace(/{{actionLink}}/g, actionLink)
      .replace(/{{companyName}}/g, 'Your Company Name');

    await sendEmail(email, emailSubject, emailBody);

    return res.json({
      success: true,
      message: `${actionTitle} email sent`,
      data: { actionLink } // For testing purposes only
    });

  } catch (error) {
    console.error("Password Email Error:", error);
    return res.status(500).json({ success: false, message: "Failed to send password email" });
  }
};





cron.schedule('0 0 * * *', async () => {
    console.log('Running organization status email reminder job at 1', new Date().toISOString());
  try {
    console.log('Running organization status email reminder job at', new Date().toISOString());

    // 1. Submitted Status Reminders (24h, 48h, 7 days, 30 days)
    const submittedOrganizations = await Organization.find({ status: 'submitted' });
    const emailTemplateSubmitted = await emailTemplateModel.findOne({
      category: 'submitted_status_reminder',
      isActive: true,
      isSystemTemplate: true,
    });

    if (!emailTemplateSubmitted) {
      console.error('No email template found for submitted_status_reminder');
      return;
    }

    for (const organization of submittedOrganizations) {
      const createdAt = moment(organization.createdAt);
      const now = moment();
      const secondsSinceCreation = now.diff(createdAt, 'seconds');

      const hoursSinceCreation = now.diff(createdAt, 'hours');
      const daysSinceCreation = now.diff(createdAt, 'days');

      // Send reminders at 24h, 48h, 7 days, 30 days
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

        const emailSubject = emailTemplateSubmitted.subject
          .replace('{{companyName}}', 'Upinterview');

        const emailBody = emailTemplateSubmitted.body
          .replace(/{{userName}}/g, userName)
          .replace(/{{companyName}}/g, 'Upinterview')
          .replace(/{{supportEmail}}/g, 'support@yourcompany.com')
          .replace(/{{paymentLink}}/g, `${config.REACT_APP_API_URL_FRONTEND}/account-settings/payment`);

        const emailResponse = await sendEmail(user.email, emailSubject, emailBody);

        // Save notification
        // const notificationData = [{
        //   toAddress: user.email,
        //   fromAddress: process.env.EMAIL_FROM,
        //   title: 'Complete Your Payment Process',
        //   body: `Please complete the payment process for your Upinterview organization setup.`,
        //   notificationType: 'email',
        //   object: { objectName: 'organization', objectId: organization.ownerId },
        //   status: emailResponse.success ? 'Success' : 'Failed',
        //   tenantId: organization._id,
        //   recipientId: organization.ownerId,
        //   createdBy: organization.ownerId,
        //   modifiedBy: organization.ownerId,
        // }];

        // await notificationMiddleware({ notificationData }, { json: () => { } }, () => { });
        console.log(`Submitted status reminder sent to ${user.email} for organization ${organization._id} at ${hoursSinceCreation} hours/${daysSinceCreation} days`);
      }
    }

    // 2. Draft Status Reminders (24h, 48h, 7 days, 30 days)
    const draftOrganizations = await Organization.find({ status: 'draft' });
    const emailTemplateDraft = await emailTemplateModel.findOne({
      category: 'draft_status_reminder',
      isActive: true,
      isSystemTemplate: true,
    });

    if (!emailTemplateDraft) {
      console.error('No email template found for draft_status_reminder');
      return;
    }

    for (const organization of draftOrganizations) {
      const createdAt = moment(organization.createdAt);
      const now = moment();
      const hoursSinceCreation = now.diff(createdAt, 'hours');
      const daysSinceCreation = now.diff(createdAt, 'days');

      // Send reminders at 24h, 48h, 7 days, 30 days
      const reminderTriggers = [
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

        const emailSubject = emailTemplateDraft.subject
          .replace('{{companyName}}', 'Upinterview');

        const emailBody = emailTemplateDraft.body
          .replace(/{{userName}}/g, userName)
          .replace(/{{companyName}}/g, 'Upinterview')
          .replace(/{{supportEmail}}/g, 'support@yourcompany.com')
          .replace(/{{profileLink}}/g, `${config.REACT_APP_API_URL_FRONTEND}/account-settings/profile`);

        const emailResponse = await sendEmail(user.email, emailSubject, emailBody);

        // Save notification
        // const notificationData = [{
        //   toAddress: user.email,
        //   fromAddress: process.env.EMAIL_FROM,
        //   title: 'Complete Your Profile',
        //   body: `Please complete your Upinterview organization profile setup.`,
        //   notificationType: 'email',
        //   object: { objectName: 'organization', objectId: organization.ownerId },
        //   status: emailResponse.success ? 'Success' : 'Failed',
        //   tenantId: organization._id,
        //   recipientId: organization.ownerId,
        //   createdBy: organization.ownerId,
        //   modifiedBy: organization.ownerId,
        // }];

        // await notificationMiddleware({ notificationData }, { json: () => { } }, () => { });
        console.log(`Draft status reminder sent to ${user.email} for organization ${organization._id} at ${hoursSinceCreation} hours/${daysSinceCreation} days`);
      }
    }

    console.log('Organization status email reminder job completed successfully.');
  } catch (error) {
    console.error('Organization Status Email Reminder Job Error:', error);
  }
});



//email verification
// exports.resendVerification = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ success: false, message: 'Email is required' });
//     }

//     const user = await Users.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     const organization = await Organization.findOne({ ownerId: user._id });
//     if (!organization) {
//       return res.status(404).json({ success: false, message: 'Organization not found' });
//     }

//     if (organization.isEmailVerified) {
//       return res.status(400).json({ success: false, message: 'Email already verified' });
//     }

//     // Generate new token
//     const verificationToken = generateEmailVerificationToken(email, user._id);
//     const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

//     // Get email template
//     const emailTemplate = await emailTemplateModel.findOne({ 
//       category: 'email_verification',
//       isActive: true 
//     });

//     if (!emailTemplate) {
//       console.error('Email template not found');
//       return res.status(500).json({ success: false, message: 'Email template not configured' });
//     }

//     const emailBody = emailTemplate.body
//       .replace(/{{verificationLink}}/g, verificationLink)
//       .replace(/{{firstName}}/g, user.firstName || '')
//       .replace(/{{lastName}}/g, user.lastName || '');

//     // Send email
//     try {
//       await sendEmail(email, emailTemplate.subject, emailBody);
//       console.log(`Verification email sent to ${email}`);
//       return res.json({ success: true, message: 'Verification email resent' });
//     } catch (emailError) {
//       console.error('Failed to send email:', emailError);
//       return res.status(500).json({ success: false, message: 'Failed to send verification email' });
//     }

//   } catch (error) {
//     console.error('Error in resendVerification:', error);
//     return res.status(500).json({ 
//       success: false, 
//       message: 'Error resending verification',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };


// First, define the sendVerificationEmail function (can be at the top of the file)
const sendVerificationEmail = async (email, userId, firstName, lastName) => {
  try {
    // Generate verification token
    const verificationToken = generateEmailVerificationToken(email, userId);
    const verificationLink = `${config.REACT_APP_API_URL_FRONTEND}/verify-email?token=${verificationToken}`;

    // Get email template
    const emailTemplate = await emailTemplateModel.findOne({
      category: 'email_verification',
      isActive: true,
    });

    if (!emailTemplate) {
      throw new Error('Email template not found');
    }

    const emailBody = emailTemplate.body
      .replace(/{{verificationLink}}/g, verificationLink)
      .replace(/{{firstName}}/g, firstName || '')
      .replace(/{{lastName}}/g, lastName || '');

    // Send email
    await sendEmail(email, emailTemplate.subject, emailBody);
    console.log(`Verification email sent to ${email}`);
    return { success: true, message: 'Verification email sent' };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, message: 'Failed to send verification email', error: error.message };
  }
};

// Then export it so it can be used elsewhere
exports.sendVerificationEmail = sendVerificationEmail;

// Then define the resendVerification function that uses it
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await Users.findOne({ email });
    console.log('user', user);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const organization = await Organization.findOne({ ownerId: user._id });
    console.log('organization', organization);

    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    if (organization.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    // Use the sendVerificationEmail function we defined above
    const emailResult = await sendVerificationEmail(email, user._id, user.firstName, user.lastName);
    if (!emailResult.success) {
      return res.status(500).json({ success: false, message: emailResult.message });
    }

    return res.json({ success: true, message: 'Verification email resent' });
  } catch (error) {
    console.error('Error in resendVerification:', error);
    return res.status(500).json({
      success: false,
      message: 'Error resending verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};