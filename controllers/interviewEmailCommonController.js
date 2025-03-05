
// const { Candidate } = require("../models/candidate");
// const CryptoJS = require("crypto-js");
// const crypto = require("crypto");
// const emailTemplateModel = require("../models/EmailTemplatemodel");
// const sendEmail = require('../utils/sendEmail');
// const notificationMiddleware = require("../middlewares/notificationMiddleware");




// exports.assessmentSendEmail = async (req, res) => {
//     const { category } = req.body;
  
//     if (!category) {
//       return res.status(400).json({ success: false, message: "Category is required" });
//     }
  
//     try {
//       if (category === "assessment") {
//        const { isResendOTP, scheduledAssessmentId, candidates,ownerId,tenantId,assessmentId } = req.body;
  
//         if (!scheduledAssessmentId || !candidates || candidates.length === 0) {
//           return res.status(400).json({ success: false, message: "Missing assessment details" });
//         }
//         for (const candidate of candidates) {
//         console.log("candidate.candidateId", candidate.candidateId)
//           const candidateData = await Candidate.findOne({ _id: candidate.candidateId });
  
//           if (!candidateData) {
//             console.error(`Candidate not found for ID: ${candidate.candidateId}`);
//             continue;
//           }
  
          
  
//           const encryptedId = encrypt(candidateAssessmentDetails._id.toString(), 'test')
//           console.log("encryptedId", encryptedId)
//           const link = `http://localhost:3000/assessmenttest?candidateAssessmentId=${encryptedId}`;
  
//           const updateCandidateAssessments = await CandidateAssessment.findByIdAndUpdate(candidateAssessmentDetails._id, { assessmentLink: link }, { new: true })
//   console.log("updateCandidateAssessments", updateCandidateAssessments)
//           // Prepare personalized email body from the template
//           const emailBody = emailTemplate.body
//             .replace("{{candidateName}}", candidateData.LastName)
//             .replace("{{expiryDate}}", updateCandidateAssessments.expiryAt.toLocaleString())
//             .replace("{{otp}}", otp)
//             .replace("{{assessmentLink}}", link);
  
//           // Send emails using sendEmail function
//           const sendEmailResponses = await Promise.all(
//             emails.map(email => sendEmail(email, emailTemplate.subject, emailBody))
//           );
  
//           // notification
//           let emailStatus = sendEmailResponses.every(response => response.success) ? "Success" : "Failed";
  
//           // Prepare notification for this candidate
//           req.notificationData = [{
//               toAddress: emails,
//               fromAddress: "ashrafshaik250@gmail.com",
//               title: `Assessment Email ${emailStatus}`,
//               body: `Email ${emailStatus} for candidate ${candidateData.LastName}.`,
//               notificationType: "email",
//               object: {
//                 objectName: "assessment",
//                 objectId: assessmentId
//             },
//               status: emailStatus,
//               tenantId,
//               recipientId: candidate.candidateId,
//               createdBy: ownerId,
//               modifiedBy: ownerId,
//           }];
      
//           // Call middleware to save notification
//           await notificationMiddleware(req, res, () => {});
  
  
//           // Check if any email sending failed
//           sendEmailResponses.forEach((response, index) => {
//             if (!response.success) {
//               console.error(`Error sending email to ${emails[index]}: ${response.message}`);
//             }
//           });
  
          
//         }
  
//         return res.json({ success: true, message: "Emails sent successfully" });
//       }
  
//       return res.status(400).json({ success: false, message: "Invalid category" });
  
//     } catch (error) {
//       console.error("Error sending email:", error);
//       return res.status(500).json({ success: false, message: "Error sending email", error: error.message });
//     }
//   };

 