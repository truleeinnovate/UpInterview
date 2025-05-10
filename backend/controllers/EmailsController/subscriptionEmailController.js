
const sendEmail = require("../../utils/sendEmail");
const notificationMiddleware = require("../../middleware/notificationMiddleware");
const { Users } = require("../../models/Users");

// this controller use for sending mails in signup or reset password


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
    const emailResponse = await sendEmail(user.Email, subject, emailBody);

    // Save subscription notification
    req.notificationData = [{
      toAddress: user.Email,
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
    const { ownerId, tenantId } = req.body;
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
      toAddress: user.Email,
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

