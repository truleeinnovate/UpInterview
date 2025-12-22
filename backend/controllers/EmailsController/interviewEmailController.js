// v1.0.0  -  Ashraf  -  creating interview email controller to send emails when rounds are saved

const CryptoJS = require("crypto-js");
const { Interview } = require("../../models/Interview/Interview.js");
const {
  MockInterview,
} = require("../../models/MockInterview/MockInterview.js");
const {
  MockInterviewRound,
} = require("../../models/MockInterview/mockinterviewRound.js");
const {
  InterviewRounds,
} = require("../../models/Interview/InterviewRounds.js");
const { Candidate } = require("../../models/candidate.js");
const { Contacts } = require("../../models/Contacts");
const emailTemplateModel = require("../../models/EmailTemplatemodel");
const sendEmail = require("../../utils/sendEmail");
const Notification = require("../../models/notification");
const mongoose = require("mongoose");
const config = require("../../config");
const Tenant = require("../../models/Tenant");
const Handlebars = require("handlebars");

function compileEmailTemplate(template, data) {
  const compiled = Handlebars.compile(template);
  return compiled(data);
};


const SECRET_KEY = "asdnalksm$$@#@cjh#@$abidsduwoa";

const encryptData = (data) => {
  try {
    if (data === undefined || data === null) {
      return null;
    }
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  } catch (error) {
    console.error("Error encrypting data:", error);
    return null;
  }
};

