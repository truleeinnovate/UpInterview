const sendEmail = require("../../utils/sendEmail");
const notificationMiddleware = require("../../middleware/notificationMiddleware");
const { Users } = require("../../models/Users");
const jwt = require("jsonwebtoken");
const emailTemplateModel = require("../../models/EmailTemplatemodel");
const config = require("../../config");



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
        const emailTemplate = await emailTemplateModel.findOne({ category: 'welcome',isActive: true,isSystemTemplate: true });
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
        const emailTemplate = await emailTemplateModel.findOne({ category: 'reset_or_create_password',isActive: true,isSystemTemplate: true });
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