// v1.0.0  -  Ashraf  -  adding assessment code while sending email we will create schedule assessment and candidate assessment
// v1.0.1  -  Ashraf  -  azure getting error while sending email
// v1.0.2  -  Ashraf  -  fixed name schedule assessment to assessment schema and schedule assessment to assessment schema
// v1.0.3  -  Ashraf  -  fixed assessment resend link for mutiple and single candidate assessment

const { CandidateAssessment } = require("../../models/Assessment/candidateAssessment.js");
const { encrypt } = require('../../utils/generateOtp')
// <-------------------------------v1.0.2 
const ScheduleAssessment = require('../../models/Assessment/assessmentsSchema.js');
// ------------------------------v1.0.2 >
const { Candidate } = require("../../models/candidate.js");
const CryptoJS = require("crypto-js");
const crypto = require("crypto");
const emailTemplateModel = require("../../models/EmailTemplatemodel");
const sendEmail = require('../../utils/sendEmail');
const notificationMiddleware = require("../../middleware/notificationMiddleware");
const { generateOTP } = require('../../utils/generateOtp')
const Otp = require("../../models/Otp");
const mongoose = require("mongoose");
const Notification = require("../../models/notification");
// <-------------------------------v1.0.2
const Assessment = require("../../models/Assessment/assessmentTemplates.js");
const config = require("../../config");
// ------------------------------v1.0.2 >

// Import push notification functions
const {
  createAssessmentScheduledNotification,
} = require('../PushNotificationControllers/pushNotificationAssessmentController');




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