//this helps us to send emails to scheduler,interviwer,candidate if round scheduled.it has different emails for face to face and virtual because face to face has physical interview.-Ashraf
exports.sendInterviewRoundEmails = async (req, res = null) => {
  try {
    const {
      interviewId,
      roundId,
      sendEmails = true, // Default to true, can be controlled by caller
    } = req.body;

    // Set company name and support email from environment variables or defaults
    const companyName = process.env.COMPANY_NAME || "UpInterview";
    const supportEmail = process.env.SUPPORT_EMAIL || "support@upinterview.com";

    // Validate input
    if (!interviewId || !mongoose.isValidObjectId(interviewId)) {
      const error = {
        success: false,
        message: "Invalid or missing interview ID",
      };
      if (res) {
        return res.status(400).json(error);
      }
      return error;
    }

    if (!roundId || !mongoose.isValidObjectId(roundId)) {
      const error = {
        success: false,
        message: "Invalid or missing round ID",
      };
      if (res) {
        return res.status(400).json(error);
      }
      return error;
    }

    // Fetch interview with candidate details
    const interview = await Interview.findById(interviewId)
      .populate("candidateId")
      .populate("ownerId")
      .populate("positionId", "title");
    if (!interview) {
      const error = {
        success: false,
        message: "Interview not found",
      };
      if (res) {
        return res.status(404).json(error);
      }
      return error;
    }

    const position = interview.positionId?.title || "Not Assigned";

    // Fetch tenant details for company name and address
    const tenant = await Tenant.findById(interview.tenantId);
    const tenantCompanyName = tenant?.company || companyName;
    const address = tenant?.offices?.[0]?.address || "To be provided";

    // Fetch round details
    const round = await InterviewRounds.findById(roundId).populate(
      "interviewers"
    );
    if (!round) {
      const error = {
        success: false,
        message: "Interview round not found",
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
        message: "Emails will be sent later when interviewer accepts request",
        data: { roundId: round._id },
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
        message: "Candidate not found",
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
        message: "No email address found for candidate",
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
        ownerId: owner._id,
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
    const roundTitle = round.roundTitle || "Interview Round";
    const interviewMode = round.interviewMode || "Online";
    const dateTime = round.dateTime || "To be scheduled";
    const duration = round.duration || "60 minutes";
    const instructions = round.instructions || "Please arrive on time.";
    // const position = round.positionId.title || 'No Position';

    const notifications = [];
    const emailPromises = [];

    // Handle Face-to-Face interviews
    if (isFaceToFace) {
      // Get face-to-face template

      const templateCategory =
        tenant.type === "individual"
          ? "interview_face_to_face_individual"
          : "interview_face_to_face";
      const faceToFaceTemplate = await emailTemplateModel.findOne({
        category: templateCategory,
        isSystemTemplate: true,
        isActive: true,
      });

      // Candidate email
      if (faceToFaceTemplate && candidateEmail) {
        const candidateName =
          [candidate.FirstName, candidate.LastName].filter(Boolean).join(" ") ||
          "Candidate";
        const emailSubject = faceToFaceTemplate.subject
          .replace(/{{orgCompanyName}}/g, tenantCompanyName)
          .replace("{{roundTitle}}", roundTitle);

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
          .replace(/{{position}}/g, position); //we can add postion because face face dont have mock

        emailPromises.push(
          sendEmail(candidateEmail, emailSubject, emailBody)
            .then((response) => ({
              email: candidateEmail,
              recipient: "candidate",
              success: true,
            }))
            .catch((error) => ({
              email: candidateEmail,
              recipient: "candidate",
              success: false,
              error: error.message,
            }))
        );

        notifications.push({
          title: emailSubject,
          body: emailBody,
          notificationType: "email",
          object: {
            objectName: "interview_round",
            objectId: roundId,
          },
          status: "Pending",
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
          const interviewerName =
            [interviewer.firstName, interviewer.lastName]
              .filter(Boolean)
              .join(" ") || "Interviewer";
          const emailSubject = faceToFaceTemplate.subject
            .replace(/{{orgCompanyName}}/g, tenantCompanyName)
            .replace("{{roundTitle}}", roundTitle);

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
            .replace(/{{position}}/g, position); //we can add postion because face face dont have mock

          emailPromises.push(
            sendEmail(interviewer.email, emailSubject, emailBody)
              .then((response) => ({
                email: interviewer.email,
                recipient: "interviewer",
                success: true,
              }))
              .catch((error) => ({
                email: interviewer.email,
                recipient: "interviewer",
                success: false,
                error: error.message,
              }))
          );

          notifications.push({
            title: emailSubject,
            body: emailBody,
            notificationType: "email",
            object: {
              objectName: "interview_round",
              objectId: roundId,
            },
            status: "Pending",
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
        const schedulerName =
          [scheduler?.firstName, scheduler?.lastName]
            .filter(Boolean)
            .join(" ") || "Scheduler";
        const emailSubject = faceToFaceTemplate.subject
          .replace(/{{orgCompanyName}}/g, tenantCompanyName)
          .replace("{{roundTitle}}", roundTitle);

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
          .replace(/{{position}}/g, position); //we can add postion because face face dont have mock

        emailPromises.push(
          sendEmail(schedulerEmail, emailSubject, emailBody)
            .then((response) => ({
              email: schedulerEmail,
              recipient: "scheduler",
              success: true,
            }))
            .catch((error) => ({
              email: schedulerEmail,
              recipient: "scheduler",
              success: false,
              error: error.message,
            }))
        );

        notifications.push({
          title: emailSubject,
          body: emailBody,
          notificationType: "email",
          object: {
            objectName: "interview_round",
            objectId: roundId,
          },
          status: "Pending",
          tenantId: interview.tenantId,
          ownerId: interview.ownerId,
          recipientId: schedulerEmail,
          createdBy: interview.ownerId,
          updatedBy: interview.ownerId,
        });
      }
    } else {
      // Non-Face-to-Face (Online) interviews
      const templateCategory =
        tenant.type === "individual"
          ? "interview_candidate_invite_individual"
          : "interview_candidate_invite";

      const candidateTemplate = await emailTemplateModel.findOne({
        category: templateCategory,
        isSystemTemplate: true,
        isActive: true,
      });
      const templateCategory1 =
        tenant.type === "individual"
          ? "interview_interviewer_invite_individual"
          : "interview_interviewer_invite";

      const interviewerTemplate = await emailTemplateModel.findOne({
        category: templateCategory1,
        isSystemTemplate: true,
        isActive: true,
      });

      const templateCategory2 =
        tenant.type === "individual"
          ? "interview_scheduler_notification_individual"
          : "interview_scheduler_notification";

      const schedulerTemplate = await emailTemplateModel.findOne({
        category: templateCategory2,
        isSystemTemplate: true,
        isActive: true,
      });

      const baseUrl = `${config.REACT_APP_API_URL_FRONTEND}/join-meeting`;
      const meetingLink = round.meetingId;
      const encryptedMeetingLink = encryptData(meetingLink);
      const encryptedRoundId = encryptData(roundId);

      // Send email to candidate
      if (candidateTemplate && candidateEmail) {
        const candidateName =
          [candidate.FirstName, candidate.LastName].filter(Boolean).join(" ") ||
          "Candidate";
        const emailSubject = candidateTemplate.subject
          .replace(/{{orgCompanyName}}/g, tenantCompanyName)
          .replace(/{{roundTitle}}/g, roundTitle);

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
          const candidateUrl = `${baseUrl}?candidate=true&meeting=${encodeURIComponent(
            encryptedMeetingLink
          )}&round=${encodeURIComponent(encryptedRoundId)}`;
          emailBody = emailBody.replace(/{{meetingLink}}/g, candidateUrl);
        } else {
          emailBody = emailBody.replace(
            "{{meetingLink}}",
            "Meeting link will be provided later"
          );
        }

        emailPromises.push(
          sendEmail(candidateEmail, emailSubject, emailBody)
            .then((response) => ({
              email: candidateEmail,
              recipient: "candidate",
              success: true,
            }))
            .catch((error) => ({
              email: candidateEmail,
              recipient: "candidate",
              success: false,
              error: error.message,
            }))
        );

        notifications.push({
          title: emailSubject,
          body: emailBody,
          notificationType: "email",
          object: {
            objectName: "interview_round",
            objectId: roundId,
          },
          status: "Pending",
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
            .replace(/{{orgCompanyName}}/g, tenantCompanyName)
            .replace(/{{roundTitle}}/g, roundTitle);

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
            const interviewerLink = `${baseUrl}?interviewer=true&meeting=${encodeURIComponent(
              encryptedMeetingLink
            )}&round=${encodeURIComponent(
              encryptedRoundId
            )}&interviewertoken=${encodeURIComponent(
              encryptedInterviewerId
            )}&owner=${encodeURIComponent(encryptedOwnerId)}`;
            emailBody = emailBody.replace("{{meetingLink}}", interviewerLink);
          } else {
            emailBody = emailBody.replace(
              "{{meetingLink}}",
              "Meeting link will be provided later"
            );
          }

          emailPromises.push(
            sendEmail(interviewer.email, emailSubject, emailBody)
              .then((response) => ({
                email: interviewer.email,
                recipient: "interviewer",
                success: true,
              }))
              .catch((error) => ({
                email: interviewer.email,
                recipient: "interviewer",
                success: false,
                error: error.message,
              }))
          );

          notifications.push({
            title: emailSubject,
            body: emailBody,
            notificationType: "email",
            object: {
              objectName: "interview_round",
              objectId: roundId,
            },
            status: "Pending",
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
        const candidateName =
          [candidate.FirstName, candidate.LastName].filter(Boolean).join(" ") ||
          "Candidate";
        const emailSubject = schedulerTemplate.subject
          .replace(/{{orgCompanyName}}/g, tenantCompanyName)
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
          const schedulerLink = `${baseUrl}?scheduler=true&meeting=${encodeURIComponent(
            encryptedMeetingLink
          )}&round=${encodeURIComponent(
            encryptedRoundId
          )}&schedulertoken=${encodeURIComponent(
            encryptedSchedulerId
          )}&owner=${encodeURIComponent(encryptedSchedulerOwnerId)}`;
          emailBody = emailBody.replace(/{{meetingLink}}/g, schedulerLink);
        } else {
          emailBody = emailBody.replace(
            /{{meetingLink}}/g,
            "Meeting link will be provided later"
          );
        }

        emailPromises.push(
          sendEmail(schedulerEmail, emailSubject, emailBody)
            .then((response) => ({
              email: schedulerEmail,
              recipient: "scheduler",
              success: true,
            }))
            .catch((error) => ({
              email: schedulerEmail,
              recipient: "scheduler",
              success: false,
              error: error.message,
            }))
        );

        notifications.push({
          title: emailSubject,
          body: emailBody,
          notificationType: "email",
          object: {
            objectName: "interview_round",
            objectId: roundId,
          },
          status: "Pending",
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
    const successfulEmails = emailResults.filter((r) => r.success);
    const failedEmails = emailResults.filter((r) => !r.success);

    // Update notification status
    if (failedEmails.length > 0) {
      console.error("Failed emails:", failedEmails);
      await Notification.updateMany(
        { recipientId: { $in: failedEmails.map((f) => f.email) } },
        { $set: { status: "Failed", body: "Failed to send email" } }
      );
    }

    if (successfulEmails.length > 0) {
      await Notification.updateMany(
        { recipientId: { $in: successfulEmails.map((s) => s.email) } },
        { $set: { status: "Success" } }
      );
    }

    const result = {
      success: true,
      message: "Interview round emails sent successfully",
      data: {
        roundId: round._id,
        emailsSent: successfulEmails.length,
        emailsFailed: failedEmails.length,
        recipients: {
          candidate: candidateEmail,
          interviewers: interviewerEmails.map((i) => i.email),
          scheduler: schedulerEmail,
        },
      },
    };

    if (res) {
      return res.status(200).json(result);
    }
    return result;
  } catch (error) {
    console.error("Error sending interview round emails:", error);
    const errorResult = {
      success: false,
      message: "Failed to send interview round emails",
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
      type,
    } = req.body;

    console.log("req.body", req.body);

    // Set company name and support email from environment variables or defaults
    const companyName = process.env.COMPANY_NAME || "UpInterview";
    const supportEmail = process.env.SUPPORT_EMAIL || "support@upinterview.com";

    // Validate input
    if (!interviewId || !mongoose.isValidObjectId(interviewId)) {
      const error = {
        success: false,
        message: "Invalid or missing interview ID",
      };
      if (res) {
        return res.status(400).json(error);
      }
      return error;
    }

    if (!roundId || !mongoose.isValidObjectId(roundId)) {
      const error = {
        success: false,
        message: "Invalid or missing round ID",
      };
      if (res) {
        return res.status(400).json(error);
      }
      return error;
    }

    if (
      !interviewerIds ||
      !Array.isArray(interviewerIds) ||
      interviewerIds.length === 0
    ) {
      const error = {
        success: false,
        message: "Invalid or missing interviewer IDs",
      };
      if (res) {
        return res.status(400).json(error);
      }
      return error;
    }
    let interview;
    if (type == "mockinterview") {
      interview = await MockInterview.findById(interviewId);
    } else {
      // Fetch interview with candidate details
      interview = await Interview.findById(interviewId)
        .populate("candidateId")
        .populate("ownerId");
    }

    if (!interview) {
      const error = {
        success: false,
        message: "Interview not found",
      };
      if (res) {
        return res.status(404).json(error);
      }
      return error;
    }

    // Fetch candidate details
    let candidate;
    if (type == "mockinterview") {
      candidate = await Contacts.findOne({
        ownerId: interview.ownerId,
      });
    } else {
      candidate = interview.candidateId;
    }
    if (!candidate) {
      const error = {
        success: false,
        message: "Candidate not found",
      };
      if (res) {
        return res.status(404).json(error);
      }
      return error;
    }

    // Get candidate name
    let candidateName;
    if (type == "mockinterview") {
      candidateName =
        [candidate.firstName, candidate.lastName].filter(Boolean).join(" ") ||
        "Candidate";
    } else {
      candidateName =
        [candidate.FirstName, candidate.LastName].filter(Boolean).join(" ") ||
        "Candidate";
    }

    const tenant = await Tenant.findById(interview.tenantId);
    const orgCompanyName = tenant.company;

    // Determine which template to use based on type
    const templateCategory =
      tenant.type === "individual"
        ? "outsource_interview_request_individual"
        : "outsource_interview_request";

    // Get outsource interview request email template
    const outsourceRequestTemplate = await emailTemplateModel.findOne({
      category: templateCategory,
      isSystemTemplate: true,
      isActive: true,
    });

    if (!outsourceRequestTemplate) {
      const error = {
        success: false,
        message: "Outsource interview request email template not found",
      };
      if (res) {
        return res.status(404).json(error);
      }
      return error;
    }

    // Fetch interviewer details from Contacts
    const interviewers = await Contacts.find({
      _id: { $in: interviewerIds },
    });

    if (!interviewers || interviewers.length === 0) {
      const error = {
        success: false,
        message: "No valid interviewers found",
      };
      if (res) {
        return res.status(404).json(error);
      }
      return error;
    }
    let round;
    if (type == "mockinterview") {
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

      const interviewerName =
        [interviewer.firstName, interviewer.lastName]
          .filter(Boolean)
          .join(" ") || "Interviewer";
      const roundTitleText = round.roundTitle || "Interview Round";
      const interviewMode = round.interviewMode || "Online"; // Default for outsource interviews
      const dateTimeText = round.dateTime || "To be scheduled";
      const durationText = round.duration || "60 minutes";
      const instructions =
        round.instructions ||
        "Please review the interview request and accept if you are available.";

      const emailSubject = outsourceRequestTemplate.subject
        // .replace('{{companyName}}', companyName)
        .replace(/{{roundTitle}}/g, roundTitleText)
        .replace(/{{candidateName}}/g, candidateName);

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
        .replace(/{{orgCompanyName}}/g, orgCompanyName);

      //didnt add position because mock dont have postion

      // Add dashboard link for outsource interviewers to accept/decline
      const dashboardLink = `${config.REACT_APP_API_URL_FRONTEND}/home`;
      emailBody = emailBody.replace(/{{dashboardLink}}/g, dashboardLink);

      emailPromises.push(
        sendEmail(interviewer.email, emailSubject, emailBody)
          .then((response) => ({
            email: interviewer.email,
            recipient: "outsource_interviewer",
            interviewerId: interviewer._id,
            success: true,
          }))
          .catch((error) => ({
            email: interviewer.email,
            recipient: "outsource_interviewer",
            interviewerId: interviewer._id,
            success: false,
            error: error.message,
          }))
      );

      notifications.push({
        title: emailSubject,
        body: emailBody,
        notificationType: "email",
        object: {
          objectName: "outsource_interview_request",
          objectId: roundId,
        },
        status: "Pending",
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
    const successfulEmails = emailResults.filter((r) => r.success);
    const failedEmails = emailResults.filter((r) => !r.success);

    // Update notification status for successful emails
    if (successfulEmails.length > 0) {
      const successfulEmailsList = successfulEmails.map((r) => r.email);
      await Notification.updateMany(
        {
          objectName: "outsource_interview_request",
          objectId: roundId,
          recipientId: { $in: successfulEmails.map((r) => r.interviewerId) },
        },
        { status: "Success" }
      );
    }

    // Update notification status for failed emails
    if (failedEmails.length > 0) {
      const failedEmailsList = failedEmails.map((r) => r.email);
      await Notification.updateMany(
        {
          objectName: "outsource_interview_request",
          objectId: roundId,
          recipientId: { $in: failedEmails.map((r) => r.interviewerId) },
        },
        { status: "Failed" }
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
        successfulEmailsList: successfulEmails.map((r) => ({
          email: r.email,
          interviewerId: r.interviewerId,
        })),
        failedEmailsList: failedEmails.map((r) => ({
          email: r.email,
          interviewerId: r.interviewerId,
          error: r.error,
        })),
      },
    };
    console.log("result outsource interview", result);

    if (res) {
      return res.status(200).json(result);
    }
    return result;
  } catch (error) {
    console.error("Error sending outsource interview request emails:", error);
    const errorResult = {
      success: false,
      message: "Failed to send outsource interview request emails",
      error: error.message,
    };

    if (res) {
      return res.status(500).json(errorResult);
    }
    return errorResult;
  }
};
//this helps us to send email when round cancelled with round status is scheduled.-Ashraf
exports.sendInterviewRoundCancellationEmails = async (req, res = null) => {
  try {
    const { interviewId, roundId, sendEmails = true } = req.body;

    const companyName = process.env.COMPANY_NAME || "UpInterview";
    const supportEmail = process.env.SUPPORT_EMAIL || "support@upinterview.com";

    // Validation
    if (!interviewId || !mongoose.isValidObjectId(interviewId)) {
      return sendError(res, 400, "Invalid or missing interview ID");
    }
    if (!roundId || !mongoose.isValidObjectId(roundId)) {
      return sendError(res, 400, "Invalid or missing round ID");
    }

    // Fetch data
    const interview = await Interview.findById(interviewId)
      .populate("candidateId")
      .populate("ownerId")
      .populate("positionId", "title");
    if (!interview) return sendError(res, 404, "Interview not found");

    const position = interview.positionId?.title || "Not Assigned";
    const tenant = await Tenant.findById(interview.tenantId);
    const tenantCompanyName = tenant?.company || companyName;
    const address = tenant?.offices?.[0]?.address || "";

    const round = await InterviewRounds.findById(roundId).populate(
      "interviewers"
    );
    if (!round) return sendError(res, 404, "Interview round not found");

    if (!sendEmails) {
      return res, "Cancellation emails queued for later", { roundId };
    }

    const candidate = interview.candidateId;
    if (!candidate || !candidate.Email) {
      return sendError(res, 400, "Candidate or email not found");
    }

    // Scheduler (owner contact)
    let schedulerEmail = null;
    let scheduler = null;
    if (interview.ownerId?._id) {
      const contact = await Contacts.findOne({
        ownerId: interview.ownerId._id,
      });
      scheduler = contact;
      schedulerEmail = contact?.email;
    }

    // Interviewers
    const interviewerEmails =
      round.interviewers
        ?.filter((i) => i.email)
        .map((i) => ({ ...i.toObject(), email: i.email })) || [];

    // Common data
    const roundTitle = round.roundTitle || "Interview Round";
    const interviewMode =
      round.interviewMode === "Face to Face" ? "Face to Face" : "Online";
    const dateTime = round.dateTime || "To be scheduled";
    const duration = round.duration || "60";

    // Load unified template
    const templateCategory = "interview_cancel";

    const cancelTemplate = await emailTemplateModel.findOne({
      category: templateCategory,
      isSystemTemplate: true,
      isActive: true,
    });

    if (!cancelTemplate) {
      console.warn("Cancellation template not found");
      // Optionally continue without email or fallback
    }

    const notifications = [];
    const emailPromises = [];

    const subject =
      cancelTemplate?.subject.replace("{{roundTitle}}", roundTitle) ||
      `Interview Cancellation: ${roundTitle}`;

    // Helper to generate body
    const generateBody = (name) => {
      if (!cancelTemplate) return "<p>Interview has been canceled.</p>";

      const templateData = {
        recipientName: name,
        companyName: companyName,
        roundTitle,
        interviewMode,
        dateTime,
        duration,
        supportEmail,
        position,
        address:
          interviewMode === "Face to Face" && address ? address : null,
      };

      return compileEmailTemplate(cancelTemplate.body, templateData);
    };

    // Send to Candidate
    const candidateName =
      [candidate.FirstName, candidate.LastName].filter(Boolean).join(" ") ||
      "Candidate";
    const candidateBody = generateBody(candidateName);

    emailPromises.push(
      sendEmail(candidate.Email, subject, candidateBody)
        .then(() => ({
          email: candidate.Email,
          recipient: "candidate",
          success: true,
        }))
        .catch((err) => ({
          email: candidate.Email,
          recipient: "candidate",
          success: false,
          error: err.message,
        }))
    );

    notifications.push(
      createNotification(subject, candidateBody, candidate._id)
    );

    // Send to Interviewers
    for (const interviewer of interviewerEmails) {
      const name =
        [interviewer.firstName, interviewer.lastName]
          .filter(Boolean)
          .join(" ") || "Interviewer";
      const body = generateBody(name);

      emailPromises.push(
        sendEmail(interviewer.email, subject, body)
          .then(() => ({
            email: interviewer.email,
            recipient: "interviewer",
            success: true,
          }))
          .catch((err) => ({
            email: interviewer.email,
            recipient: "interviewer",
            success: false,
            error: err.message,
          }))
      );

      notifications.push(createNotification(subject, body, interviewer.email));
    }

    // Send to Scheduler
    if (schedulerEmail) {
      const schedulerName =
        [scheduler?.firstName, scheduler?.lastName].filter(Boolean).join(" ") ||
        "Scheduler";
      const body = generateBody(schedulerName);

      emailPromises.push(
        sendEmail(schedulerEmail, subject, body)
          .then(() => ({
            email: schedulerEmail,
            recipient: "scheduler",
            success: true,
          }))
          .catch((err) => ({
            email: schedulerEmail,
            recipient: "scheduler",
            success: false,
            error: err.message,
          }))
      );

      notifications.push(createNotification(subject, body, schedulerEmail));
    }

    // Helper to create notification object
    function createNotification(title, body, recipientId) {
      return {
        title,
        body,
        notificationType: "email",
        object: { objectName: "interview_round_cancel", objectId: roundId },
        status: "Pending",
        tenantId: interview.tenantId,
        ownerId: interview.ownerId,
        recipientId,
        createdBy: interview.ownerId,
        updatedBy: interview.ownerId,
      };
    }

    // Save notifications
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // Execute emails
    const results = await Promise.all(emailPromises);
    const success = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    // Update notification statuses
    if (success.length > 0) {
      await Notification.updateMany(
        { recipientId: { $in: success.map((s) => s.email) } },
        { status: "Success" }
      );
    }
    if (failed.length > 0) {
      console.error("Failed cancellation emails:", failed);
      await Notification.updateMany(
        { recipientId: { $in: failed.map((f) => f.email) } },
        { status: "Failed" }
      );
    }

    return (
      res,
      "Cancellation emails processed successfully",
      {
        roundId: round._id,
        emailsSent: success.length,
        emailsFailed: failed.length,
        recipients: {
          candidate: candidate.Email,
          interviewers: interviewerEmails.map((i) => i.email),
          scheduler: schedulerEmail,
        },
      }
    );
  } catch (error) {
    console.error("Error in sendInterviewRoundCancellationEmails:", error);
    return sendError(
      res,
      500,
      "Failed to send cancellation emails",
      error.message
    );
  }
};
