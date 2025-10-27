// v1.0.0  -  Ashraf  -  creating interview email controller to send emails when rounds are saved

const CryptoJS = require('crypto-js');
const { Interview } = require("../../models/Interview/Interview.js");
const { MockInterview } = require("../../models/MockInterview/MockInterview.js");
const { MockInterviewRound } = require("../../models/MockInterview/mockinterviewRound.js");
const { InterviewRounds } = require("../../models/Interview/InterviewRounds.js");
const { Candidate } = require("../../models/candidate.js");
const { Contacts } = require("../../models/Contacts");
const emailTemplateModel = require("../../models/EmailTemplatemodel");
const sendEmail = require('../../utils/sendEmail');
const Notification = require("../../models/notification");
const mongoose = require("mongoose");
const config = require("../../config");
const Tenant = require("../../models/Tenant");


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
// exports.sendInterviewRoundEmails = async (req, res = null) => {
//   try {
//     const {
//       interviewId,
//       roundId,
//       sendEmails = true, // Default to true, can be controlled by caller
//     } = req.body;

//     // Set company name and support email from environment variables or defaults
//     const companyName = process.env.COMPANY_NAME || 'UpInterview';
//     const supportEmail = process.env.SUPPORT_EMAIL || 'support@upinterview.com';

//     // Validate input
//     if (!interviewId || !mongoose.isValidObjectId(interviewId)) {
//       const error = {
//         success: false,
//         message: 'Invalid or missing interview ID'
//       };
//       if (res) {
//         return res.status(400).json(error);
//       }
//       return error;
//     }

//     if (!roundId || !mongoose.isValidObjectId(roundId)) {
//       const error = {
//         success: false,
//         message: 'Invalid or missing round ID'
//       };
//       if (res) {
//         return res.status(400).json(error);
//       }
//       return error;
//     }

//     // Fetch interview with candidate details
//     const interview = await Interview.findById(interviewId)
//       .populate('candidateId')
//       .populate('ownerId');
//     const tenant = await Tenant.findOne({ tenantId: interview.tenantId });
//     const address = tenant.offices[0].address;

//     if (!interview) {
//       const error = {
//         success: false,
//         message: 'Interview not found'
//       };
//       if (res) {
//         return res.status(404).json(error);
//       }
//       return error;
//     }

//     // Fetch round details
//     const round = await InterviewRounds.findById(roundId)
//       .populate('interviewers');

//     if (!round) {
//       const error = {
//         success: false,
//         message: 'Interview round not found'
//       };
//       if (res) {
//         return res.status(404).json(error);
//       }
//       return error;
//     }




//     // Check if emails should be sent based on the sendEmails parameter
//     if (!sendEmails) {
//       const result = {
//         success: true,
//         message: 'Emails will be sent later when interviewer accepts request',
//         data: { roundId: round._id }
//       };
//       if (res) {
//         return res.status(200).json(result);
//       }
//       return result;
//     }
//     const faceToFace = round.interviewMode === "Face to Face" ? true : false;
//     const candidate = interview.candidateId;
//     const owner = interview.ownerId;

//     if (!candidate) {
//       const error = {
//         success: false,
//         message: 'Candidate not found'
//       };
//       if (res) {
//         return res.status(404).json(error);
//       }
//       return error;
//     }

//     // Get candidate email
//     const candidateEmail = candidate.Email;
//     if (!candidateEmail) {
//       const error = {
//         success: false,
//         message: 'No email address found for candidate'
//       };
//       if (res) {
//         return res.status(400).json(error);
//       }
//       return error;
//     }

//     // Get scheduler/owner email from contacts
//     let schedulerEmail = null;
//     let scheduler = null;
//     if (owner && owner._id) {
//       const schedulerContact = await Contacts.findOne({
//         ownerId: owner._id
//       });
//       scheduler = schedulerContact;
//       schedulerEmail = schedulerContact?.email;
//     }
//     // console.log("🔍 Round data:", scheduler);


//     // Get interviewer emails
//     const interviewerEmails = [];
//     if (round.interviewers && round.interviewers.length > 0) {
//       for (const interviewer of round.interviewers) {
//         if (interviewer.email) {
//           interviewerEmails.push(interviewer);
//           // interviewerEmails.push(interviewer.email);
//         }
//       }
//     }

