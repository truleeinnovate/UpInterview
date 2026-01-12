const nodemailer = require("nodemailer");
const fs = require("fs");

const sendEmail = async (toEmail, subject, messageBody, ccEmail) => {
  try {
    if (!toEmail) throw new Error("Recipient email is required");

    // const transporter = nodemailer.createTransport({
    //   host: process.env.EMAIL_HOST,
    //   port: process.env.EMAIL_PORT || 465, // Ensure it's 465 for SSL
    //   secure: true, // MUST be true for port 465
    //   auth: {
    //     user: process.env.EMAIL_USERNAME,
    //     pass: process.env.EMAIL_PASSWORD
    //   },
    //   tls: {
    //     rejectUnauthorized: true // Ensure valid SSL/TLS
    //   }
    // });

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT), // Convert to number
      secure: process.env.EMAIL_PORT === "465", // true for 465, false otherwise
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        // Only needed for some providers
        rejectUnauthorized: false, // Set to true in production with valid certs
      },
    });

    // Inline image example (CID)
    const inlineImage = {
      filename: "logo.png",
      path: "./assets/logo.png",
      cid: "logo_cid",
    };

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: toEmail, // Sending one email at a time
      cc: ccEmail,
      subject: subject,
      // text: messageBody,
      html: `<p>${messageBody}</p><br><img src="cid:logo_cid"/>`, // HTML email with inline image
      priority: "high", // Can be "high", "normal", "low"
      headers: {
        "X-Custom-Header": "Upinterview",
      },
      // attachments: [
      //   inlineImage,
      //   {
      //     filename: "sample.pdf",
      //     path: "./documents/sample.pdf"
      //   }
      // ]
    };

    const info = await transporter.sendMail(mailOptions);

    // Check if SMTP returns a rejection (immediate bounce)
    if (info.rejected.length > 0) {
      return { success: false, message: `Invalid email: ${to}` };
    }

    return { success: true, message: `Email sent successfully to ${toEmail}` };
  } catch (error) {
    console.error(`Error sending email to ${toEmail}:`, error);
    return { success: false, message: error.message };
  }
};

module.exports = sendEmail;
