const sendEmail = require("../../utils/sendEmail");
const notificationMiddleware = require("../../middleware/notificationMiddleware");
const { Users } = require("../../models/Users");
const jwt = require("jsonwebtoken");
const emailTemplateModel = require("../../models/EmailTemplatemodel");
const config = require("../../config");

const mongoose = require('mongoose');
const cron = require('node-cron');
const moment = require('moment');
const Tenant = require('../../models/Tenant.js');
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
    const { tenantId, ownerId } = req.body;
    if (!ownerId) {
      return res.status(401).json({ success: false, message: "ownerId not found" });
    }
    const user = await Users.findOne({ _id: ownerId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const email = user.email;
    const lastName = user.lastName;
    const firstName = user.firstName;

    // Get email template
    const emailTemplate = await emailTemplateModel.findOne({ category: 'welcome', isActive: true, isSystemTemplate: true });
    if (!emailTemplate) {
      return res.status(404).json({ success: false, message: "Email template not found" });
    }

    // Replace placeholders
    const emailSubject = emailTemplate.subject
      .replace('{{companyName}}', process.env.COMPANY_NAME);

    const emailBody = emailTemplate.body
      .replace(/{{firstName}}/g, firstName || '')
      .replace(/{{lastName}}/g, lastName || '')
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

    req.notificationData = [{
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
      .replace('{{companyName}}', process.env.COMPANY_NAME);

    const emailBody = emailTemplate.body
      .replace(/{{actionType}}/g, actionType)
      .replace(/{{actionTitle}}/g, actionTitle)
      .replace(/{{actionDescription}}/g, actionDescription)
      .replace(/{{actionButtonText}}/g, actionButtonText)
      .replace(/{{actionLink}}/g, actionLink)
      .replace(/{{companyName}}/g, process.env.COMPANY_NAME);

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
  console.log('\n===== Running TEST Organization Status Email Reminder Job =====');
  console.log('Start Time:', new Date().toISOString());

  try {
    console.log('[INFO] Fetching organizations with status "submitted"...');
    const submittedOrganizations = await Organization.find({ status: 'submitted' });
    console.log(`[INFO] Found ${submittedOrganizations.length} submitted organizations.`);

    const emailTemplateSubmitted = await emailTemplateModel.findOne({
      category: 'submitted_status_reminder',
      isActive: true,
      isSystemTemplate: true,
    });

    if (!emailTemplateSubmitted) {
      console.error('[ERROR] No email template found for submitted_status_reminder');
      return;
    }

    for (const organization of submittedOrganizations) {
      console.log(`\n[PROCESSING] Organization ID: ${organization._id} (submitted)`);

      const createdAt = moment(organization.createdAt);
      const now = moment();

      // const secondsSinceCreation = now.diff(createdAt, 'seconds');
      const hoursSinceCreation = now.diff(createdAt, 'hours');
      const daysSinceCreation = now.diff(createdAt, 'days');

      // console.log(`[DEBUG] Time since creation: ${secondsSinceCreation}s / ${hoursSinceCreation}h / ${daysSinceCreation}d`);

      const reminderTriggers = [ 
        // secondsSinceCreation >= 10 && secondsSinceCreation <= 20,
        hoursSinceCreation === 24,
        hoursSinceCreation === 48,
        daysSinceCreation === 7,
        daysSinceCreation === 30,
      ];

      if (reminderTriggers.some(trigger => trigger)) {
        const user = await Users.findOne({ _id: organization.ownerId });

        if (!user || !user.email) {
          console.warn(`[WARNING] No user or email found for ownerId: ${organization.ownerId}`);
          continue;
        }

        const userName = (user.firstName ? user.firstName + ' ' : '') + (user.lastName || '');

        const emailSubject = emailTemplateSubmitted.subject.replace('{{companyName}}', process.env.COMPANY_NAME);
        const emailBody = emailTemplateSubmitted.body
          .replace(/{{userName}}/g, userName)
          .replace(/{{companyName}}/g, process.env.COMPANY_NAME)
          .replace(/{{supportEmail}}/g, process.env.SUPPORT_EMAIL)
          .replace(/{{paymentLink}}/g, `${config.REACT_APP_API_URL_FRONTEND}/account-settings/payment`);

        console.log(`[SENDING EMAIL] To: ${user.email}, Subject: "${emailSubject}"`);
        const emailResponse = await sendEmail(user.email, emailSubject, emailBody);
        console.log(`[EMAIL STATUS] Success: ${emailResponse.success}`);

        console.log(`[SUCCESS] Reminder sent for submitted organization ${organization._id}`);
      } else {
        console.log('[SKIPPED] Reminder not due yet.');
      }
    }

    console.log('\n[INFO] Fetching organizations with status "draft"...');
    const draftOrganizations = await Organization.find({ status: 'draft' });
    console.log(`[INFO] Found ${draftOrganizations.length} draft organizations.`);

    const emailTemplateDraft = await emailTemplateModel.findOne({
      category: 'draft_status_reminder',
      isActive: true,
      isSystemTemplate: true,
    });

    if (!emailTemplateDraft) {
      console.error('[ERROR] No email template found for draft_status_reminder');
      return;
    }

    for (const organization of draftOrganizations) {
      console.log(`\n[PROCESSING] Organization ID: ${organization._id} (draft)`);

      const createdAt = moment(organization.createdAt);
      const now = moment();

      const hoursSinceCreation = now.diff(createdAt, 'hours');
      const daysSinceCreation = now.diff(createdAt, 'days');

      console.log(`[DEBUG] Time since creation: ${hoursSinceCreation}h / ${daysSinceCreation}d`);

      const reminderTriggers = [
        hoursSinceCreation === 24,
        hoursSinceCreation === 48,
        daysSinceCreation === 7,
        daysSinceCreation === 30,
      ];

      if (reminderTriggers.some(trigger => trigger)) {
        const user = await Users.findOne({ _id: organization.ownerId });

        if (!user || !user.email) {
          console.warn(`[WARNING] No user or email found for ownerId: ${organization.ownerId}`);
          continue;
        }

        const userName = (user.firstName ? user.firstName + ' ' : '') + (user.lastName || '');

        const emailSubject = emailTemplateDraft.subject.replace('{{companyName}}', process.env.COMPANY_NAME);
        const emailBody = emailTemplateDraft.body
          .replace(/{{userName}}/g, userName)
          .replace(/{{companyName}}/g, process.env.COMPANY_NAME)
          .replace(/{{supportEmail}}/g, process.env.SUPPORT_EMAIL)
          .replace(/{{profileLink}}/g, `${config.REACT_APP_API_URL_FRONTEND}/account-settings/profile`);

        console.log(`[SENDING EMAIL] To: ${user.email}, Subject: "${emailSubject}"`);
        const emailResponse = await sendEmail(user.email, emailSubject, emailBody);
        console.log(`[EMAIL STATUS] Success: ${emailResponse.success}`);

        console.log(`[SUCCESS] Reminder sent for draft organization ${organization._id}`);
      } else {
        console.log('[SKIPPED] Reminder not due yet.');
      }
    }

    console.log('\n✅ Organization status email reminder job completed at:', new Date().toISOString());
  } catch (error) {
    console.error('\n❌ Organization Status Email Reminder Job Error:', error);
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
    // console.log(`Verification email sent to ${email}`);
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
    // console.log('user', user);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const organization = await Tenant.findOne({ ownerId: user._id });
    // console.log('organization', organization);

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


//users tab emails 
exports.requestEmailChangeVerification = async (req, res) => {
  try {
    const { oldEmail, newEmail, userId } = req.body;

    if (!oldEmail || !newEmail || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Old email, new email, and user ID are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({ success: false, message: 'Invalid new email format' });
    }

    // Check if newEmail is already in use
    // const existingUser = await Users.findOne({
    //   $or: [{ email: newEmail }, { newEmail: newEmail }]
    // });

    const existingUser = await Users.findOne({
  email: newEmail
});
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'New email is already in use' });
    }

    // Get user by ID
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Ensure oldEmail matches the current email
    if (user.email !== oldEmail) {
      return res.status(400).json({ success: false, message: 'Old email does not match current email' });
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
      { expiresIn: '72h' }
    );

    // Create verification link
    const verificationLink = `${config.REACT_APP_API_URL_FRONTEND}/verify-user-email?token=${verificationToken}`;

    console.log("verificationLink",verificationLink);
    

    // Fetch the email template for email change
    const emailTemplate = await emailTemplateModel.findOne({
      category: 'email_change_verification',
      isActive: true
    });

    if (!emailTemplate) {
      return res.status(500).json({ success: false, message: 'Email template not found' });
    }
    
    // Replace placeholders
    const emailSubject = emailTemplate.subject
      .replace('{{companyName}}', process.env.COMPANY_NAME);

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
      .replace(/{{firstName}}/g, user.firstName || '')
      .replace(/{{lastName}}/g, user.lastName || '')
      .replace(/{{oldEmail}}/g, oldEmail)
      .replace(/{{newEmail}}/g, newEmail)
      .replace(/{{actionLink}}/g, verificationLink);


      // console.log("verificationLink",verificationLink);
      
    // Send email
    await sendEmail(newEmail, emailSubject, emailBody);

    return res.json({ success: true, message: 'Verification email sent for email change' });

  } catch (error) {
    console.error('Error in requestEmailChangeVerification:', error);
    return res.status(500).json({
      success: false,
      message: 'Error sending email change verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



// exports.requestEmailChangeVerification = async (req, res) => {
//   try {
//     const { oldEmail, newEmail, userId } = req.body;

//     if (!oldEmail || !newEmail || !userId) {
//       return res.status(400).json({ success: false, message: 'Old email, new email, and user ID are required' });
//     }

//     // Validate new email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(newEmail)) {
//       return res.status(400).json({ success: false, message: 'Invalid new email format' });
//     }

//     // Check if newEmail is already used
//     const existingUser = await Users.findOne({ $or: [{ email: newEmail }, { newEmail: newEmail }] });
//     if (existingUser) {
//       return res.status(400).json({ success: false, message: 'New email is already in use' });
//     }

//     const user = await Users.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     if (user.email !== oldEmail) {
//       return res.status(400).json({ success: false, message: 'Old email does not match current email' });
//     }

//     console.log("user._id",user._id);
    

//     // const organization = await Tenant.findOne({ tenantId: user._id });
//     // if (!organization) {
//     //   return res.status(404).json({ success: false, message: 'Organization not found' });
//     // }

//     // Store newEmail
//     user.newEmail = newEmail;
//     await user.save();

//     // Generate verification token
//     const verificationToken = jwt.sign(
//       { userId: user._id, newEmail },
//       config.JWT_SECRET,
//       { expiresIn: '72h' }
//     );

//     // Send verification email
//     const emailResult = await sendVerificationEmail({
//       type: 'email_change_verification',
//       to: newEmail,
//       data: {
//         firstName: user.firstName || '',
//         lastName: user.lastName || '',
//         oldEmail,
//         newEmail,
//         actionLink: `${config.REACT_APP_API_URL}/auth/verify-email-change?token=${verificationToken}`
//       }
//     });

//     if (!emailResult.success) {
//       return res.status(500).json({ success: false, message: emailResult.message });
//     }

//     return res.json({ success: true, message: 'Verification email sent for email change' });
//   } catch (error) {
//     console.error('Error in requestEmailChangeVerification:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Error sending email change verification',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

exports.verifyEmailChange = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required' });
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const { userId, newEmail } = decoded;

    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.newEmail !== newEmail) {
      return res.status(400).json({ success: false, message: 'Invalid email change request' });
    }

    // Update Users collection
    user.email = newEmail;
    user.newEmail = null;
    user.isEmailVerified = true;
    await user.save();

    // Update Contacts collection
    await Contact.updateOne(
      { contactId: userId },
      { $set: { email: newEmail } }
    );

    return res.json({ success: true, message: 'Email updated successfully' });
  } catch (error) {
    console.error('Error in verifyEmailChange:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying email change',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Reuse your provided resendVerification function
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const organization = await Tenant.findOne({ ownerId: user._id });
    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    // Generate verification token
    const verificationToken = jwt.sign(
      { userId: user._id, email },
      config.JWT_SECRET,
      { expiresIn: '72h' }
    );

    // Send verification email
    const emailResult = await sendVerificationEmail({
      type: 'initial_email_verification',
      to: email,
      data: {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        actionLink: `${config.REACT_APP_API_URL}/auth/verify-email?token=${verificationToken}`
      }
    });

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