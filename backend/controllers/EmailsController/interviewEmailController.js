// v1.0.0  -  Ashraf  -  creating interview email controller to send emails when rounds are saved

const { Interview } = require("../../models/Interview");
const { InterviewRounds } = require("../../models/InterviewRounds");
const { Candidate } = require("../../models/Candidate");
const { Contacts } = require("../../models/Contacts");
const emailTemplateModel = require("../../models/EmailTemplatemodel");
const sendEmail = require('../../utils/sendEmail');
const Notification = require("../../models/notification");
const mongoose = require("mongoose");

/**
 * Send interview round emails to candidate, interviewer, and scheduler
 * @param {Object} req - Request object containing interview round data
 * @param {Object} res - Response object (optional, for direct API calls)
 */
exports.sendInterviewRoundEmails = async (req, res = null) => {
  try {
    const {
      interviewId,
      roundId,
      sendEmails = true // Default to true, can be controlled by caller
    } = req.body;

    // Set company name and support email from environment variables or defaults
    const companyName = process.env.COMPANY_NAME || 'UpInterview';
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@upinterview.com';

    // Validate input
    if (!interviewId || !mongoose.isValidObjectId(interviewId)) {
      const error = { 
        success: false, 
        message: 'Invalid or missing interview ID' 
      };
      if (res) {
        return res.status(400).json(error);
      }
      return error;
    }

    if (!roundId || !mongoose.isValidObjectId(roundId)) {
      const error = { 
        success: false, 
        message: 'Invalid or missing round ID' 
      };
      if (res) {
        return res.status(400).json(error);
      }
      return error;
    }

    // Fetch interview with candidate details
    const interview = await Interview.findById(interviewId)
      .populate('candidateId')
      .populate('ownerId');

    if (!interview) {
      const error = { 
        success: false, 
        message: 'Interview not found' 
      };
      if (res) {
        return res.status(404).json(error);
      }
      return error;
    }

    // Fetch round details
    const round = await InterviewRounds.findById(roundId)
      .populate('interviewers');

    if (!round) {
      const error = { 
        success: false, 
        message: 'Interview round not found' 
      };
      if (res) {
        return res.status(404).json(error);
      }
      return error;
    }

    // Check if emails should be sent based on the sendEmails parameter
    if (!sendEmails) {
      const result = {
        success: true,
        message: 'Emails will be sent later when interviewer accepts request',
        data: { roundId: round._id }
      };
      if (res) {
        return res.status(200).json(result);
      }
      return result;
    }

    const candidate = interview.candidateId;
    const owner = interview.ownerId;

    if (!candidate) {
      const error = { 
        success: false, 
        message: 'Candidate not found' 
      };
      if (res) {
        return res.status(404).json(error);
      }
      return error;
    }

    // Get candidate email
    const candidateEmail = candidate.Email;
    if (!candidateEmail) {
      const error = { 
        success: false, 
        message: 'No email address found for candidate' 
      };
      if (res) {
        return res.status(400).json(error);
      }
      return error;
    }

    // Get scheduler/owner email from contacts
    let schedulerEmail = null;
    if (owner && owner._id) {
      const schedulerContact = await Contacts.findOne({ 
        ownerId: owner._id 
      });
      schedulerEmail = schedulerContact?.email;
    }

    // Get interviewer emails
    const interviewerEmails = [];
    if (round.interviewers && round.interviewers.length > 0) {
      for (const interviewer of round.interviewers) {
        if (interviewer.email) {
          interviewerEmails.push(interviewer.email);
        }
      }
    }

    // Get email templates
    const candidateTemplate = await emailTemplateModel.findOne({ 
      category: 'interview_candidate_invite', 
      isSystemTemplate: true, 
      isActive: true 
    });

    const interviewerTemplate = await emailTemplateModel.findOne({ 
      category: 'interview_interviewer_invite', 
      isSystemTemplate: true, 
      isActive: true 
    });

    const schedulerTemplate = await emailTemplateModel.findOne({ 
      category: 'interview_scheduler_notification', 
      isSystemTemplate: true, 
      isActive: true 
    });

    const notifications = [];
    const emailPromises = [];

    // Send email to candidate
    if (candidateTemplate && candidateEmail) {
      const candidateName = [candidate.FirstName, candidate.LastName].filter(Boolean).join(' ') || 'Candidate';
      const roundTitle = round.roundTitle || 'Interview Round';
      const interviewMode = round.interviewMode || 'Online';
      const dateTime = round.dateTime || 'To be scheduled';
      const duration = round.duration || '60 minutes';
      const instructions = round.instructions || 'Please join the meeting on time.';

      const emailSubject = candidateTemplate.subject
        .replace('{{companyName}}', companyName)
        .replace('{{roundTitle}}', roundTitle);

      let emailBody = candidateTemplate.body
        .replace('{{candidateName}}', candidateName)
        .replace('{{companyName}}', companyName)
        .replace('{{roundTitle}}', roundTitle)
        .replace('{{interviewMode}}', interviewMode)
        .replace('{{dateTime}}', dateTime)
        .replace('{{duration}}', duration)
        .replace('{{instructions}}', instructions)
        .replace('{{supportEmail}}', supportEmail);

             // Add meeting links if available
       if (round.meetLink && round.meetLink.length > 0) {
         const candidateLink = round.meetLink.find(link => link.linkType === 'candidate');
         if (candidateLink) {
           emailBody = emailBody.replace('{{meetingLink}}', candidateLink.link);
         }
       } else {
         // If no meeting links available, replace placeholder with a message
         emailBody = emailBody.replace('{{meetingLink}}', 'Meeting link will be provided later');
       }

      emailPromises.push(
        sendEmail(candidateEmail, emailSubject, emailBody)
          .then(response => ({ 
            email: candidateEmail, 
            recipient: 'candidate', 
            success: true 
          }))
          .catch(error => ({ 
            email: candidateEmail, 
            recipient: 'candidate', 
            success: false, 
            error: error.message 
          }))
      );

      notifications.push({
        title: emailSubject,
        body: emailBody,
        notificationType: 'email',
        object: {
          objectName: 'interview_round',
          objectId: roundId,
        },
        status: 'Pending',
        tenantId: interview.tenantId,
        ownerId: interview.ownerId,
        recipientId: candidate._id,
        createdBy: interview.ownerId,
        updatedBy: interview.ownerId,
      });
    }

    // Send emails to interviewers
    if (interviewerTemplate && interviewerEmails.length > 0) {
      for (const interviewerEmail of interviewerEmails) {
        const roundTitle = round.roundTitle || 'Interview Round';
        const interviewMode = round.interviewMode || 'Online';
        const dateTime = round.dateTime || 'To be scheduled';
        const duration = round.duration || '60 minutes';
        const instructions = round.instructions || 'Please join the meeting on time.';

        const emailSubject = interviewerTemplate.subject
          .replace('{{companyName}}', companyName)
          .replace('{{roundTitle}}', roundTitle);

        let emailBody = interviewerTemplate.body
          .replace('{{companyName}}', companyName)
          .replace('{{roundTitle}}', roundTitle)
          .replace('{{interviewMode}}', interviewMode)
          .replace('{{dateTime}}', dateTime)
          .replace('{{duration}}', duration)
          .replace('{{instructions}}', instructions)
          .replace('{{supportEmail}}', supportEmail);

                 // Add meeting links if available
         if (round.meetLink && round.meetLink.length > 0) {
           const interviewerLink = round.meetLink.find(link => link.linkType === 'interviewer');
           if (interviewerLink) {
             emailBody = emailBody.replace('{{meetingLink}}', interviewerLink.link);
           }
         } else {
           // If no meeting links available, replace placeholder with a message
           emailBody = emailBody.replace('{{meetingLink}}', 'Meeting link will be provided later');
         }

        emailPromises.push(
          sendEmail(interviewerEmail, emailSubject, emailBody)
            .then(response => ({ 
              email: interviewerEmail, 
              recipient: 'interviewer', 
              success: true 
            }))
            .catch(error => ({ 
              email: interviewerEmail, 
              recipient: 'interviewer', 
              success: false, 
              error: error.message 
            }))
        );

        notifications.push({
          title: emailSubject,
          body: emailBody,
          notificationType: 'email',
          object: {
            objectName: 'interview_round',
            objectId: roundId,
          },
          status: 'Pending',
          tenantId: interview.tenantId,
          ownerId: interview.ownerId,
          recipientId: interviewerEmail, // Using email as recipientId for interviewers
          createdBy: interview.ownerId,
          updatedBy: interview.ownerId,
        });
      }
    }

    // Send email to scheduler/owner
    if (schedulerTemplate && schedulerEmail) {
      const roundTitle = round.roundTitle || 'Interview Round';
      const candidateName = [candidate.FirstName, candidate.LastName].filter(Boolean).join(' ') || 'Candidate';
      const interviewMode = round.interviewMode || 'Online';
      const dateTime = round.dateTime || 'To be scheduled';
      const duration = round.duration || '60 minutes';

      const emailSubject = schedulerTemplate.subject
        .replace('{{companyName}}', companyName)
        .replace('{{roundTitle}}', roundTitle);

      let emailBody = schedulerTemplate.body
        .replace('{{companyName}}', companyName)
        .replace('{{roundTitle}}', roundTitle)
        .replace('{{candidateName}}', candidateName)
        .replace('{{interviewMode}}', interviewMode)
        .replace('{{dateTime}}', dateTime)
        .replace('{{duration}}', duration)
        .replace('{{supportEmail}}', supportEmail);

             // Add meeting links if available
       if (round.meetLink && round.meetLink.length > 0) {
         const hostLink = round.meetLink.find(link => link.linkType === 'schedule');
         if (hostLink) {
           emailBody = emailBody.replace('{{meetingLink}}', hostLink.link);
         }
       } else {
         // If no meeting links available, replace placeholder with a message
         emailBody = emailBody.replace('{{meetingLink}}', 'Meeting link will be provided later');
       }

      emailPromises.push(
        sendEmail(schedulerEmail, emailSubject, emailBody)
          .then(response => ({ 
            email: schedulerEmail, 
            recipient: 'scheduler', 
            success: true 
          }))
          .catch(error => ({ 
            email: schedulerEmail, 
            recipient: 'scheduler', 
            success: false, 
            error: error.message 
          }))
      );

      notifications.push({
        title: emailSubject,
        body: emailBody,
        notificationType: 'email',
        object: {
          objectName: 'interview_round',
          objectId: roundId,
        },
        status: 'Pending',
        tenantId: interview.tenantId,
        ownerId: interview.ownerId,
        recipientId: schedulerEmail, // Using email as recipientId for scheduler
        createdBy: interview.ownerId,
        updatedBy: interview.ownerId,
      });
    }

    // Save notifications
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // Send emails
    const emailResults = await Promise.all(emailPromises);
    const successfulEmails = emailResults.filter(r => r.success);
    const failedEmails = emailResults.filter(r => !r.success);

    // Update notification status
    if (failedEmails.length > 0) {
      console.error('Failed emails:', failedEmails);
      await Notification.updateMany(
        { recipientId: { $in: failedEmails.map(f => f.email) } },
        { $set: { status: 'Failed', body: 'Failed to send email' } }
      );
    }

    if (successfulEmails.length > 0) {
      await Notification.updateMany(
        { recipientId: { $in: successfulEmails.map(s => s.email) } },
        { $set: { status: 'Success' } }
      );
    }

    const result = {
      success: true,
      message: 'Interview round emails sent successfully',
      data: {
        roundId: round._id,
        emailsSent: successfulEmails.length,
        emailsFailed: failedEmails.length,
        recipients: {
          candidate: candidateEmail,
          interviewers: interviewerEmails,
          scheduler: schedulerEmail
        }
      }
    };

    if (res) {
      return res.status(200).json(result);
    }
    return result;

  } catch (error) {
    console.error('Error sending interview round emails:', error);
    const errorResult = {
      success: false,
      message: 'Failed to send interview round emails',
      error: error.message,
    };
    if (res) {
      return res.status(500).json(errorResult);
    }
    return errorResult;
  }
}; 