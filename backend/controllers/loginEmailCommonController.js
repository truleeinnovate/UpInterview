const sendEmail = require("../utils/sendEmail.js");
const notificationMiddleware = require("../middleware/notificationMiddleware.js");
const { Users } = require("../models/Users");
const jwt = require("jsonwebtoken");

// this controller use for sending mails in signup or reset password

exports.loginSendEmail = async (req, res) => {
  try {
    const { email,tenantId,ownerId,name } = req.body;
    if (!email) {
      return res.status(401).json({ success: false, message: "email not found" });
    }

    // Send welcome email
    const subject = "Welcome to Our Application!";
    const emailBody = `
      <h2>Welcome ${name}!</h2>
      <p>We're excited to have you on board.</p>
      <p>You can now explore all features of our platform.</p>
      <br>
      <p>Best Regards,</p>
      <p>The Team</p>
    `;

    const emailResponse = await sendEmail(email, subject, emailBody);

    // Save notification
    req.notificationData = [{
      toAddress: email,
      fromAddress: process.env.EMAIL_FROM,
      title: "Welcome Email Sent",
      body: `welcome ${name}.`,
      notificationType: "email",
      object: { objectName: "login", objectId: ownerId },
      status: emailResponse.success ? "Success" : "Failed",
      tenantId,
      recipientId: ownerId,
      createdBy: ownerId,
      modifiedBy: ownerId,
    }];

    await notificationMiddleware(req, res, () => { });

    return res.json({ success: true, message: "Login successful" });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Login failed", error: error.message });
  }
};

exports.afterSubscribePlan = async (req, res) => {
  try {
    const { ownerId, tenantId, planName, planPrice, duration } = req.body;
    const user = await Users.findOne({ _id: ownerId });

    // Prepare email content
    const subject = "Subscription Activated Successfully!";
    const emailBody = `
      <h2>Thank You for Subscribing!</h2>
      <p>Dear ${user.Name},</p>
      <p>You've successfully subscribed to the <b>${planName}</b> plan.</p>
      <p>Plan Price: <b>${planPrice}</b></p>
      <p>Duration: <b>${duration}</b></p>
      <br>
      <p>We appreciate your support!</p>
      <p>Best Regards,<br>The Team</p>
    `;

    // Send subscription confirmation email
    const emailResponse = await sendEmail( user.Email, subject, emailBody);

    // Save subscription notification
    req.notificationData = [{
      toAddress:  user.Email,
      fromAddress: process.env.EMAIL_FROM,
      title: "Subscription Plan Activated",
      body: `Subscription for plan ${planName} has been activated successfully.`,
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
    const { ownerId, tenantId} = req.body;
    const user = await Users.findOne({ _id: ownerId });
    const planName = "Base Plan";

    // Email content for free plan
    const subject = "Welcome to the Free Plan!";
    const emailBody = `
      <h2>You're Now Subscribed to Our Free Plan!</h2>
      <p>Dear ${user.Name},</p>
      <p>You've successfully subscribed to the <b>${planName}</b>.</p>
      <p>Enjoy limited features, and upgrade anytime to unlock premium benefits.</p>
      <br>
      <h3>Upgrade to a Premium Plan!</h3>
      <p>Unlock exclusive features and benefits by upgrading to a premium plan.</p>
      <p><a href="https://localhost:3000/subscriptionPlan" style="color: blue;">Click here to upgrade</a></p>
      <br>
      <p>Best Regards,<br>The Team</p>
    `;

    // Send email to the user
    const emailResponse = await sendEmail(user.Email, subject, emailBody);

    // Save notification for free plan subscription
    req.notificationData = [{
      toAddress:  user.Email,
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
// this code will send email for forgot password and also organization new user creation then user can create there password from mail
exports.forgotPasswordSendEmail = async (req, res) => {
  try {
    const { Email, type } = req.body;
    if (!Email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await Users.findOne({ Email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Email not found" });
    }

    // Generate a secure token
    const resetToken = jwt.sign({ id: user._id, type }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const actionLink = `http://localhost:3000/resetPassword?token=${encodeURIComponent(resetToken)}&type=${type}`;

    // Define email content dynamically
    const subject = type === "usercreatepass" ? "Create Your Password" : "Reset Your Password";
    const emailBody = `
      <h2>${type === "usercreatepass" ? "Create Your Password" : "Password Reset Request"}</h2>
      <p>Click the button below to ${type === "usercreatepass" ? "set up your password" : "reset your password"}.</p>
      <a href="${actionLink}" style="padding:10px 15px; background-color:#28a745; color:white; text-decoration:none; border-radius:5px;">
        ${type === "usercreatepass" ? "Create Password" : "Reset Password"}
      </a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await sendEmail(Email, subject, emailBody);

    return res.json({ success: true, message: `${type === "usercreatepass" ? "Create password" : "Reset password"} email sent`, actionLink });
  } catch (error) {
    console.error("Password Email Error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
