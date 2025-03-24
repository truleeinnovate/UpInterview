const { CandidateAssessment } = require("../models/candidateAssessment.js");
const { generateOTP, encrypt } = require('../utils/generateOtp.js')
const Otp = require("../models/Otp.js");
const scheduledAssessmentsSchema = require("../models/scheduledAssessmentsSchema.js");
const { Candidate } = require("../models/candidate.js");
const emailTemplateModel = require("../models/EmailTemplatemodel.js");
const sendEmail = require('../utils/sendEmail.js');
const notificationMiddleware = require("../middlewares/notificationMiddleware.js");
exports.assessmentSendEmail = async (req, res) => {
  const { category } = req.body;

  if (!category) {
    return res.status(400).json({ success: false, message: "Category is required" });
  }

  try {
    if (category === "assessment") {
      const { isResendOTP, scheduledAssessmentId, candidates, ownerId, tenantId, assessmentId, ccEmail } = req.body;

      if (!scheduledAssessmentId || !candidates || candidates.length === 0) {
        return res.status(400).json({ success: false, message: "Missing assessment details" });
      }
      for (const candidate of candidates) {
        console.log("candidate.candidateId", candidate.candidateId)
        const candidateData = await Candidate.findOne({ _id: candidate.candidateId });

        if (!candidateData) {
          console.error(`Candidate not found for ID: ${candidate.candidateId}`);
          continue;
        }

        // Generate new OTP
        const otp = generateOTP(candidate.candidateId);
        const expiresAt = new Date(Date.now() + 90 * 1000);

        let updatedOtp = await Otp.findOneAndUpdate(
          { scheduledAssessmentId, candidateId: candidate.candidateId },
          { otp, expiresAt },
          { new: true }
        );

        if (!updatedOtp) {
          console.log("No existing OTP found. Creating a new one.");
          updatedOtp = await Otp.create({ scheduledAssessmentId, candidateId: candidate.candidateId, otp, expiresAt });
        }

        // Ensure candidate.emails is always an array
        const emails = Array.isArray(candidate.emails) ? candidate.emails : [candidate.emails];

        // **Handle Resend OTP**
        // if (isResendOTP) {
        //   // **Generate a new OTP for the candidate**
        //   const otp = generateOTP(candidate._id);
        //   const expiresAt = new Date(Date.now() + 90 * 1000);

        //   // **Update the OTP in the database (Otp schema)**
        //   let updatedOtp = await Otp.findOneAndUpdate(
        //     { scheduledAssessmentId, candidateId: candidate._id }, // Match both fields
        //     { otp }, // Update the OTP field
        //     { new: true } // Return the updated document
        //   );
        //   // If no OTP document is found, create a new one
        //   if (!updatedOtp) {
        //     console.log("No existing OTP document found. Creating a new one.");
        //     updatedOtp = await Otp.create({
        //       scheduledAssessmentId,
        //       candidateId: candidate._id,
        //       otp,
        //       expiresAt,
        //     });
        //   }

        //   // **Resend OTP: Send only OTP using sendEmail function**
        //   const emailSubject = "Resend OTP for Assessment";
        //   const emailBody = `Your new OTP is ${otp}, valid for 90 seconds.`;

        //   const sendEmailResponses = await Promise.all(
        //     emails.map(email => sendEmail(email, emailSubject, emailBody))
        //   );

        //   sendEmailResponses.forEach((response, index) => {
        //     if (!response.success) {
        //       console.error(`Error sending OTP email to ${emails[index]}: ${response.message}`);
        //     }
        //   });

        //   return res.json({ success: true, message: "OTP resent successfully" });
        // }

        // **Normal Email Logic** (This will be skipped when `isResendOTP` is true)
        const candidateAssessmentDetails = await CandidateAssessment.findOne({
          candidateId: candidate.candidateId,
          scheduledAssessmentId,
        });

        if (!candidateAssessmentDetails) {
          console.error(`Assessment details not found for candidate ID: ${candidate.candidateId}`);
          continue;
        }

        const emailTemplate = await emailTemplateModel.findOne({ category });

        if (!emailTemplate) {
          return res.status(404).json({ success: false, message: "Email template not found" });
        }

        const encryptedId = encrypt(candidateAssessmentDetails._id.toString(), 'test')
        console.log("encryptedId", encryptedId)
        const link = `http://localhost:3000/assessmenttest?candidateAssessmentId=${encryptedId}`;

        const updateCandidateAssessments = await CandidateAssessment.findByIdAndUpdate(candidateAssessmentDetails._id, { assessmentLink: link }, { new: true })
        console.log("updateCandidateAssessments", updateCandidateAssessments)
        // Prepare personalized email body from the template
        const emailBody = emailTemplate.body
          .replace("{{candidateName}}", candidateData.LastName)
          .replace("{{expiryDate}}", updateCandidateAssessments.expiryAt.toLocaleString())
          .replace("{{otp}}", otp)
          .replace("{{assessmentLink}}", link);

        // Send emails using sendEmail function
        const sendEmailResponses = await Promise.all(
          emails.map(email => sendEmail(email, emailTemplate.subject, emailBody, ccEmail))
        );

        // notification
        let emailStatus = sendEmailResponses.every(response => response.success) ? "Success" : "Failed";

        // Prepare notification for this candidate
        req.notificationData = [{
          toAddress: emails,
          fromAddress: "ashrafshaik250@gmail.com",
          title: `Assessment Email ${emailStatus}`,
          body: `Email ${emailStatus} for candidate ${candidateData.LastName}.`,
          notificationType: "email",
          object: {
            objectName: "assessment",
            objectId: assessmentId
          },
          status: emailStatus,
          tenantId,
          recipientId: candidate.candidateId,
          createdBy: ownerId,
          modifiedBy: ownerId,
        }];

        // Call middleware to save notification
        await notificationMiddleware(req, res, () => { });


        // Check if any email sending failed
        sendEmailResponses.forEach((response, index) => {
          if (!response.success) {
            console.error(`Error sending email to ${emails[index]}: ${response.message}`);
          }
        });


      }

      return res.json({ success: true, message: "Emails sent successfully" });
    }

    return res.status(400).json({ success: false, message: "Invalid category" });

  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ success: false, message: "Error sending email", error: error.message });
  }
};
exports.customControllerToSendEmail = async (req, res) => {
  try {
    const { candidates, category, isResendOTP, ownerId, tenantId, ccEmail,assessmentId } = req.body;
    const { scheduledAssessmentId, candidatesPayload } = candidates;
    if (category === "assessment") {
      console.log("shareScheduleAssessment section");
      for (let candidate of candidatesPayload) {
        const { candidateId, assessmentLink,recipientId,candidateName,expiryAt } = candidate;
        console.log("expiryAt", expiryAt);


        // let otp = generateOTP(candidateId);
        // let expiresAt = new Date(Date.now() + 90 * 1000);

          // const expiresAt = new Date(Date.now() + 90 * 1000);

          const existingOtpDoc = await Otp.findOne({
            scheduledAssessmentId,
            candidateId,
          });
          // console.log("existingOtpDoc",existingOtpDoc)
          // if (existingOtpDoc) {
          //   // Update the existing OTP document
          //   existingOtpDoc.otp = otp;
          //   existingOtpDoc.expiresAt = expiresAt;
          //   await existingOtpDoc.save();
          // } 
          // else {
          //   // Create a new OTP document if not found
          //   await Otp.create({
          //     scheduledAssessmentId,
          //     candidateId: candidateId,
          //     otp,
          //     expiresAt,
          //   });
          // }
        
        console.log("expiresAt",existingOtpDoc)

        const candidateData = await Candidate.findOne({ _id: candidate.candidateId });
  
        if (!candidateData) {
          console.error(`Candidate not found for ID: ${candidate.candidateId}`);
          continue;
        }
        const emails = Array.isArray(candidate.emails) ? candidate.emails : [candidate.emails];
        const emailTemplate = await emailTemplateModel.findOne({ category });

        if (!emailTemplate) {
          return res.status(404).json({ success: false, message: "Email template not found" });
        }
        // Prepare personalized email body from the template
        const emailBody = emailTemplate.body
          .replace("{{candidateName}}", candidateName)
          .replace("{{expiryDate}}", expiryAt ? new Date(expiryAt).toLocaleString() : "N/A")
          .replace("{{otp}}", existingOtpDoc.otp)
          .replace("{{assessmentLink}}",assessmentLink);

        const sendEmailResponses = await Promise.all(
          emails.map(email => sendEmail(email, emailTemplate.subject, emailBody, ccEmail))
        );

        // notification
        let emailStatus = sendEmailResponses.every(response => response.success) ? "Success" : "Failed";

        // Prepare notification for this candidate
        req.notificationData = [{
          toAddress: emails,
          fromAddress: "ashrafshaik250@gmail.com",
          title: `Assessment Email ${emailStatus}`,
          body: ` Resend email ${emailStatus} for candidate ${candidateData.LastName}.`,
          notificationType: "email",
          object: {
            objectName: "assessment",
            objectId: assessmentId
          },
          status: emailStatus,
          tenantId,
          recipientId,
          createdBy: ownerId,
          modifiedBy: ownerId,
        }];

        // Call middleware to save notification
        await notificationMiddleware(req, res, () => { });


        // Check if any email sending failed
        sendEmailResponses.forEach((response, index) => {
          if (!response.success) {
            console.error(`Error sending email to ${emails[index]}: ${response.message}`);
          }
        });

      }
      return res.status(200).send({
        message: "Resend emails sent successfully",
        success: true,
      });
    } else {
      return res.status(400).json({ success: false, message: "Invalid category" });
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ success: false, message: "Error sending email", error: error.message });
  }
};

