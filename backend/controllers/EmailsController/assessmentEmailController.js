const { CandidateAssessment } = require("../../models/candidateAssessment");
const { encrypt } = require('../../utils/generateOtp')
const ScheduleAssessment = require('../../models/scheduledAssessmentsSchema');
const { Candidate } = require("../../models/candidate");
const CryptoJS = require("crypto-js");
const crypto = require("crypto");
const emailTemplateModel = require("../../models/EmailTemplatemodel");
const sendEmail = require('../../utils/sendEmail');
const notificationMiddleware = require("../../middleware/notificationMiddleware");
const { generateOTP } = require('../../utils/generateOtp')
const Otp = require("../../models/Otp");
const mongoose = require("mongoose");
const Notification = require("../../models/notification");
const Assessment = require("../../models/assessment");
const config = require("../../config");


// exports.shareAssessment = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const {
//       assessmentId,
//       selectedCandidates,
//       organizationId,
//       userId,
//     } = req.body;

//     if (!assessmentId || !mongoose.isValidObjectId(assessmentId)) {
//       return res.status(400).json({ success: false, message: 'Invalid or missing assessment ID' });
//     }

//     if (!selectedCandidates || selectedCandidates.length === 0) {
//       return res.status(400).json({ success: false, message: 'No candidates selected' });
//     }

//     // 1. Fetch the assessment to get linkExpiryDays
//     const assessment = await Assessment.findById(assessmentId).session(session);
//     if (!assessment) {
//       throw new Error('Assessment not found');
//     }
//     const linkExpiryDays = assessment.linkExpiryDays || 3; // Default to 3 if not specified

//     // 2. Create a new ScheduleAssessment
//     const scheduleCount = await ScheduleAssessment.countDocuments({ assessmentId }).session(session);
//     const order = `Assessment ${scheduleCount + 1}`;

//     const scheduleAssessment = new ScheduleAssessment({
//       assessmentId,
//       organizationId,
//       status: 'scheduled',
//       proctoringEnabled: true,
//       createdBy: userId,
//       order,
//     });
//     await scheduleAssessment.save({ session });

//     // 3. Check for existing CandidateAssessments within this ScheduledAssessment
//     const existingAssessments = await CandidateAssessment.find({
//       scheduledAssessmentId: scheduleAssessment._id,
//       candidateId: { $in: selectedCandidates.map((c) => c._id) },
//     }).session(session);

//     const existingCandidateIdsSet = new Set(existingAssessments.map((a) => a.candidateId.toString()));

//     // Filter out candidates who are already in this ScheduledAssessment
//     const newCandidates = selectedCandidates.filter(
//       (candidate) => !existingCandidateIdsSet.has(candidate._id.toString())
//     );

//     if (newCandidates.length === 0) {
//       await session.commitTransaction();
//       return res.status(200).json({
//         success: true,
//         message: 'All selected candidates are already assigned to this schedule',
//         data: { scheduledAssessmentId: scheduleAssessment._id },
//       });
//     }

//     // 4. Create CandidateAssessments for new candidates
//     const expiryAt = new Date(Date.now() + linkExpiryDays * 24 * 60 * 60 * 1000); // Calculate expiry date
//     const candidateAssessments = newCandidates.map((candidate) => ({
//       scheduledAssessmentId: scheduleAssessment._id,
//       candidateId: candidate._id,
//       status: 'pending',
//       expiryAt, // Pass expiryAt to CandidateAssessment
//       isActive: true,
//       assessmentLink: '',
//     }));

//     const insertedAssessments = await CandidateAssessment.insertMany(candidateAssessments, { session });

//     // 5. Send emails and update assessment links
//     const notifications = [];
//     const emailTemplate = await emailTemplateModel.findOne({ category: 'assessment' }).session(session);
//     if (!emailTemplate && newCandidates.length > 0) {
//       throw new Error('Email template not found');
//     }

//     for (const candidate of newCandidates) {
//       const candidateData = await Candidate.findOne({ _id: candidate._id }).session(session);
//       if (!candidateData) {
//         console.error(`Candidate not found for ID: ${candidate._id}`);
//         continue;
//       }

//       const emails = Array.isArray(candidate.emails)
//         ? candidate.emails
//         : candidate.emails
//           ? [candidate.emails]
//           : candidate.Email
//             ? [candidate.Email]
//             : [];
//       if (emails.length === 0) {
//         console.error(`No valid email for candidate ID: ${candidate._id}`);
//         continue;
//       }

//       const candidateAssessment = insertedAssessments.find(
//         (ca) => ca.candidateId.toString() === candidate._id.toString()
//       );
//       if (!candidateAssessment) continue;

//       const encryptedId = encrypt(candidateAssessment._id.toString(), 'test');
//       const link = `http://localhost:3000/assessmenttest?candidateAssessmentId=${encryptedId}`;

//       await CandidateAssessment.findByIdAndUpdate(
//         candidateAssessment._id,
//         { assessmentLink: link },
//         { session }
//       );

//       const cleanedBody = emailTemplate.body.replace(/[\n\r]/g, '');
//       // Prepare personalized email body with expiry date
//       const emailBody = cleanedBody
//         .replace('{{candidateName}}',
//           (candidate.FirstName ? candidate.FirstName + ' ' : '') +
//           (candidate.LastName || 'Candidate')
//         )
//         .replace('{{expiryDate}}', expiryAt.toLocaleString()) // Use calculated expiryAt
//         .replace('{{assessmentLink}}', `${link}<br><br>`);