//     // Get email templates
//     const candidateTemplate = await emailTemplateModel.findOne({
//       category: 'interview_candidate_invite',
//       isSystemTemplate: true,
//       isActive: true
//     });

//     const interviewerTemplate = await emailTemplateModel.findOne({
//       category: 'interview_interviewer_invite',
//       isSystemTemplate: true,
//       isActive: true
//     });

//     const schedulerTemplate = await emailTemplateModel.findOne({
//       category: 'interview_scheduler_notification',
//       isSystemTemplate: true,
//       isActive: true
//     });
//     const baseUrl = `${config.REACT_APP_API_URL_FRONTEND}/join-meeting`;
//     const meetingLink = round.meetingId
//     const encryptedMeetingLink = encryptData(meetingLink);
//     const encryptedRoundId = encryptData(roundId);

//     const notifications = [];
//     const emailPromises = [];

//     // Send email to candidate
//     if (candidateTemplate && candidateEmail) {
//       const candidateName = [candidate.FirstName, candidate.LastName].filter(Boolean).join(' ') || 'Candidate';
//       const roundTitle = round.roundTitle || 'Interview Round';
//       const interviewMode = round.interviewMode || 'Online';
//       const dateTime = round.dateTime || 'To be scheduled';
//       const duration = round.duration || '60 minutes';
//       const instructions = round.instructions || 'Please join the meeting on time.';

//       const emailSubject = candidateTemplate.subject
//         .replace('{{companyName}}', companyName)
//         .replace('{{roundTitle}}', roundTitle);

//       let emailBody = candidateTemplate.body
//         .replace('{{candidateName}}', candidateName)
//         .replace('{{companyName}}', companyName)
//         .replace('{{roundTitle}}', roundTitle)
//         .replace('{{interviewMode}}', interviewMode)
//         .replace('{{dateTime}}', dateTime)
//         .replace('{{duration}}', duration)
//         .replace('{{instructions}}', instructions)
//         .replace('{{supportEmail}}', supportEmail);

//       // Add meeting links if available
//       if (round.meetingId && round.meetingId.length > 0) {

//         const candidateUrl = `${baseUrl}?candidate=true&meeting=${encodeURIComponent(encryptedMeetingLink)}&round=${encodeURIComponent(encryptedRoundId)}`;
//         console.log("🔍 Candidate link:", candidateUrl);

//         if (candidateUrl) {
//           emailBody = emailBody.replace('{{meetingLink}}', candidateUrl);
//         }
//       } else {
//         // If no meeting links available, replace placeholder with a message
//         emailBody = emailBody.replace('{{meetingLink}}', 'Meeting link will be provided later');
//       }

//       emailPromises.push(
//         sendEmail(candidateEmail, emailSubject, emailBody)
//           .then(response => ({
//             email: candidateEmail,
//             recipient: 'candidate',
//             success: true
//           }))
//           .catch(error => ({
//             email: candidateEmail,
//             recipient: 'candidate',
//             success: false,
//             error: error.message
//           }))
//       );

//       notifications.push({
//         title: emailSubject,
//         body: emailBody,
//         notificationType: 'email',
//         object: {
//           objectName: 'interview_round',
//           objectId: roundId,
//         },
//         status: 'Pending',
//         tenantId: interview.tenantId,
//         ownerId: interview.ownerId,
//         recipientId: candidate._id,
//         createdBy: interview.ownerId,
//         updatedBy: interview.ownerId,
//       });
//     }

//     // Send emails to interviewers
//     if (interviewerTemplate && interviewerEmails.length > 0) {
//       for (const interviewerEmail of interviewerEmails) {
//         const roundTitle = round.roundTitle || 'Interview Round';
//         const interviewMode = round.interviewMode || 'Online';
//         const dateTime = round.dateTime || 'To be scheduled';
//         const duration = round.duration || '60 minutes';
//         const instructions = round.instructions || 'Please join the meeting on time.';

//         const emailSubject = interviewerTemplate.subject
//           .replace('{{companyName}}', companyName)
//           .replace('{{roundTitle}}', roundTitle);

//         let emailBody = interviewerTemplate.body
//           .replace('{{companyName}}', companyName)
//           .replace('{{roundTitle}}', roundTitle)
//           .replace('{{interviewMode}}', interviewMode)
//           .replace('{{dateTime}}', dateTime)
//           .replace('{{duration}}', duration)
//           .replace('{{instructions}}', instructions)
//           .replace('{{supportEmail}}', supportEmail);

