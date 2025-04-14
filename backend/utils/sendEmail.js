const nodemailer = require('nodemailer');
const fs = require("fs");

// const sendEmail = async (toEmails, subject, messageBody) => {
//   try {
//     // Ensure `toEmails` is an array
//     if (!Array.isArray(toEmails)) {
//       throw new Error("toEmails must be an array");
//     }
//     // console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
//     // console.log("EMAIL_PORT:", process.env.EMAIL_PORT);
//     // console.log("EMAIL_USERNAME:", process.env.EMAIL_USERNAME);
//     // console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD);

//     // Create transporter for SMTP
//     const transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,  // SMTP server (e.g., smtp.hostinger.com)
//       port: process.env.EMAIL_PORT || 587,
//       secure: false,  // Use STARTTLS
//       auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD
//       },
//       tls: {
//         rejectUnauthorized: false  // Allows insecure connections if needed
//       }
//     });

//     // Convert email array to a comma-separated string
//     const toEmailsString = toEmails.join(', ');

//     // Email options
//     const mailOptions = {
//       from: process.env.EMAIL_USERNAME,  // Sender email
//       to: toEmailsString,  // Multiple recipients
//       subject: subject,
//       text: messageBody
//     };

//     // Send email
//     const info = await transporter.sendMail(mailOptions);
//     console.log('Email sent: ', info.response);
//     return { success: true, message: 'Emails sent successfully!' };
//   } catch (error) {
//     console.error('Error sending emails:', error);
//     return { success: false, message: error.message };
//   }
// };

const sendEmail = async (toEmail, subject, messageBody, ccEmail) => {
  try {
    if (!toEmail) throw new Error("Recipient email is required");

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 465, // Ensure it's 465 for SSL
      secure: true, // MUST be true for port 465
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: true // Ensure valid SSL/TLS
      }
    });
    


    // Inline image example (CID)
    const inlineImage = {
      filename: "logo.png",
      path: "./assets/logo.png",
      cid: "logo_cid"
    };


    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: toEmail,  // Sending one email at a time
      cc: ccEmail,
      subject: subject,
      // text: messageBody,
      html: `<p>${messageBody}</p><br><img src="cid:logo_cid"/>`, // HTML email with inline image
      priority: "high", // Can be "high", "normal", "low"
      headers: {
        "X-Custom-Header": "Upinterview"
      },
      // attachments: [
      //   inlineImage,
      //   {
      //     filename: "sample.pdf",
      //     path: "./documents/sample.pdf"
      //   }
      // ]
    };
    console.log(mailOptions);

    const info = await transporter.sendMail(mailOptions);


    // Check if SMTP returns a rejection (immediate bounce)
    if (info.rejected.length > 0) {
      return { success: false, message: `Invalid email: ${to}` };
    }

    console.log(`Email sent to ${toEmail}:`, info.response);

    return { success: true, message: `Email sent successfully to ${toEmail}` };

  } catch (error) {
    console.error(`Error sending email to ${toEmail}:`, error);
    return { success: false, message: error.message };
  }
};

module.exports = sendEmail;