//       // Send emails
//       const sendEmailResponses = await Promise.all(
//         emails.map((email) => sendEmail(email, emailTemplate.subject, emailBody))
//       );

//       const emailStatus = sendEmailResponses.every((response) => response.success)
//         ? 'Success'
//         : 'Failed';

//       sendEmailResponses.forEach((response, index) => {
//         if (!response.success) {
//           console.error(`Error sending email to ${emails[index]}: ${response.message}`);
//         }
//       });

//       notifications.push({
//         toAddress: emails,
//         fromAddress: 'ashrafshaik250@gmail.com',
//         title: `Assessment Email ${emailStatus}`,
//         body: `Email ${emailStatus} for candidate ${candidateData.LastName}.`,
//         notificationType: 'email',
//         object: {
//           objectName: 'assessment',
//           objectId: assessmentId,
//         },
//         status: emailStatus,
//         tenantId: organizationId,
//         recipientId: candidate._id,
//         createdBy: userId,
//         modifiedBy: userId,
//       });
//     }

//     // Save notifications
//     if (notifications.length > 0) {
//       if (!Notification || typeof Notification.insertMany !== 'function') {
//         throw new Error('Notification model is not properly initialized');
//       }

//       await Notification.insertMany(notifications, { session });
//       req.notificationData = notifications;
//       await notificationMiddleware(req, res, () => { });
//     }