//         // Add meeting links if available
//         if (round.meetingId && round.meetingId.length > 0) {


//           const encryptedInterviewerId = encryptData(interviewerEmail?._id);
//           const encryptedOwnerId = encryptData(interviewerEmail?.ownerId);

//           const interviewerLink = `${baseUrl}?interviewer=true&meeting=${encodeURIComponent(encryptedMeetingLink)}
//         &round=${encodeURIComponent(encryptedRoundId)}&interviewertoken=${encodeURIComponent(encryptedInterviewerId)}&owner=${encodeURIComponent(encryptedOwnerId)}`;

//           console.log("🔍 Interviewer link:", interviewerLink);

//           //  const interviewerLink = round.meetingId
//           if (interviewerLink) {
//             emailBody = emailBody.replace('{{meetingLink}}', interviewerLink);
//           }

//         } else {
//           // If no meeting links available, replace placeholder with a message
//           emailBody = emailBody.replace('{{meetingLink}}', 'Meeting link will be provided later');
//         }

//         emailPromises.push(
//           sendEmail(interviewerEmail.email, emailSubject, emailBody)
//             .then(response => ({
//               email: interviewerEmail.email,
//               recipient: 'interviewer',
//               success: true
//             }))
//             .catch(error => ({
//               email: interviewerEmail.email,
//               recipient: 'interviewer',
//               success: false,
//               error: error.message
//             }))
//         );

//         notifications.push({
//           title: emailSubject,
//           body: emailBody,
//           notificationType: 'email',
//           object: {
//             objectName: 'interview_round',
//             objectId: roundId,
//           },
//           status: 'Pending',
//           tenantId: interview.tenantId,
//           ownerId: interview.ownerId,
//           recipientId: interviewerEmail.email, // Using email as recipientId for interviewers
//           createdBy: interview.ownerId,
//           updatedBy: interview.ownerId,
//         });
//       }
//     }

//     // Send email to scheduler/owner
//     if (schedulerTemplate && schedulerEmail) {
//       const roundTitle = round.roundTitle || 'Interview Round';
//       const candidateName = [candidate.FirstName, candidate.LastName].filter(Boolean).join(' ') || 'Candidate';
//       const interviewMode = round.interviewMode || 'Online';
//       const dateTime = round.dateTime || 'To be scheduled';
//       const duration = round.duration || '60 minutes';
//       const instructions = round.instructions || 'Please join the meeting on time.';


//       const emailSubject = schedulerTemplate.subject
//         .replace('{{companyName}}', companyName)
//         .replace('{{roundTitle}}', roundTitle);

//       let emailBody = schedulerTemplate.body
//         .replace('{{companyName}}', companyName)
//         .replace('{{roundTitle}}', roundTitle)
//         .replace('{{candidateName}}', candidateName)
//         .replace('{{interviewMode}}', interviewMode)
//         .replace('{{dateTime}}', dateTime)
//         .replace('{{duration}}', duration)
//         .replace('{{instructions}}', instructions)
//         .replace('{{supportEmail}}', supportEmail);

//       // Add meeting links if available
//       if (round.meetingId && round.meetingId.length > 0) {
//         const hostLink = round.meetingId

//         const encryptedSchedulerId = encryptData(scheduler?._id);
//         const encryptedSchedulerOwnerId = encryptData(scheduler?.ownerId);

//         const schedulerLink = `${baseUrl}?scheduler=true&meeting=${encodeURIComponent(encryptedMeetingLink)}
//         &round=${encodeURIComponent(encryptedRoundId)}&schedulertoken=${encodeURIComponent(encryptedSchedulerId)}&owner=${encodeURIComponent(encryptedSchedulerOwnerId)}`;

//         console.log("🔍 Scheduler link:", schedulerLink);

//         if (schedulerLink) {
//           emailBody = emailBody.replace('{{meetingLink}}', schedulerLink);
//         }
//       } else {
//         // If no meeting links available, replace placeholder with a message
//         emailBody = emailBody.replace('{{meetingLink}}', 'Meeting link will be provided later');
//       }

