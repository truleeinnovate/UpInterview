// v1.0.0  -  Ashraf  -  creating interview email controller to send emails when rounds are saved

const CryptoJS = require('crypto-js');
const { Interview } = require("../../models/Interview");
const { InterviewRounds } = require("../../models/InterviewRounds");
const { Candidate } = require("../../models/Candidate");
const { Contacts } = require("../../models/Contacts");
const emailTemplateModel = require("../../models/EmailTemplatemodel");
const sendEmail = require('../../utils/sendEmail');
const Notification = require("../../models/notification");
const mongoose = require("mongoose");
const config = require("../../config");


const SECRET_KEY = 'asdnalksm$$@#@cjh#@$abidsduwoa';

const encryptData = (data) => {

  try {
    if (data === undefined || data === null) {
      return null;
    }
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();

  } catch (error) {
    console.error('Error encrypting data:', error);
    return null;
  }

};

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
    let scheduler = null;
    if (owner && owner._id) {
      const schedulerContact = await Contacts.findOne({
        ownerId: owner._id
      });
      scheduler = schedulerContact;
      schedulerEmail = schedulerContact?.email;
    }
    // console.log("🔍 Round data:", scheduler);


    // Get interviewer emails
    const interviewerEmails = [];
    if (round.interviewers && round.interviewers.length > 0) {
      for (const interviewer of round.interviewers) {
        if (interviewer.email) {
          interviewerEmails.push(interviewer);
          // interviewerEmails.push(interviewer.email);
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
    const baseUrl = `${config.REACT_APP_API_URL_FRONTEND}/join-meeting`;
    const meetingLink = round.meetingId
    const encryptedMeetingLink = encryptData(meetingLink);
    const encryptedRoundId = encryptData(roundId);

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
      if (round.meetingId && round.meetingId.length > 0) {

        const candidateUrl = `${baseUrl}?candidate=true&meeting=${encodeURIComponent(encryptedMeetingLink)}&round=${encodeURIComponent(encryptedRoundId)}`;
        console.log("🔍 Candidate link:", candidateUrl);

        if (candidateUrl) {
          emailBody = emailBody.replace('{{meetingLink}}', candidateUrl);
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
        if (round.meetingId && round.meetingId.length > 0) {

         
            const encryptedInterviewerId = encryptData(interviewerEmail?._id);
            const encryptedOwnerId = encryptData(interviewerEmail?.ownerId);

            const interviewerLink = `${baseUrl}?interviewer=true&meeting=${encodeURIComponent(encryptedMeetingLink)}
        &round=${encodeURIComponent(encryptedRoundId)}&interviewerId=${encodeURIComponent(encryptedInterviewerId)}&ownerId=${encodeURIComponent(encryptedOwnerId)}`;

            console.log("🔍 Interviewer link:", interviewerLink);
            
            //  const interviewerLink = round.meetingId
            if (interviewerLink) {
              emailBody = emailBody.replace('{{meetingLink}}', interviewerLink);
            }
          
        } else {
          // If no meeting links available, replace placeholder with a message
          emailBody = emailBody.replace('{{meetingLink}}', 'Meeting link will be provided later');
        }

        emailPromises.push(
          sendEmail(interviewerEmail.email, emailSubject, emailBody)
            .then(response => ({
              email: interviewerEmail.email,
              recipient: 'interviewer',
              success: true
            }))
            .catch(error => ({
              email: interviewerEmail.email,
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
          recipientId: interviewerEmail.email, // Using email as recipientId for interviewers
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
      if (round.meetingId && round.meetingId.length > 0) {
        const hostLink = round.meetingId
             
        const encryptedSchedulerId = encryptData(scheduler?._id);
        const encryptedSchedulerOwnerId = encryptData(scheduler?.ownerId);

        const schedulerLink = `${baseUrl}?scheduler=true&meeting=${encodeURIComponent(encryptedMeetingLink)}
        &round=${encodeURIComponent(encryptedRoundId)}&interviewerId=${encodeURIComponent(encryptedSchedulerId)}&ownerId=${encodeURIComponent(encryptedSchedulerOwnerId)}`;

        console.log("🔍 Scheduler link:", schedulerLink);

        if (schedulerLink) {
          emailBody = emailBody.replace('{{meetingLink}}', schedulerLink);
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
        // schedulerLink:schedulerLink,
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

/**
 * Send outsource interview request emails to selected outsource interviewers
 * @param {Object} req - Request object containing outsource interview request data
 * @param {Object} res - Response object (optional, for direct API calls)
 */
exports.sendOutsourceInterviewRequestEmails = async (req, res = null) => {
  try {
    const {
      interviewId,
      roundId,
      interviewerIds, // Array of interviewer IDs
      candidateId,
      positionId,
      dateTime,
      duration,
      roundTitle
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

    if (!interviewerIds || !Array.isArray(interviewerIds) || interviewerIds.length === 0) {
      const error = {
        success: false,
        message: 'Invalid or missing interviewer IDs'
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

    // Fetch candidate details
    const candidate = interview.candidateId;
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

    // Get candidate name
    const candidateName = [candidate.FirstName, candidate.LastName].filter(Boolean).join(' ') || 'Candidate';

    // Get outsource interview request email template
    const outsourceRequestTemplate = await emailTemplateModel.findOne({
      category: 'outsource_interview_request',
      isSystemTemplate: true,
      isActive: true
    });

    if (!outsourceRequestTemplate) {
      const error = {
        success: false,
        message: 'Outsource interview request email template not found'
      };
      if (res) {
        return res.status(404).json(error);
      }
      return error;
    }

    // Fetch interviewer details from Contacts
    const interviewers = await Contacts.find({
      _id: { $in: interviewerIds }
    });

    if (!interviewers || interviewers.length === 0) {
      const error = {
        success: false,
        message: 'No valid interviewers found'
      };
      if (res) {
        return res.status(404).json(error);
      }
      return error;
    }

    const notifications = [];
    const emailPromises = [];

    // Send email to each outsource interviewer
    for (const interviewer of interviewers) {
      if (!interviewer.email) {
        console.warn(`No email found for interviewer ${interviewer._id}`);
        continue;
      }

      const interviewerName = [interviewer.firstName, interviewer.lastName].filter(Boolean).join(' ') || 'Interviewer';
      const roundTitleText = roundTitle || 'Interview Round';
      const interviewMode = 'Online'; // Default for outsource interviews
      const dateTimeText = dateTime || 'To be scheduled';
      const durationText = duration || '60 minutes';
      const instructions = 'Please review the interview request and accept if you are available.';

      const emailSubject = outsourceRequestTemplate.subject
        .replace('{{companyName}}', companyName)
        .replace('{{roundTitle}}', roundTitleText)
        .replace('{{candidateName}}', candidateName);

      let emailBody = outsourceRequestTemplate.body
        .replace('{{companyName}}', companyName)
        .replace('{{roundTitle}}', roundTitleText)
        .replace('{{candidateName}}', candidateName)
        .replace('{{interviewerName}}', interviewerName)
        .replace('{{interviewMode}}', interviewMode)
        .replace('{{dateTime}}', dateTimeText)
        .replace('{{duration}}', durationText)
        .replace('{{instructions}}', instructions)
        .replace('{{supportEmail}}', supportEmail);

      // Add dashboard link for outsource interviewers to accept/decline
      const dashboardLink = `${process.env.FRONTEND_URL}/interview-requests`;
      emailBody = emailBody.replace('{{dashboardLink}}', dashboardLink);

      emailPromises.push(
        sendEmail(interviewer.email, emailSubject, emailBody)
          .then(response => ({
            email: interviewer.email,
            recipient: 'outsource_interviewer',
            interviewerId: interviewer._id,
            success: true
          }))
          .catch(error => ({
            email: interviewer.email,
            recipient: 'outsource_interviewer',
            interviewerId: interviewer._id,
            success: false,
            error: error.message
          }))
      );

      notifications.push({
        title: emailSubject,
        body: emailBody,
        notificationType: 'email',
        object: {
          objectName: 'outsource_interview_request',
          objectId: roundId,
        },
        status: 'Pending',
        tenantId: interview.tenantId,
        ownerId: interview.ownerId,
        recipientId: interviewer._id,
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

    // Update notification status for successful emails
    if (successfulEmails.length > 0) {
      const successfulEmailsList = successfulEmails.map(r => r.email);
      await Notification.updateMany(
        {
          objectName: 'outsource_interview_request',
          objectId: roundId,
          recipientId: { $in: successfulEmails.map(r => r.interviewerId) }
        },
        { status: 'Success' }
      );
    }

    // Update notification status for failed emails
    if (failedEmails.length > 0) {
      const failedEmailsList = failedEmails.map(r => r.email);
      await Notification.updateMany(
        {
          objectName: 'outsource_interview_request',
          objectId: roundId,
          recipientId: { $in: failedEmails.map(r => r.interviewerId) }
        },
        { status: 'Failed' }
      );
    }

    const result = {
      success: true,
      message: `Outsource interview request emails sent successfully`,
      data: {
        totalInterviewers: interviewers.length,
        successfulEmails: successfulEmails.length,
        failedEmails: failedEmails.length,
        roundId: roundId,
        successfulEmailsList: successfulEmails.map(r => ({ email: r.email, interviewerId: r.interviewerId })),
        failedEmailsList: failedEmails.map(r => ({ email: r.email, interviewerId: r.interviewerId, error: r.error }))
      }
    };

    if (res) {
      return res.status(200).json(result);
    }
    return result;

  } catch (error) {
    console.error('Error sending outsource interview request emails:', error);
    const errorResult = {
      success: false,
      message: 'Failed to send outsource interview request emails',
      error: error.message
    };

    if (res) {
      return res.status(500).json(errorResult);
    }
    return errorResult;
  }
}; 