//     await session.commitTransaction();
//     res.status(200).json({
//       success: true,
//       message: 'Assessment shared successfully',
//       data: { scheduledAssessmentId: scheduleAssessment._id },
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     console.error('Error sharing assessment:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to share assessment',
//       error: error.message,
//     });
//   } finally {
//     session.endSession();
//   }
// };

// exports.resendAssessmentLink = async (req, res) => {
//   try {
//     const { candidateAssessmentId, userId, organizationId } = req.body;

//     if (!candidateAssessmentId || !mongoose.isValidObjectId(candidateAssessmentId)) {
//       return res.status(400).json({ success: false, message: 'Invalid or missing candidate assessment ID' });
//     }

//     if (!userId || !mongoose.isValidObjectId(userId)) {
//       return res.status(400).json({ success: false, message: 'Invalid or missing user ID' });
//     }

//     if (!organizationId || !mongoose.isValidObjectId(organizationId)) {
//       return res.status(400).json({ success: false, message: 'Invalid or missing organization ID' });
//     }

//     // Fetch CandidateAssessment
//     const candidateAssessment = await CandidateAssessment.findById(candidateAssessmentId)
//       .populate('candidateId')
//       .populate('scheduledAssessmentId');

//     if (!candidateAssessment) {
//       return res.status(404).json({ success: false, message: 'Candidate assessment not found' });
//     }

//     if (!candidateAssessment.isActive) {
//       return res.status(400).json({ success: false, message: 'Candidate assessment is not active' });
//     }

//     if (!candidateAssessment.assessmentLink) {
//       return res.status(400).json({ success: false, message: 'No assessment link available' });
//     }

//     const candidate = candidateAssessment.candidateId;
//     if (!candidate) {
//       return res.status(404).json({ success: false, message: 'Candidate not found' });
//     }

//     // Fetch email template
//     const emailTemplate = await emailTemplateModel.findOne({ category: 'assessment' });
//     if (!emailTemplate) {
//       return res.status(404).json({ success: false, message: 'Email template not found' });
//     }

//     // Prepare email data
//     const emails = Array.isArray(candidate.emails)
//       ? candidate.emails
//       : candidate.emails
//         ? [candidate.emails]
//         : candidate.Email
//           ? [candidate.Email]
//           : [];

//     if (emails.length === 0) {
//       return res.status(400).json({ success: false, message: 'No valid email address for candidate' });
//     }
//     const cleanedBody = emailTemplate.body.replace(/[\n\r]/g, '');
//     // Prepare personalized email body
//     const emailBody = emailTemplate.body
//       .replace('{{candidateName}}',
//         (candidate.FirstName ? candidate.FirstName + ' ' : '') +
//         (candidate.LastName || 'Candidate')
//       )
//       .replace('{{expiryDate}}', candidateAssessment.expiryAt.toLocaleString())
//       .replace('{{assessmentLink}}', `${candidateAssessment.assessmentLink}<br><br>`);

//     // Send emails
//     const sendEmailResponses = await Promise.all(
//       emails.map((email) => sendEmail(email, emailTemplate.subject, emailBody))
//     );

//     const emailStatus = sendEmailResponses.every((response) => response.success) ? 'Success' : 'Failed';

//     // Log any email sending errors
//     sendEmailResponses.forEach((response, index) => {
//       if (!response.success) {
//         console.error(`Error sending email to ${emails[index]}: ${response.message}`);
//       }
//     });

//     // Prepare notification
//     const notificationData = [{
//       toAddress: emails,
//       fromAddress: 'ashrafshaik250@gmail.com', // Replace with configurable value
//       title: `Assessment Email ${emailStatus}`,
//       body: `Email ${emailStatus} for candidate ${candidate.LastName}.`,
//       notificationType: 'email',
//       object: {
//         objectName: 'assessment',
//         objectId: candidateAssessment.scheduledAssessmentId.assessmentId,
//       },
//       status: emailStatus,
//       tenantId: organizationId,
//       recipientId: candidate._id,
//       createdBy: userId,
//       modifiedBy: userId,
//     }];

//     // Save notification via middleware
//     req.notificationData = notificationData;
//     await notificationMiddleware(req, res, () => { });

//     res.status(200).json({
//       success: true,
//       message: `Assessment link resent successfully to ${candidate.LastName}`,
//     });
//   } catch (error) {
//     console.error('Error resending assessment link:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to resend assessment link',
//       error: error.message,
//     });
//   }
// };


// exports.sendOtp = async (req, res) => {
//   try {
//     const { scheduledAssessmentId, candidateId, candidateAssessmentId } = req.params;

//     // Validate IDs
//     if (!scheduledAssessmentId || !mongoose.isValidObjectId(scheduledAssessmentId)) {
//       return res.status(400).json({ success: false, message: 'Invalid or missing scheduled assessment ID' });
//     }

//     if (!candidateId || !mongoose.isValidObjectId(candidateId)) {
//       return res.status(400).json({ success: false, message: 'Invalid or missing candidate ID' });
//     }

//     if (!candidateAssessmentId || !mongoose.isValidObjectId(candidateAssessmentId)) {
//       return res.status(400).json({ success: false, message: 'Invalid or missing candidate assessment ID' });
//     }

//     // Fetch CandidateAssessment with candidate details
//     const scheduledAssessment = await CandidateAssessment.findOne({
//       _id: candidateAssessmentId,
//       scheduledAssessmentId,
//       candidateId,
//     }).populate('candidateId');

//     if (!scheduledAssessment) {
//       return res.status(404).json({ success: false, message: 'Assessment not found' });
//     }

//     const candidate = scheduledAssessment.candidateId;
//     if (!candidate) {
//       return res.status(404).json({ success: false, message: 'Candidate not found' });
//     }

//     // Prepare email addresses
//     const emails = Array.isArray(candidate.emails)
//       ? candidate.emails
//       : candidate.emails
//         ? [candidate.emails]
//         : candidate.Email
//           ? [candidate.Email]
//           : [];

//     if (emails.length === 0) {
//       return res.status(400).json({ success: false, message: 'No valid email address for candidate' });
//     }

//     // Generate new OTP
//     const otp = generateOTP(); // Use the updated random OTP generator
//     const expiresAt = new Date(Date.now() + 90 * 1000); // 90 seconds expiration

//     // Check if OTP record exists for candidateAssessmentId
//     const existingOtp = await Otp.findOne({ candidateAssessmentId });

//     if (existingOtp) {
//       // Update existing OTP record
//       existingOtp.otp = otp;
//       existingOtp.expiresAt = expiresAt;
//       await existingOtp.save();
//     } else {
//       // Create new OTP record
//       await Otp.create({
//         scheduledAssessmentId,
//         candidateId,
//         candidateAssessmentId,
//         otp,
//         expiresAt,
//       });
//     }

//     console.log('OTP generated:', otp);

//     // Custom email body
//     const emailSubject = 'OTP for Assessment';
//     const emailBody = `Dear ${candidate.LastName || 'Candidate'},<br><br>
//       Your OTP for the assessment is: <strong>${otp}</strong><br>
//       This OTP is valid for 90 seconds.<br><br>
//       Please use this OTP to access your assessment.<br><br>
//       Thank you.`;

//     // Send emails
//     const sendEmailResponses = await Promise.all(
//       emails.map((email) => sendEmail(email, emailSubject, emailBody))
//     );

//     // Check email sending status
//     const emailStatus = sendEmailResponses.every((response) => response.success) ? 'Success' : 'Failed';

//     // Log any email sending errors
//     sendEmailResponses.forEach((response, index) => {
//       if (!response.success) {
//         console.error(`Error sending email to ${emails[index]}: ${response.message}`);
//       }
//     });

//     return res.status(200).json({
//       success: true,
//       message: 'OTP sent successfully',
//       emailStatus,
//     });
//   } catch (error) {
//     console.error('Error sending OTP:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to send OTP',
//       error: error.message,
//     });
//   }
// };
exports.sendOtp = async (req, res) => {
  try {
    const { scheduledAssessmentId, candidateId, candidateAssessmentId } = req.params;

    // Validate input IDs
    if (!scheduledAssessmentId || !mongoose.isValidObjectId(scheduledAssessmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing scheduled assessment ID' });
    }
    if (!candidateId || !mongoose.isValidObjectId(candidateId)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing candidate ID' });
    }
    if (!candidateAssessmentId || !mongoose.isValidObjectId(candidateAssessmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing candidate assessment ID' });
    }

    // Fetch candidate with assessment
    const scheduledAssessment = await CandidateAssessment.findOne({
      _id: candidateAssessmentId,
      scheduledAssessmentId,
      candidateId,
    }).populate('candidateId');

    if (!scheduledAssessment || !scheduledAssessment.candidateId) {
      return res.status(404).json({ success: false, message: 'Candidate assessment not found' });
    }

    const candidate = scheduledAssessment.candidateId;
    const emails = Array.isArray(candidate.emails)
      ? candidate.emails
      : candidate.emails
        ? [candidate.emails]
        : candidate.Email
          ? [candidate.Email]
          : [];

    if (emails.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid email address for candidate' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 90 * 1000);

    const existingOtp = await Otp.findOne({ candidateAssessmentId });
    if (existingOtp) {
      existingOtp.otp = otp;
      existingOtp.expiresAt = expiresAt;
      await existingOtp.save();
    } else {
      await Otp.create({ scheduledAssessmentId, candidateId, candidateAssessmentId, otp, expiresAt });
    }

    // Get system email template for OTP
    const template = await emailTemplateModel.findOne({ category: 'assessment_otp', isSystemTemplate: true, isActive: true });

    if (!template) {
      return res.status(500).json({ success: false, message: 'OTP email template not found in the system' });
    }

    // Replace placeholders in template body
    const emailBody = template.body
      .replace('{{candidateName}}',
        (candidate.FirstName ? candidate.FirstName + ' ' : '') +
        (candidate.LastName || 'Candidate')
      )
      .replace('{{otp}}', otp);

    const sendEmailResponses = await Promise.all(
      emails.map((email) => sendEmail(email, template.subject, emailBody))
    );

    const emailStatus = sendEmailResponses.every((response) => response.success)
      ? 'Success'
      : 'Failed';

    sendEmailResponses.forEach((response, index) => {
      if (!response.success) {
        console.error(`Error sending email to ${emails[index]}: ${response.message}`);
      }
    });

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      emailStatus,
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message,
    });
  }
};

// exports.shareAssessment = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const {
//       assessmentId,
//       selectedCandidates,
//       organizationId,
//       userId,
//       companyName = process.env.COMPANY_NAME,
//       supportEmail = process.env.SUPPORT_EMAIL
//     } = req.body;

//     if (!assessmentId || !mongoose.isValidObjectId(assessmentId)) {
//       return res.status(400).json({ success: false, message: 'Invalid or missing assessment ID' });
//     }

//     if (!selectedCandidates || selectedCandidates.length === 0) {
//       return res.status(400).json({ success: false, message: 'No candidates selected' });
//     }

//     // 1. Fetch the assessment to get linkExpiryDays
//     const assessment = await Assessment.findById(assessmentId).session(session);
//     if (!assessment) {
//       throw new Error('Assessment not found');
//     }
//     const linkExpiryDays = assessment.linkExpiryDays; 
//      const assessmentDuration = assessment.assessmentDuration;


//     // 2. Create a new ScheduleAssessment
//     const scheduleCount = await ScheduleAssessment.countDocuments({ assessmentId }).session(session);
//     const order = `Assessment ${scheduleCount + 1}`;

//     const scheduleAssessment = new ScheduleAssessment({
//       assessmentId,
//       organizationId,
//       status: 'scheduled',
//       proctoringEnabled: true,
//       createdBy: userId,
//       order,
//     });
//     await scheduleAssessment.save({ session });

//     // 3. Check for existing CandidateAssessments
//     const existingAssessments = await CandidateAssessment.find({
//       scheduledAssessmentId: scheduleAssessment._id,
//       candidateId: { $in: selectedCandidates.map((c) => c._id) },
//     }).session(session);

//     const existingCandidateIdsSet = new Set(existingAssessments.map((a) => a.candidateId.toString()));

//     const newCandidates = selectedCandidates.filter(
//       (candidate) => !existingCandidateIdsSet.has(candidate._id.toString())
//     );

//     if (newCandidates.length === 0) {
//       await session.commitTransaction();
//       return res.status(200).json({
//         success: true,
//         message: 'All selected candidates are already assigned to this schedule',
//         data: { scheduledAssessmentId: scheduleAssessment._id },
//       });
//     }

//     // 4. Create CandidateAssessments for new candidates
//     const expiryAt = new Date(Date.now() + linkExpiryDays * 24 * 60 * 60 * 1000);
//     const candidateAssessments = newCandidates.map((candidate) => ({
//       scheduledAssessmentId: scheduleAssessment._id,
//       candidateId: candidate._id,
//       status: 'pending',
//       expiryAt,
//       isActive: true,
//       assessmentLink: '',
//     }));

//     const insertedAssessments = await CandidateAssessment.insertMany(candidateAssessments, { session });

//     // 5. Send emails and update assessment links
//     const notifications = [];
//     const emailTemplate = await emailTemplateModel.findOne({ category: 'assessment_invite',isSystemTemplate: true,isActive: true }).session(session);
//     if (!emailTemplate && newCandidates.length > 0) {
//       throw new Error('Email template not found');
//     }

//     for (const candidate of newCandidates) {
//       const candidateData = await Candidate.findOne({ _id: candidate._id }).session(session);
//       if (!candidateData) {
//         console.error(`Candidate not found for ID: ${candidate._id}`);
//         continue;
//       }

//       const emails = Array.isArray(candidate.emails)
//         ? candidate.emails
//         : candidate.emails
//           ? [candidate.emails]
//           : candidate.Email
//             ? [candidate.Email]
//             : [];
//       if (emails.length === 0) {
//         console.error(`No valid email for candidate ID: ${candidate._id}`);
//         continue;
//       }

//       const candidateAssessment = insertedAssessments.find(
//         (ca) => ca.candidateId.toString() === candidate._id.toString()
//       );
//       if (!candidateAssessment) continue;

//       const encryptedId = encrypt(candidateAssessment._id.toString(), 'test');
//       const link = `${config.REACT_APP_API_URL_FRONTEND}assessmenttest?candidateAssessmentId=${encryptedId}`;

//       await CandidateAssessment.findByIdAndUpdate(
//         candidateAssessment._id,
//         { assessmentLink: link },
//         { session }
//       );

//       const cleanedBody = emailTemplate.body.replace(/[\n\r]/g, '');
//       const candidateName = (candidate.FirstName ? candidate.FirstName + ' ' : '') + (candidate.LastName || 'Candidate');
//       const formattedExpiryDate = expiryAt.toLocaleString('en-US', {
//         weekday: 'long',
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//         timeZoneName: 'short'
//       });
//     const emailSubject = emailTemplate.subject.replace('{{companyName}}', companyName);

//       const emailBody = cleanedBody
//         .replace(/{{candidateName}}/g, candidateName)
//         .replace(/{{companyName}}/g, companyName)
//         .replace(/{{expiryDate}}/g, formattedExpiryDate)
//         .replace(/{{assessmentLink}}/g, link)
//         .replace(/{{assessmentDuration}}/g, assessmentDuration)
//         .replace(/{{supportEmail}}/g, supportEmail);

//       const sendEmailResponses = await Promise.all(
//         emails.map((email) => sendEmail(email,emailSubject, emailBody))
//       );

//       const emailStatus = sendEmailResponses.every((response) => response.success)
//         ? 'Success'
//         : 'Failed';

//       sendEmailResponses.forEach((response, index) => {
//         if (!response.success) {
//           console.error(`Error sending email to ${emails[index]}: ${response.message}`);
//         }
//       });

//       notifications.push({
//         toAddress: emails,
//       fromAddress: process.env.EMAIL_FROM,
//         title: `Assessment Email ${emailStatus}`,
//         body: `Email ${emailStatus} for candidate ${candidateData.LastName}.`,
//         notificationType: 'email',
//         object: {
//           objectName: 'assessment',
//           objectId: assessmentId,
//         },
//         status: emailStatus,
//         tenantId: organizationId,
//         recipientId: candidate._id,
//         createdBy: userId,
//         modifiedBy: userId,
//       });
//     }

//     if (notifications.length > 0) {
//       if (!Notification || typeof Notification.insertMany !== 'function') {
//         throw new Error('Notification model is not properly initialized');
//       }

//       await Notification.insertMany(notifications, { session });
//       req.notificationData = notifications;
//       await notificationMiddleware(req, res, () => { });
//     }

//     await session.commitTransaction();
//     res.status(200).json({
//       success: true,
//       message: 'Assessment shared successfully',
//       data: { scheduledAssessmentId: scheduleAssessment._id },
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     console.error('Error sharing assessment:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to share assessment',
//       error: error.message,
//     });
//   } finally {
//     session.endSession();
//   }
// };

exports.resendAssessmentLink = async (req, res) => {
  try {
    const {
      candidateAssessmentId,
      userId,
      organizationId,
      assessmentId,
      companyName = process.env.COMPANY_NAME,
      supportEmail = process.env.SUPPORT_EMAIL
    } = req.body;

    if (!candidateAssessmentId || !mongoose.isValidObjectId(candidateAssessmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing candidate assessment ID' });
    }

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing user ID' });
    }

    if (!organizationId || !mongoose.isValidObjectId(organizationId)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing organization ID' });
    }

    const candidateAssessment = await CandidateAssessment.findById(candidateAssessmentId)
      .populate('candidateId')
      .populate('scheduledAssessmentId');

    if (!candidateAssessment) {
      return res.status(404).json({ success: false, message: 'Candidate assessment not found' });
    }

    if (!candidateAssessment.isActive) {
      return res.status(400).json({ success: false, message: 'Candidate assessment is not active' });
    }

    if (!candidateAssessment.assessmentLink) {
      return res.status(400).json({ success: false, message: 'No assessment link available' });
    }

    const candidate = candidateAssessment.candidateId;
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    const assessmentDuration = assessment.assessmentDuration || 60;

    const emailTemplate = await emailTemplateModel.findOne({ category: 'assessment_invite', isSystemTemplate: true, isActive: true });
    if (!emailTemplate) {
      return res.status(404).json({ success: false, message: 'Email template not found' });
    }

    const emails = Array.isArray(candidate.emails)
      ? candidate.emails
      : candidate.emails
        ? [candidate.emails]
        : candidate.Email
          ? [candidate.Email]
          : [];

    if (emails.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid email address for candidate' });
    }

    const candidateName = (candidate.FirstName ? candidate.FirstName + ' ' : '') + (candidate.LastName || 'Candidate');
    const formattedExpiryDate = candidateAssessment.expiryAt.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    const cleanedBody = emailTemplate.body.replace(/[\n\r]/g, '');
    const emailSubject = emailTemplate.subject.replace('{{companyName}}', companyName);
    const emailBody = cleanedBody
      .replace(/{{candidateName}}/g, candidateName)
      .replace(/{{companyName}}/g, companyName)
      .replace(/{{expiryDate}}/g, formattedExpiryDate)
      .replace(/{{assessmentLink}}/g, candidateAssessment.assessmentLink)
      .replace(/{{assessmentDuration}}/g, assessmentDuration)
      .replace(/{{supportEmail}}/g, supportEmail);

    const sendEmailResponses = await Promise.all(
      emails.map((email) => sendEmail(email, emailSubject, emailBody))
    );

    const emailStatus = sendEmailResponses.every((response) => response.success) ? 'Success' : 'Failed';

    sendEmailResponses.forEach((response, index) => {
      if (!response.success) {
        console.error(`Error sending email to ${emails[index]}: ${response.message}`);
      }
    });

    // const notificationData = [{
    //   toAddress: emails,
    //   fromAddress: process.env.EMAIL_FROM,
    //   title: `Assessment Email ${emailStatus}`,
    //   body: `Email ${emailStatus} for candidate ${candidate.LastName}.`,
    //   notificationType: 'email',
    //   object: {
    //     objectName: 'assessment',
    //     objectId: candidateAssessment.scheduledAssessmentId.assessmentId,
    //   },
    //   status: emailStatus,
    //   tenantId: organizationId,
    //   ownerId: userId,
    //   recipientId: candidate._id,
    //   createdBy: userId,
    //   updatedBy: userId,
    // }];

    const notificationData = [{
      toAddress: emails,
      fromAddress: process.env.EMAIL_FROM,
      title: emailSubject,
      body: emailBody,
      notificationType: 'email',
      object: {
        objectName: 'assessment',
        objectId: candidateAssessment.scheduledAssessmentId.assessmentId,
      },
      status: emailStatus,
      tenantId: organizationId,
      ownerId: userId,
      recipientId: candidate._id,
      createdBy: userId,
      updatedBy: userId,
    }];

    req.notificationData = notificationData;
    await notificationMiddleware(req, res, () => { });

    res.status(200).json({
      success: true,
      message: `Assessment link resent successfully to ${candidate.LastName}`,
    });
  } catch (error) {
    console.error('Error resending assessment link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend assessment link',
      error: error.message,
    });
  }
};

// exports.shareAssessment = async (req, res) => {
//   let session;
//   try {
//     session = await mongoose.startSession();
//     await session.startTransaction();

//     const {
//       assessmentId,
//       selectedCandidates,
//       organizationId,
//       userId,
//       companyName = process.env.COMPANY_NAME,
//       supportEmail = process.env.SUPPORT_EMAIL
//     } = req.body;

//     // Validate input
//     if (!assessmentId || !mongoose.isValidObjectId(assessmentId)) {
//       return res.status(400).json({ success: false, message: 'Invalid or missing assessment ID' });
//     }

//     if (!selectedCandidates || selectedCandidates.length === 0) {
//       return res.status(400).json({ success: false, message: 'No candidates selected' });
//     }

//     // Fetch assessment with validation
//     const assessment = await Assessment.findById(assessmentId).session(session);
//     if (!assessment) {
//       await session.abortTransaction();
//       return res.status(404).json({ success: false, message: 'Assessment not found' });
//     }

//     // Handle link expiry days - ensure it's a valid number
//     let linkExpiryDays = parseInt(assessment.linkExpiryDays, 10);
//     if (isNaN(linkExpiryDays) || linkExpiryDays <= 0) {
//       linkExpiryDays = 3; // Default to 3 days if invalid
//     }

//     // Calculate expiry date safely
//     const expiryAt = new Date();
//     expiryAt.setDate(expiryAt.getDate() + linkExpiryDays);

//     // Verify date is valid
//     if (isNaN(expiryAt.getTime())) {
//       await session.abortTransaction();
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid expiry date calculation',
//         details: {
//           linkExpiryDays: assessment.linkExpiryDays,
//           calculatedDate: expiryAt.toString()
//         }
//       });
//     }

//     const assessmentDuration = assessment.assessmentDuration || 60; // Default to 60 minutes if not set

//     // Create schedule assessment
//     const scheduleCount = await ScheduleAssessment.countDocuments({ assessmentId }).session(session);
//     const scheduleAssessment = new ScheduleAssessment({
//       assessmentId,
//       organizationId,
//       status: 'scheduled',
//       proctoringEnabled: true,
//       createdBy: userId,
//       order: `Assessment ${scheduleCount + 1}`,
//     });
//     await scheduleAssessment.save({ session });

//     // Check for existing candidate assessments
//     const existingAssessments = await CandidateAssessment.find({
//       scheduledAssessmentId: scheduleAssessment._id,
//       candidateId: { $in: selectedCandidates.map(c => c._id) },
//     }).session(session);

//     const existingCandidateIds = existingAssessments.map(a => a.candidateId.toString());
//     const newCandidates = selectedCandidates.filter(
//       candidate => !existingCandidateIds.includes(candidate._id.toString())
//     );

//     if (newCandidates.length === 0) {
//       await session.commitTransaction();
//       return res.status(200).json({
//         success: true,
//         message: 'All selected candidates already assigned',
//         data: { scheduledAssessmentId: scheduleAssessment._id },
//       });
//     }

//     // Create candidate assessments with validated dates
//     const candidateAssessments = newCandidates.map(candidate => ({
//       scheduledAssessmentId: scheduleAssessment._id,
//       candidateId: candidate._id,
//       status: 'pending',
//       expiryAt: new Date(expiryAt), // Create new Date instance for each
//       isActive: true,
//       assessmentLink: '',
//     }));

//     const insertedAssessments = await CandidateAssessment.insertMany(candidateAssessments, { session });

//     // Process emails
//     const emailTemplate = await emailTemplateModel.findOne({
//       category: 'assessment_invite',
//       isSystemTemplate: true,
//       isActive: true
//     }).session(session);

//     if (!emailTemplate) {
//       await session.abortTransaction();
//       return res.status(404).json({ success: false, message: 'Email template not found' });
//     }

//     const notifications = [];
//     const emailPromises = [];

//     for (const candidate of newCandidates) {
//       const candidateData = await Candidate.findOne({ _id: candidate._id }).session(session);
//       if (!candidateData) {
//         console.error(`Candidate not found: ${candidate._id}`);
//         continue;
//       }

//       const emails = [].concat(
//         candidate.emails || [],
//         candidate.Email ? [candidate.Email] : []
//       ).filter(Boolean);

//       if (emails.length === 0) {
//         console.error(`No email for candidate: ${candidate._id}`);
//         continue;
//       }

//       const candidateAssessment = insertedAssessments.find(
//         ca => ca.candidateId.toString() === candidate._id.toString()
//       );
//       if (!candidateAssessment) continue;

//       const encryptedId = encrypt(candidateAssessment._id.toString(), 'test');
//       console.log("encryptedId", encryptedId)
//       console.log("config.REACT_APP_API_URL_FRONTEND", config.REACT_APP_API_URL_FRONTEND)
//       const link = `${config.REACT_APP_API_URL_FRONTEND}/assessmenttest?candidateAssessmentId=${encryptedId}`;
//       console.log("link", link)
//       await CandidateAssessment.findByIdAndUpdate(
//         candidateAssessment._id,
//         { assessmentLink: link },
//         { session }
//       );

//       // Format email content
//       const candidateName = [candidate.FirstName, candidate.LastName].filter(Boolean).join(' ') || 'Candidate';
//       const formattedExpiryDate = expiryAt.toLocaleString('en-US', {
//         weekday: 'long',
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//         timeZoneName: 'short'
//       });

//       const emailSubject = emailTemplate.subject.replace('{{companyName}}', companyName);
//       const emailBody = emailTemplate.body
//         .replace('{{candidateName}}', candidateName)
//         .replace('{{companyName}}', companyName)
//         .replace('{{expiryDate}}', formattedExpiryDate)
//         .replace('{{assessmentLink}}', link)
//         .replace('{{assessmentDuration}}', assessmentDuration)
//         .replace('{{supportEmail}}', supportEmail);

//       // Queue email sends
//       emailPromises.push(
//         ...emails.map(email =>
//           sendEmail(email, emailSubject, emailBody)
//             .then(response => ({ email, success: true }))
//             .catch(error => ({ email, success: false, error: error.message }))
//         )
//       );

//       // notifications.push({
//       //   toAddress: emails,
//       //   fromAddress: process.env.EMAIL_FROM,
//       //   title: `Assessment Invitation`,
//       //   body: `Assessment invitation sent to ${candidateName}`,
//       //   notificationType: 'email',
//       //   object: {
//       //     objectName: 'assessment',
//       //     objectId: assessmentId,
//       //   },
//       //   status: 'Pending',
//       //   tenantId: organizationId,
//       //   ownerId: userId,
//       //   recipientId: candidate._id,
//       //   createdBy: userId,
//       //   updatedBy: userId,
//       // });

//       notifications.push({
//         toAddress: emails,
//         fromAddress: process.env.EMAIL_FROM,
//         title: emailSubject,
//         body: emailBody,
//         notificationType: 'email',
//         object: {
//           objectName: 'assessment',
//           objectId: assessmentId,
//         },
//         status: 'Pending',
//         tenantId: organizationId,
//         ownerId: userId,
//         recipientId: candidate._id,
//         createdBy: userId,
//         updatedBy: userId,
//       });
//     }

//     // Save notifications
//     if (notifications.length > 0) {
//       await Notification.insertMany(notifications, { session });
//     }

//     // Commit transaction before sending emails
//     await session.commitTransaction();

//     // Send emails outside transaction
//     const emailResults = await Promise.all(emailPromises);
//     const failedEmails = emailResults.filter(r => !r.success);

//     if (failedEmails.length > 0) {
//       console.error('Failed emails:', failedEmails);
//       await Notification.updateMany(
//         { toAddress: { $in: failedEmails.map(f => f.email) } },
//         { $set: { status: 'Failed', body: 'Failed to send email' } }
//       );
//     } else {
//       await Notification.updateMany(
//         { _id: { $in: notifications.map(n => n._id) } },
//         { $set: { status: 'Success' } }
//       );
//     }

//     return res.status(200).json({
//       success: true,
//       message: 'Assessment shared successfully',
//       data: { scheduledAssessmentId: scheduleAssessment._id },
//     });

//   } catch (error) {
//     if (session) await session.abortTransaction();
//     console.error('Error sharing assessment:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to share assessment',
//       error: error.message,
//       ...(error.errors ? { details: error.errors } : {})
//     });
//   } finally {
//     if (session) session.endSession();
//   }
// };

exports.shareAssessment = async (req, res) => {
  try {
    const {
      assessmentId,
      selectedCandidates,
      organizationId,
      userId,
      companyName = process.env.COMPANY_NAME,
      supportEmail = process.env.SUPPORT_EMAIL
    } = req.body;

    // Validate input
    if (!assessmentId || !mongoose.isValidObjectId(assessmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing assessment ID' });
    }

    if (!selectedCandidates || selectedCandidates.length === 0) {
      return res.status(400).json({ success: false, message: 'No candidates selected' });
    }

    // Fetch assessment with validation
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    // Handle link expiry days
    let linkExpiryDays = parseInt(assessment.linkExpiryDays, 10) || 3;
    const expiryAt = new Date();
    expiryAt.setDate(expiryAt.getDate() + linkExpiryDays);
    const assessmentDuration = assessment.assessmentDuration || 60;

    // Create schedule assessment
    const scheduleCount = await ScheduleAssessment.countDocuments({ assessmentId });
    const scheduleAssessment = new ScheduleAssessment({
      assessmentId,
      organizationId,
      status: 'scheduled',
      proctoringEnabled: true,
      createdBy: userId,
      order: `Assessment ${scheduleCount + 1}`,
    });
    await scheduleAssessment.save();

    // Process candidates
    const existingAssessments = await CandidateAssessment.find({
      scheduledAssessmentId: scheduleAssessment._id,
      candidateId: { $in: selectedCandidates.map(c => c._id) }
    });

    const existingCandidateIds = new Set(existingAssessments.map(a => a.candidateId.toString()));
    const newCandidates = selectedCandidates.filter(
      candidate => !existingCandidateIds.has(candidate._id.toString())
    );

    if (newCandidates.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'All selected candidates already assigned',
        data: { scheduledAssessmentId: scheduleAssessment._id },
      });
    }

    // Create candidate assessments
    const candidateAssessments = await Promise.all(newCandidates.map(async (candidate) => {
      const candidateAssessment = new CandidateAssessment({
        scheduledAssessmentId: scheduleAssessment._id,
        candidateId: candidate._id,
        status: 'pending',
        expiryAt: new Date(expiryAt),
        isActive: true,
        assessmentLink: '',
      });
      
      const encryptedId = encrypt(candidateAssessment._id.toString(), 'test');
      const link = `${config.REACT_APP_API_URL_FRONTEND}/assessmenttest?candidateAssessmentId=${encryptedId}`;
      candidateAssessment.assessmentLink = link;
      
      return candidateAssessment.save();
    }));

    // Get email template
    const emailTemplate = await emailTemplateModel.findOne({
      category: 'assessment_invite',
      isSystemTemplate: true,
      isActive: true
    });

    if (!emailTemplate) {
      return res.status(404).json({ success: false, message: 'Email template not found' });
    }

    // Process emails
    const emailPromises = [];
    const notifications = [];

    for (const candidate of newCandidates) {
      const candidateData = await Candidate.findOne({ _id: candidate._id });
      if (!candidateData) {
        console.error(`Candidate not found: ${candidate._id}`);
        continue;
      }

      const emails = [
        ...(candidate.emails || []),
        ...(candidate.Email ? [candidate.Email] : [])
      ].filter(Boolean);

      if (emails.length === 0) {
        console.error(`No email for candidate: ${candidate._id}`);
        continue;
      }

      const candidateAssessment = candidateAssessments.find(
        ca => ca.candidateId.toString() === candidate._id.toString()
      );
      if (!candidateAssessment) continue;

      const candidateName = [candidate.FirstName, candidate.LastName].filter(Boolean).join(' ') || 'Candidate';
      const formattedExpiryDate = expiryAt.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });

      const emailSubject = emailTemplate.subject.replace('{{companyName}}', companyName);
      const emailBody = emailTemplate.body
        .replace('{{candidateName}}', candidateName)
        .replace('{{companyName}}', companyName)
        .replace('{{expiryDate}}', formattedExpiryDate)
        .replace('{{assessmentLink}}', candidateAssessment.assessmentLink)
        .replace('{{assessmentDuration}}', assessmentDuration)
        .replace('{{supportEmail}}', supportEmail);

      // Queue email sends
      emailPromises.push(
        ...emails.map(email => 
          sendEmail(email, emailSubject, emailBody)
            .then(() => ({ email, success: true }))
            .catch(error => {
              console.error(`Failed to send email to ${email}:`, error);
              return { email, success: false, error: error.message };
            })
        )
      );

      // Prepare notification
      notifications.push({
        toAddress: emails,
        fromAddress: process.env.EMAIL_FROM,
        title: emailSubject,
        body: emailBody,
        notificationType: 'email',
        object: {
          objectName: 'assessment',
          objectId: assessmentId,
        },
        status: 'Pending',
        tenantId: organizationId,
        ownerId: userId,
        recipientId: candidate._id,
        createdBy: userId,
        updatedBy: userId,
      });
    }

    // Save notifications
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // Send all emails
    const emailResults = await Promise.all(emailPromises);
    const failedEmails = emailResults.filter(r => !r.success);

    // Update notification statuses
    if (failedEmails.length > 0) {
      const failedEmailsSet = new Set(failedEmails.map(f => f.email));
      await Notification.updateMany(
        { toAddress: { $in: [...failedEmailsSet] } },
        { $set: { status: 'Failed', body: 'Failed to send email' } }
      );
    }

    await Notification.updateMany(
      { _id: { $in: notifications.map(n => n._id) } },
      { $set: { status: 'Success' } }
    );

    return res.status(200).json({
      success: true,
      message: 'Assessment shared successfully',
      data: { scheduledAssessmentId: scheduleAssessment._id },
    });

  } catch (error) {
    console.error('Error sharing assessment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to share assessment',
      error: error.message,
      ...(error.errors ? { details: error.errors } : {})
    });
  }
};