// <-------------------------------v1.0.3
exports.resendAssessmentLink = async (req, res) => {
  try {
    const {
      candidateAssessmentIds,
      userId,
      organizationId,
      assessmentId,
      companyName = process.env.COMPANY_NAME,
      supportEmail = process.env.SUPPORT_EMAIL
    } = req.body;

    // Handle both single and multiple candidate assessment IDs
    let candidateAssessmentIdArray = [];
    
    if (candidateAssessmentIds && Array.isArray(candidateAssessmentIds)) {
      // Multiple candidates
      candidateAssessmentIdArray = candidateAssessmentIds;
    } else if (candidateAssessmentId && mongoose.isValidObjectId(candidateAssessmentId)) {
      // Single candidate
      candidateAssessmentIdArray = [candidateAssessmentId];
    } else {
      return res.status(400).json({ success: false, message: 'Invalid or missing candidate assessment ID(s)' });
    }

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing user ID' });
    }

    if (!organizationId || !mongoose.isValidObjectId(organizationId)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing organization ID' });
    }

    // Validate all candidate assessment IDs
    for (const id of candidateAssessmentIdArray) {
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ success: false, message: `Invalid candidate assessment ID: ${id}` });
      }
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

    const results = [];
    let successCount = 0;
    let failureCount = 0;
    console.log("candidateAssessmentIdArray",candidateAssessmentIdArray)

    for (const candidateAssessmentId of candidateAssessmentIdArray) {
      console.log("candidateAssessmentId",candidateAssessmentId)
      try {
        const candidateAssessment = await CandidateAssessment.findById(candidateAssessmentId)
          .populate('candidateId')
          .populate('scheduledAssessmentId');
          console.log("candidateAssessment",candidateAssessment)

        if (!candidateAssessment) {
          results.push({
            candidateAssessmentId,
            success: false,
            message: 'Candidate assessment not found'
          });
          failureCount++;
          continue;
        }

        if (!candidateAssessment.isActive) {
          results.push({
            candidateAssessmentId,
            success: false,
            message: 'Candidate assessment is not active'
          });
          failureCount++;
          continue;
        }

        if (!candidateAssessment.assessmentLink) {
          results.push({
            candidateAssessmentId,
            success: false,
            message: 'No assessment link available'
          });
          failureCount++;
          continue;
        }

        const candidate = candidateAssessment.candidateId;
        if (!candidate) {
          results.push({
            candidateAssessmentId,
            success: false,
            message: 'Candidate not found'
          });
          failureCount++;
          continue;
        }

        const emails = Array.isArray(candidate.emails)
          ? candidate.emails
          : candidate.emails
            ? [candidate.emails]
            : candidate.Email
              ? [candidate.Email]
              : [];

        if (emails.length === 0) {
          results.push({
            candidateAssessmentId,
            success: false,
            message: 'No valid email address for candidate'
          });
          failureCount++;
          continue;
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

        if (emailStatus === 'Success') {
          successCount++;
        } else {
          failureCount++;
        }

        sendEmailResponses.forEach((response, index) => {
          if (!response.success) {
            console.error(`Error sending email to ${emails[index]}: ${response.message}`);
          }
        });

        results.push({
          candidateAssessmentId,
          success: emailStatus === 'Success',
          message: emailStatus === 'Success' ? 'Assessment link resent successfully' : 'Failed to send email',
          candidateName,
          emails
        });

      } catch (error) {
        console.error(`Error processing candidate assessment ${candidateAssessmentId}:`, error);
        results.push({
          candidateAssessmentId,
          success: false,
          message: 'Internal server error'
        });
        failureCount++;
      }
    }

    // Return appropriate response based on single vs multiple
    if (candidateAssessmentIdArray.length === 1) {
      // Single candidate response (backward compatible)
      const result = results[0];
      if (result.success) {
        res.status(200).json({
          success: true,
          message: `Assessment link resent successfully to ${result.candidateName}`,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } else {
      // Multiple candidates response
      res.status(200).json({
        success: true,
        message: `Processed ${candidateAssessmentIdArray.length} candidates. ${successCount} successful, ${failureCount} failed.`,
        results,
        summary: {
          total: candidateAssessmentIdArray.length,
          successful: successCount,
          failed: failureCount
        }
      });
    }

  } catch (error) {
    console.error('Error resending assessment link(s):', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend assessment link(s)',
      error: error.message,
    });
  }
};
// ------------------------------v1.0.3 >

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

    // Fetch assessment without session for Cosmos DB compatibility
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    // Handle link expiry days - ensure it's a valid number
    let linkExpiryDays = parseInt(assessment.linkExpiryDays, 10);
    if (isNaN(linkExpiryDays) || linkExpiryDays <= 0) {
      linkExpiryDays = 3; // Default to 3 days if invalid
    }

    // Calculate expiry date safely
    const expiryAt = new Date();
    expiryAt.setDate(expiryAt.getDate() + linkExpiryDays);

    // Verify date is valid
    if (isNaN(expiryAt.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expiry date calculation',
        details: {
          linkExpiryDays: assessment.linkExpiryDays,
          calculatedDate: expiryAt.toString()
        }
      });
    }

    const assessmentDuration = assessment.assessmentDuration || 60; // Default to 60 minutes if not set

     // <---------------------- v1.0.0

    // Generate assessment ID and create schedule assessment without session
    // Use a simpler approach that doesn't require sorting by scheduledAssessmentCode
    // <---------------------- v1.0.1
    const scheduleCount = await ScheduleAssessment.countDocuments({ 
      organizationId,
      scheduledAssessmentCode: { $exists: true, $ne: null }
    });
    
    // Generate the new code with 5-digit padding based on count
    const nextNumber = scheduleCount + 1;
    let scheduledAssessmentCode = `ASMT-${String(nextNumber).padStart(5, '0')}`;

    // Check if this code already exists (in case of concurrent requests)
    const existingCode = await ScheduleAssessment.findOne({ 
      organizationId,
      scheduledAssessmentCode 
    });
    
    if (existingCode) {
      // If code exists, try with a higher number
      const newNextNumber = nextNumber + 1;
      scheduledAssessmentCode = `ASMT-${String(newNextNumber).padStart(5, '0')}`;
    }
    // <---------------------- v1.0.1

     // <---------------------- v1.0.0

    const scheduleAssessment = new ScheduleAssessment({
      scheduledAssessmentCode,
      assessmentId,
      organizationId,
      status: 'scheduled',
      proctoringEnabled: true,
      createdBy: userId,
      order: `Assessment ${nextNumber}`,
      expiryAt, // Add the expiry date
    });
    const savedScheduleAssessment = await scheduleAssessment.save();

    // Create push notification for scheduled assessment
    try {
      await createAssessmentScheduledNotification(savedScheduleAssessment);
    } catch (notificationError) {
      console.error('[ASSESSMENT] Error creating scheduled notification:', notificationError);
      // Continue execution even if notification fails
    }

    // Check for existing candidate assessments without session
    const existingAssessments = await CandidateAssessment.find({
      scheduledAssessmentId: scheduleAssessment._id,
      candidateId: { $in: selectedCandidates.map(c => c._id) },
    });

    const existingCandidateIds = existingAssessments.map(a => a.candidateId.toString());
    const newCandidates = selectedCandidates.filter(
      candidate => !existingCandidateIds.includes(candidate._id.toString())
    );

    if (newCandidates.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'All selected candidates already assigned',
        data: { scheduledAssessmentId: scheduleAssessment._id },
      });
    }

    // Create candidate assessments with validated dates
    const candidateAssessments = newCandidates.map(candidate => ({
      scheduledAssessmentId: scheduleAssessment._id,
      candidateId: candidate._id,
      status: 'pending',
      expiryAt: new Date(expiryAt), // Create new Date instance for each
      isActive: true,
      assessmentLink: '',
    }));

    const insertedAssessments = await CandidateAssessment.insertMany(candidateAssessments);

    // Process emails without session
    const emailTemplate = await emailTemplateModel.findOne({
      category: 'assessment_invite',
      isSystemTemplate: true,
      isActive: true
    });

    if (!emailTemplate) {
      return res.status(404).json({ success: false, message: 'Email template not found' });
    }

    const notifications = [];
    const emailPromises = [];

    for (const candidate of newCandidates) {
      const candidateData = await Candidate.findOne({ _id: candidate._id });
      if (!candidateData) {
        console.error(`Candidate not found: ${candidate._id}`);
        continue;
      }

      const emails = [].concat(
        candidate.emails || [],
        candidate.Email ? [candidate.Email] : []
      ).filter(Boolean);

      if (emails.length === 0) {
        console.error(`No email for candidate: ${candidate._id}`);
        continue;
      }

      const candidateAssessment = insertedAssessments.find(
        ca => ca.candidateId.toString() === candidate._id.toString()
      );
      if (!candidateAssessment) continue;

      const encryptedId = encrypt(candidateAssessment._id.toString(), 'test');
      // console.log("encryptedId", encryptedId)
      // console.log("config.REACT_APP_API_URL_FRONTEND", config.REACT_APP_API_URL_FRONTEND)
      const link = `${config.REACT_APP_API_URL_FRONTEND}/assessmenttest?candidateAssessmentId=${encryptedId}`;
      // console.log("link", link)
      await CandidateAssessment.findByIdAndUpdate(
        candidateAssessment._id,
        { assessmentLink: link }
      );

      // Format email content
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
        .replace('{{assessmentLink}}', link)
        .replace('{{assessmentDuration}}', assessmentDuration)
        .replace('{{supportEmail}}', supportEmail);

      // Queue email sends
      emailPromises.push(
        ...emails.map(email =>
          sendEmail(email, emailSubject, emailBody)
            .then(response => ({ email, success: true }))
            .catch(error => ({ email, success: false, error: error.message }))
        )
      );

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

    // Save notifications without session
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // Send emails outside transaction
    const emailResults = await Promise.all(emailPromises);
    const failedEmails = emailResults.filter(r => !r.success);

    if (failedEmails.length > 0) {
      console.error('Failed emails:', failedEmails);
      await Notification.updateMany(
        { toAddress: { $in: failedEmails.map(f => f.email) } },
        { $set: { status: 'Failed', body: 'Failed to send email' } }
      );
    } else {
      await Notification.updateMany(
        { _id: { $in: notifications.map(n => n._id) } },
        { $set: { status: 'Success' } }
      );
    }

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