//       emailPromises.push(
//         sendEmail(schedulerEmail, emailSubject, emailBody)
//           .then(response => ({
//             email: schedulerEmail,
//             recipient: 'scheduler',
//             success: true
//           }))
//           .catch(error => ({
//             email: schedulerEmail,
//             recipient: 'scheduler',
//             success: false,
//             error: error.message
//           }))
//       );

//       notifications.push({
//         title: emailSubject,
//         body: emailBody,
//         notificationType: 'email',
//         object: {
//           objectName: 'interview_round',
//           objectId: roundId,
//         },
//         status: 'Pending',
//         tenantId: interview.tenantId,
//         ownerId: interview.ownerId,
//         recipientId: schedulerEmail, // Using email as recipientId for scheduler
//         createdBy: interview.ownerId,
//         updatedBy: interview.ownerId,
//       });
//     }

//     // Save notifications
//     if (notifications.length > 0) {
//       await Notification.insertMany(notifications);
//     }

//     // Send emails
//     const emailResults = await Promise.all(emailPromises);
//     const successfulEmails = emailResults.filter(r => r.success);
//     const failedEmails = emailResults.filter(r => !r.success);

//     // Update notification status
//     if (failedEmails.length > 0) {
//       console.error('Failed emails:', failedEmails);
//       await Notification.updateMany(
//         { recipientId: { $in: failedEmails.map(f => f.email) } },
//         { $set: { status: 'Failed', body: 'Failed to send email' } }
//       );
//     }

//     if (successfulEmails.length > 0) {
//       await Notification.updateMany(
//         { recipientId: { $in: successfulEmails.map(s => s.email) } },
//         { $set: { status: 'Success' } }
//       );
//     }

//     const result = {
//       success: true,
//       message: 'Interview round emails sent successfully',
//       data: {
//         // schedulerLink:schedulerLink,
//         roundId: round._id,
//         emailsSent: successfulEmails.length,
//         emailsFailed: failedEmails.length,
//         recipients: {
//           candidate: candidateEmail,
//           interviewers: interviewerEmails,
//           scheduler: schedulerEmail
//         }
//       }
//     };

//     if (res) {
//       return res.status(200).json(result);
//     }
//     return result;

//   } catch (error) {
//     console.error('Error sending interview round emails:', error);
//     const errorResult = {
//       success: false,
//       message: 'Failed to send interview round emails',
//       error: error.message,
//     };
//     if (res) {
//       return res.status(500).json(errorResult);
//     }
//     return errorResult;
//   }
// };


