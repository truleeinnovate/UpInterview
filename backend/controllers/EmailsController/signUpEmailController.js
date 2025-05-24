const sendEmail = require("../../utils/sendEmail");
const notificationMiddleware = require("../../middleware/notificationMiddleware");
const { Users } = require("../../models/Users");
const jwt = require("jsonwebtoken");
exports.sendSignUpEmail = async (req, res) => {
    try {
        const { email, tenantId, ownerId, lastName } = req.body;
        if (!email) {
            return res.status(401).json({ success: false, message: "email not found" });
        }

        // Send welcome email
        const subject = "Welcome to Our Application!";
        const emailBody = `
        <h2>Welcome ${lastName}!</h2>
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
            body: `welcome ${lastName}.`,
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
// this code will send email for forgot password and also organization new user creation then user can create there password from mail
exports.forgotPasswordSendEmail = async (req, res) => {
    try {
        console.log('req.body', req.body)
        const { email, type } = req.body;
        console.log('email', email)
        console.log('type', type)
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const user = await Users.findOne({ email });
        console.log('user', user)
        if (!user) {
            return res.status(404).json({ success: false, message: "user not found" });
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

        await sendEmail(email, subject, emailBody);

        return res.json({ success: true, message: `${type === "usercreatepass" ? "Create password" : "Reset password"} email sent`, actionLink });
    } catch (error) {
        console.error("Password Email Error:", error);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
};