exports.sendInterviewRoundEmails = async (req, res = null) => {
  try {
    const {
      interviewId,
      roundId,
      sendEmails = true, // Default to true, can be controlled by caller
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
      .populate('ownerId')
      .populate('positionId', 'title');
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

    const position = interview.positionId?.title || 'Not Assigned';

    // Fetch tenant details for company name and address
    const tenant = await Tenant.findById(interview.tenantId);
    const tenantCompanyName = tenant?.company || companyName;
    const address = tenant?.offices?.[0]?.address || 'To be provided';

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

    const isFaceToFace = round.interviewMode === "Face to Face";
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

    // Get interviewer emails
    const interviewerEmails = [];
    if (round.interviewers && round.interviewers.length > 0) {
      for (const interviewer of round.interviewers) {
        if (interviewer.email) {
          interviewerEmails.push(interviewer);
        }
      }
    }

    // Common email data
    const roundTitle = round.roundTitle || 'Interview Round';
    const interviewMode = round.interviewMode || 'Online';
    const dateTime = round.dateTime || 'To be scheduled';
    const duration = round.duration || '60 minutes';
    const instructions = round.instructions || 'Please arrive on time.';
    // const position = round.positionId.title || 'No Position';

    const notifications = [];
    const emailPromises = [];

    // Handle Face-to-Face interviews
    if (isFaceToFace) {
      // Get face-to-face template

      const templateCategory = tenant.type === 'individual'
        ? 'interview_face_to_face_individual'
        : 'interview_face_to_face';
      const faceToFaceTemplate = await emailTemplateModel.findOne({
        category: templateCategory,
        isSystemTemplate: true,
        isActive: true
      });

      // Candidate email
      if (faceToFaceTemplate && candidateEmail) {
        const candidateName = [candidate.FirstName, candidate.LastName].filter(Boolean).join(' ') || 'Candidate';
        const emailSubject = faceToFaceTemplate.subject
          // .replace('{{companyName}}', tenantCompanyName)
          .replace('{{roundTitle}}', roundTitle);

        const emailBody = faceToFaceTemplate.body
          .replace(/{{recipientName}}/g, candidateName)
          .replace(/{{companyName}}/g, companyName)
          .replace(/{{roundTitle}}/g, roundTitle)
          .replace(/{{dateTime}}/g, dateTime)
          .replace(/{{duration}}/g, duration)
          .replace(/{{address}}/g, address)
          .replace(/{{instructions}}/g, instructions)
          .replace(/{{supportEmail}}/g, supportEmail)
          .replace(/{{orgCompanyName}}/g, tenantCompanyName)
          .replace(/{{position}}/g, position);//we can add postion because face face dont have mock



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

      // Interviewer emails
      if (faceToFaceTemplate && interviewerEmails.length > 0) {
        for (const interviewer of interviewerEmails) {
          const interviewerName = [interviewer.firstName, interviewer.lastName].filter(Boolean).join(' ') || 'Interviewer';
          const emailSubject = faceToFaceTemplate.subject
            // .replace('{{companyName}}', tenantCompanyName)
            .replace('{{roundTitle}}', roundTitle);

          const emailBody = faceToFaceTemplate.body
            .replace(/{{recipientName}}/g, interviewerName)
            .replace(/{{companyName}}/g, companyName)
            .replace(/{{roundTitle}}/g, roundTitle)
            .replace(/{{dateTime}}/g, dateTime)
            .replace(/{{duration}}/g, duration)
            .replace(/{{address}}/g, address)
            .replace(/{{instructions}}/g, instructions)
            .replace(/{{supportEmail}}/g, supportEmail)
            .replace(/{{orgCompanyName}}/g, tenantCompanyName)
            .replace(/{{position}}/g, position);//we can add postion because face face dont have mock

          emailPromises.push(
            sendEmail(interviewer.email, emailSubject, emailBody)
              .then(response => ({
                email: interviewer.email,
                recipient: 'interviewer',
                success: true
              }))
              .catch(error => ({
                email: interviewer.email,
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
            recipientId: interviewer.email,
            createdBy: interview.ownerId,
            updatedBy: interview.ownerId,
          });
        }
      }

      // Scheduler email
      if (faceToFaceTemplate && schedulerEmail) {
        const schedulerName = [scheduler?.firstName, scheduler?.lastName].filter(Boolean).join(' ') || 'Scheduler';
        const emailSubject = faceToFaceTemplate.subject
          // .replace('{{companyName}}', tenantCompanyName)
          .replace('{{roundTitle}}', roundTitle);

        const emailBody = faceToFaceTemplate.body
          .replace(/{{recipientName}}/g, schedulerName)
          .replace(/{{companyName}}/g, companyName)
          .replace(/{{roundTitle}}/g, roundTitle)
          .replace(/{{dateTime}}/g, dateTime)
          .replace(/{{duration}}/g, duration)
          .replace(/{{address}}/g, address)
          .replace(/{{instructions}}/g, instructions)
          .replace(/{{supportEmail}}/g, supportEmail)
          .replace(/{{orgCompanyName}}/g, tenantCompanyName)
          .replace(/{{position}}/g, position);//we can add postion because face face dont have mock

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
          recipientId: schedulerEmail,
          createdBy: interview.ownerId,
          updatedBy: interview.ownerId,
        });
      }
    } else {
      // Non-Face-to-Face (Online) interviews
      const templateCategory = tenant.type === 'individual'
        ? 'interview_candidate_invite_individual'
        : 'interview_candidate_invite';

      const candidateTemplate = await emailTemplateModel.findOne({
        category: templateCategory,
        isSystemTemplate: true,
        isActive: true
      });
      const templateCategory1 = tenant.type === 'individual'
        ? 'interview_interviewer_invite_individual'
        : 'interview_interviewer_invite';


      const interviewerTemplate = await emailTemplateModel.findOne({
        category: templateCategory1,
        isSystemTemplate: true,
        isActive: true
      });

      const templateCategory2 = tenant.type === 'individual'
        ? 'interview_scheduler_notification_individual'
        : 'interview_scheduler_notification';

      const schedulerTemplate = await emailTemplateModel.findOne({
        category: templateCategory2,
        isSystemTemplate: true,
        isActive: true
      });

      const baseUrl = `${config.REACT_APP_API_URL_FRONTEND}/join-meeting`;
      const meetingLink = round.meetingId;
      const encryptedMeetingLink = encryptData(meetingLink);
      const encryptedRoundId = encryptData(roundId);

      // Send email to candidate
      if (candidateTemplate && candidateEmail) {
        const candidateName = [candidate.FirstName, candidate.LastName].filter(Boolean).join(' ') || 'Candidate';
        const emailSubject = candidateTemplate.subject
          .replace('{{companyName}}', tenantCompanyName)
          .replace('{{roundTitle}}', roundTitle);

        let emailBody = candidateTemplate.body
          .replace(/{{candidateName}}/g, candidateName)
          .replace(/{{companyName}}/g, companyName)
          .replace(/{{roundTitle}}/g, roundTitle)
          .replace(/{{interviewMode}}/g, interviewMode)
          .replace(/{{dateTime}}/g, dateTime)
          .replace(/{{duration}}/g, duration)
          .replace(/{{instructions}}/g, instructions)
          .replace(/{{supportEmail}}/g, supportEmail)
          .replace(/{{orgCompanyName}}/g, tenantCompanyName)
          .replace(/{{position}}/g, position);



        if (meetingLink && meetingLink.length > 0) {
          const candidateUrl = `${baseUrl}?candidate=true&meeting=${encodeURIComponent(encryptedMeetingLink)}&round=${encodeURIComponent(encryptedRoundId)}`;
          emailBody = emailBody.replace(/{{meetingLink}}/g, candidateUrl);
        } else {
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
        for (const interviewer of interviewerEmails) {
          const emailSubject = interviewerTemplate.subject
            .replace('{{companyName}}', tenantCompanyName)
            .replace('{{roundTitle}}', roundTitle);

          let emailBody = interviewerTemplate.body
            .replace(/{{companyName}}/g, companyName)
            .replace(/{{roundTitle}}/g, roundTitle)
            .replace(/{{interviewMode}}/g, interviewMode)
            .replace(/{{dateTime}}/g, dateTime)
            .replace(/{{duration}}/g, duration)
            .replace(/{{instructions}}/g, instructions)
            .replace(/{{supportEmail}}/g, supportEmail)
            .replace(/{{orgCompanyName}}/g, tenantCompanyName)
            .replace(/{{position}}/g, position);


          const meetingLink = round.meetingId;

          if (meetingLink && meetingLink.length > 0) {
            const encryptedInterviewerId = encryptData(interviewer._id);
            const encryptedOwnerId = encryptData(interviewer.ownerId);
            const interviewerLink = `${baseUrl}?interviewer=true&meeting=${encodeURIComponent(encryptedMeetingLink)}&round=${encodeURIComponent(encryptedRoundId)}&interviewertoken=${encodeURIComponent(encryptedInterviewerId)}&owner=${encodeURIComponent(encryptedOwnerId)}`;
            emailBody = emailBody.replace('{{meetingLink}}', interviewerLink);
          } else {
            emailBody = emailBody.replace('{{meetingLink}}', 'Meeting link will be provided later');
          }

          emailPromises.push(
            sendEmail(interviewer.email, emailSubject, emailBody)
              .then(response => ({
                email: interviewer.email,
                recipient: 'interviewer',
                success: true
              }))
              .catch(error => ({
                email: interviewer.email,
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
            recipientId: interviewer.email,
            createdBy: interview.ownerId,
            updatedBy: interview.ownerId,
          });
        }
      }

      // Send email to scheduler/owner
      if (schedulerTemplate && schedulerEmail) {
        const candidateName = [candidate.FirstName, candidate.LastName].filter(Boolean).join(' ') || 'Candidate';
        const emailSubject = schedulerTemplate.subject
          .replace(/{{companyName}}/g, tenantCompanyName)
          .replace(/{{roundTitle}}/g, roundTitle);

        let emailBody = schedulerTemplate.body
          .replace(/{{companyName}}/g, companyName)
          .replace(/{{roundTitle}}/g, roundTitle)
          .replace(/{{candidateName}}/g, candidateName)
          .replace(/{{interviewMode}}/g, interviewMode)
          .replace(/{{dateTime}}/g, dateTime)
          .replace(/{{duration}}/g, duration)
          .replace(/{{instructions}}/g, instructions)
          .replace(/{{supportEmail}}/g, supportEmail)
          .replace(/{{orgCompanyName}}/g, tenantCompanyName)
          .replace(/{{position}}/g, position);


        if (meetingLink && meetingLink.length > 0) {
          const encryptedSchedulerId = encryptData(scheduler?._id);
          const encryptedSchedulerOwnerId = encryptData(scheduler?.ownerId);
          const schedulerLink = `${baseUrl}?scheduler=true&meeting=${encodeURIComponent(encryptedMeetingLink)}&round=${encodeURIComponent(encryptedRoundId)}&schedulertoken=${encodeURIComponent(encryptedSchedulerId)}&owner=${encodeURIComponent(encryptedSchedulerOwnerId)}`;
          emailBody = emailBody.replace(/{{meetingLink}}/g, schedulerLink);
        } else {
          emailBody = emailBody.replace(/{{meetingLink}}/g, 'Meeting link will be provided later');
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
          recipientId: schedulerEmail,
          createdBy: interview.ownerId,
          updatedBy: interview.ownerId,
        });
      }
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
          interviewers: interviewerEmails.map(i => i.email),
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
      // dateTime,
      // duration,
      // roundTitle,
      type
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
    let interview;
    if (type == 'mockinterview') {
      interview = await MockInterview.findById(interviewId)
    } else {
      // Fetch interview with candidate details
      interview = await Interview.findById(interviewId)
        .populate('candidateId')
        .populate('ownerId');
    }

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
    let candidate;
    if (type == 'mockinterview') {
      candidate = await Contacts.findOne({
        ownerId: interview.ownerId
      });
    } else {
      candidate = interview.candidateId;
    }
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
    let candidateName;
    if (type == 'mockinterview') {
      candidateName = [candidate.firstName, candidate.lastName].filter(Boolean).join(' ') || 'Candidate';
    } else {
      candidateName = [candidate.FirstName, candidate.LastName].filter(Boolean).join(' ') || 'Candidate';
    }

    const tenant = await Tenant.findById(interview.tenantId);
    const orgCompanyName = tenant.company;

    // Determine which template to use based on type
    const templateCategory = tenant.type === 'individual'
      ? 'outsource_interview_request_individual'
      : 'outsource_interview_request';

    // Get outsource interview request email template
    const outsourceRequestTemplate = await emailTemplateModel.findOne({
      category: templateCategory,
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
    let round;
    if (type == 'mockinterview') {
      round = await MockInterviewRound.findById(roundId);
    } else {
      round = await InterviewRounds.findById(roundId);
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
      const roundTitleText = round.roundTitle || 'Interview Round';
      const interviewMode = round.interviewMode || 'Online'; // Default for outsource interviews
      const dateTimeText = round.dateTime || 'To be scheduled';
      const durationText = round.duration || '60 minutes';
      const instructions = round.instructions || 'Please review the interview request and accept if you are available.';

      const emailSubject = outsourceRequestTemplate.subject
        // .replace('{{companyName}}', companyName)
        .replace('{{roundTitle}}', roundTitleText)
        .replace('{{candidateName}}', candidateName);

      let emailBody = outsourceRequestTemplate.body
        .replace(/{{companyName}}/g, companyName)
        .replace(/{{roundTitle}}/g, roundTitleText)
        .replace(/{{candidateName}}/g, candidateName)
        .replace(/{{interviewerName}}/g, interviewerName)
        .replace(/{{interviewMode}}/g, interviewMode)
        .replace(/{{dateTime}}/g, dateTimeText)
        .replace(/{{duration}}/g, durationText)
        .replace(/{{instructions}}/g, instructions)
        .replace(/{{supportEmail}}/g, supportEmail)
        .replace(/{{orgCompanyName}}/g, orgCompanyName)


      //didnt add position because mock dont have postion


      // Add dashboard link for outsource interviewers to accept/decline
      const dashboardLink = `${config.REACT_APP_API_URL_FRONTEND}/home`;
      emailBody = emailBody.replace(/{{dashboardLink}}/g, dashboardLink);

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