// v1.0.0  -  Ashraf  -  creating interview email controller to send emails when rounds are saved

const CryptoJS = require("crypto-js");
const { Interview } = require("../../models/Interview/Interview.js");
const {
  MockInterview,
} = require("../../models/Mockinterview/mockinterview.js");
const {
  MockInterviewRound,
} = require("../../models/Mockinterview/mockinterviewRound.js");
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
}

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

// Helper to extract only start time from "start - end" format
const formatStartDateTime = (dateTimeString) => {
  if (!dateTimeString) return "To be scheduled";

  // Split by " - " and take the first part (start time)
  const startPart = dateTimeString.split(" - ")[0].trim();

  // Optional: You can further format it if needed
  return startPart;
};

// ──────────────────────────────────────────────
// Helper: Parse custom date string "DD-MM-YYYY hh:mm A - hh:mm A"
// ──────────────────────────────────────────────
function parseCustomDateTime(dateTimeStr) {
  if (!dateTimeStr || typeof dateTimeStr !== 'string') return null;

  // Matches: "17-02-2026 03:03 PM - 04:03 PM"
  const regex = /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})\s+(AM|PM)\s*-\s*(\d{2}):(\d{2})\s+(AM|PM)$/i;
  const match = dateTimeStr.trim().match(regex);

  if (!match) {
    console.warn(`Invalid dateTime format: ${dateTimeStr}`);
    return null;
  }

  const [, day, month, year, hourStr, min, meridiem] = match;

  let hour = parseInt(hourStr, 10);
  if (meridiem.toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (meridiem.toUpperCase() === 'AM' && hour === 12) hour = 0;

  const date = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1, // months are 0-based
    parseInt(day, 10),
    hour,
    parseInt(min, 10),
    0
  );

  return isNaN(date.getTime()) ? null : date;
}

// ──────────────────────────────────────────────
// Helper: Format date with timezone
// ──────────────────────────────────────────────
function formatInterviewDateTime(dateInput, timeZone = 'IST') {
  let dt;

  if (dateInput instanceof Date) {
    dt = dateInput;
  } else if (typeof dateInput === 'string') {
    dt = parseCustomDateTime(dateInput);
  } else {
    dt = null;
  }

  if (!dt || isNaN(dt.getTime())) {
    return "To be scheduled";
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone,
    timeZoneName: 'short',
  });

  return formatter.format(dt);
  // Example: "Tuesday, February 17, 2026, 3:03 PM IST"
}

//this helps us to send emails to scheduler,interviwer,candidate if round scheduled.it has different emails for face to face and virtual because face to face has physical interview.-Ashraf
exports.sendInterviewRoundEmails = async (req, res = null) => {
  try {
    const {
      interviewId,
      roundId,
      sendEmails = true, // Default to true, can be controlled by caller
      type
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
    // const interview = await Interview.findById(interviewId)
    //   .populate("candidateId")
    //   .populate("ownerId")
    //   .populate("positionId", "title");
    // if (!interview) {
    //   const error = {
    //     success: false,
    //     message: "Interview not found",
    //   };
    //   if (res) {
    //     return res.status(404).json(error);
    //   }
    //   return error;
    // }

    // Load interview with position populated
    let interview = type === "mockinterview"
      ? await MockInterview.findById(interviewId)
      : await Interview.findById(interviewId)
        .populate("candidateId", "FirstName LastName Email")
        .populate("ownerId", "firstName lastName")
        .populate("positionId", "title");

    if (!interview) return errorResponse(res, 404, "Interview not found");

    // Candidate
    let candidate = type === "mockinterview"
      ? await Contacts.findOne({ ownerId: interview.ownerId })
      : interview.candidateId;

    if (!candidate) return errorResponse(res, 404, "Candidate not found");

    const candidateName = type === "mockinterview"
      ? [candidate.firstName, candidate.lastName].filter(Boolean).join(" ") || "Candidate"
      : [candidate.FirstName, candidate.LastName].filter(Boolean).join(" ") || "Candidate";

    const candidateEmail =
      type === "mockinterview" ? candidate.email : candidate.Email;

    const position = interview.positionId?.title || "";
    let displayPosition = position?.trim() || "";
    if (type === "mockinterview") {
      displayPosition = "";
    }

    // Fetch tenant details for company name and address
    const tenant = await Tenant.findById(interview.tenantId);
    const tenantCompanyName = tenant?.company || companyName;
    const address = tenant?.offices?.[0]?.address || "To be provided";
    const organizerTz = 'IST';

    let round;

    if (type === "mockinterview") {
      round = await MockInterviewRound
        .findById(roundId)
        .populate("interviewers");
    } else {
      round = await InterviewRounds
        .findById(roundId)
        .populate("interviewers");
    }

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
    // const candidate = interview.candidateId;
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
    // const dateTime = round.dateTime || "To be scheduled";
    const startDateTime = round.dateTime
      ? formatInterviewDateTime(round.dateTime, organizerTz)
      : "To be scheduled";
    const duration = round.duration || "60 minutes";
    const instructions = round.instructions || "Please arrive on time.";
    // const position = round.positionId.title || 'No Position';

    const notifications = [];
    const emailPromises = [];

    // Handle Face-to-Face interviews
    if (isFaceToFace && type !== "mockinterview") {

      // ──────────────────────────────────────────────
      //   Address lookup
      // ──────────────────────────────────────────────
      let faceToFaceAddress = "Address not provided";

      if (round.addressId) {
        const selectedOffice = tenant.offices?.find(
          office => office._id?.toString() === round.addressId?.toString()
        );

        if (selectedOffice) {
          faceToFaceAddress = [
            selectedOffice.address?.trim(),
            selectedOffice.city?.trim(),
            selectedOffice.state?.trim(),
            selectedOffice.zip?.trim(),
            selectedOffice.country?.trim()
          ]
            .filter(Boolean)
            .join(", ") || selectedOffice.address || "Address not provided";
        }
      }

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
          .replace(/{{dateTime}}/g, startDateTime)
          .replace(/{{duration}}/g, duration)
          .replace(/{{address}}/g, faceToFaceAddress)
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
            .replace(/{{dateTime}}/g, startDateTime)
            .replace(/{{duration}}/g, duration)
            .replace(/{{address}}/g, faceToFaceAddress)
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
          .replace(/{{dateTime}}/g, startDateTime)
          .replace(/{{duration}}/g, duration)
          .replace(/{{address}}/g, faceToFaceAddress)
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
      const encryptedRoundId = encryptData(roundId);


      // Send email to candidate
      if (candidateTemplate && candidateEmail) {
        // const candidateName =
        //   [candidate.FirstName, candidate.LastName].filter(Boolean).join(" ") ||
        //   "Candidate";
        const emailSubject = candidateTemplate.subject
          .replace(/{{orgCompanyName}}/g, tenantCompanyName)
          .replace(/{{roundTitle}}/g, roundTitle);

        let emailBody = candidateTemplate.body
          .replace(/{{candidateName}}/g, candidateName)
          .replace(/{{companyName}}/g, companyName)
          .replace(/{{roundTitle}}/g, roundTitle)
          .replace(/{{interviewMode}}/g, interviewMode)
          .replace(/{{dateTime}}/g, startDateTime)
          .replace(/{{duration}}/g, duration)
          .replace(/{{instructions}}/g, instructions)
          .replace(/{{supportEmail}}/g, supportEmail)
          .replace(/{{orgCompanyName}}/g, tenantCompanyName)
          .replace(/{{position}}/g, displayPosition);

        // Now hide the entire line if position is empty
        if (!displayPosition.trim()) {
          emailBody = emailBody.replace(
            /<!--\s*POSITION_BLOCK_START\s*-->[\s\S]*?<!--\s*POSITION_BLOCK_END\s*-->/g,
            ''
          );
        }

        // if (meetingLink && meetingLink.length > 0) {
        // const candidateUrl = `${baseUrl}?candidate=true&meeting=${encodeURIComponent(
        //   encryptedMeetingLink
        // )}&round=${encodeURIComponent(encryptedRoundId)}`;
        const candidateUrl = `${baseUrl}?candidate=true&round=${encodeURIComponent(encryptedRoundId)}${type ? `&type=${type}` : ';'}`;
        emailBody = emailBody.replace(/{{meetingLink}}/g, candidateUrl);
        // } else {
        //   emailBody = emailBody.replace(
        //     "{{meetingLink}}",
        //     "Meeting link will be provided later"
        //   );
        // }

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
            .replace(/{{dateTime}}/g, startDateTime)
            .replace(/{{duration}}/g, duration)
            .replace(/{{instructions}}/g, instructions)
            .replace(/{{supportEmail}}/g, supportEmail)
            .replace(/{{orgCompanyName}}/g, tenantCompanyName)
            .replace(/{{position}}/g, displayPosition);

          // Now hide the entire line if position is empty
          if (!displayPosition.trim()) {
            emailBody = emailBody.replace(
              /<!--\s*POSITION_BLOCK_START\s*-->[\s\S]*?<!--\s*POSITION_BLOCK_END\s*-->/g,
              ''
            );
          }

          // const meetingLink = round.meetingId;

          // if (meetingLink && meetingLink.length > 0) {
          const encryptedInterviewerId = encryptData(interviewer._id);//passing contact id
          const encryptedOwnerId = encryptData(interviewer.ownerId);
          // const interviewerLink = `${baseUrl}?interviewer=true&meeting=${encodeURIComponent(
          //   encryptedMeetingLink
          // )}&round=${encodeURIComponent(
          //   encryptedRoundId
          // )}&interviewertoken=${encodeURIComponent(
          //   encryptedInterviewerId
          // )}&owner=${encodeURIComponent(encryptedOwnerId)}`;
          const interviewerLink = `${baseUrl}?interviewer=true&round=${encodeURIComponent(encryptedRoundId)}&interviewertoken=${encodeURIComponent(encryptedInterviewerId)}&owner=${encodeURIComponent(encryptedOwnerId)}${type ? `&type=${type}` : ''}`;
          emailBody = emailBody.replace("{{meetingLink}}", interviewerLink);
          // } else {
          //   emailBody = emailBody.replace(
          //     "{{meetingLink}}",
          //     "Meeting link will be provided later"
          //   );
          // }

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
      if (schedulerTemplate && schedulerEmail && type !== "mockinterview") {
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
          .replace(/{{dateTime}}/g, startDateTime)
          .replace(/{{duration}}/g, duration)
          .replace(/{{instructions}}/g, instructions)
          .replace(/{{supportEmail}}/g, supportEmail)
          .replace(/{{orgCompanyName}}/g, tenantCompanyName)
          .replace(/{{position}}/g, displayPosition);

        // Now hide the entire line if position is empty
        if (!displayPosition.trim()) {
          emailBody = emailBody.replace(
            /<!--\s*POSITION_BLOCK_START\s*-->[\s\S]*?<!--\s*POSITION_BLOCK_END\s*-->/g,
            ''
          );
        }
        // if (meetingLink && meetingLink.length > 0) {
        const encryptedSchedulerId = encryptData(scheduler?._id);//passing contact id
        const encryptedSchedulerOwnerId = encryptData(scheduler?.ownerId);
        // const schedulerLink = `${baseUrl}?scheduler=true&meeting=${encodeURIComponent(
        //   encryptedMeetingLink
        // )}&round=${encodeURIComponent(
        //   encryptedRoundId
        // )}&schedulertoken=${encodeURIComponent(
        //   encryptedSchedulerId
        // )}&owner=${encodeURIComponent(encryptedSchedulerOwnerId)}`;
        const schedulerLink = `${baseUrl}?scheduler=true&round=${encodeURIComponent(encryptedRoundId)}&schedulertoken=${encodeURIComponent(encryptedSchedulerId)}&owner=${encodeURIComponent(encryptedSchedulerOwnerId)}${type ? `&type=${type}` : ''}`;
        emailBody = emailBody.replace(/{{meetingLink}}/g, schedulerLink);
        // } else {
        //   emailBody = emailBody.replace(
        //     /{{meetingLink}}/g,
        //     "Meeting link will be provided later"
        //   );
        // }

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
      interviewerIds,
      type,
    } = req.body;
    console.log("sendOutsourceInterviewRequestEmails");


    const companyName = process.env.COMPANY_NAME || "UpInterview";
    const supportEmail = process.env.SUPPORT_EMAIL || "support@upinterview.com";

    // Validation (keep your existing validation)
    if (!interviewId || !mongoose.isValidObjectId(interviewId)) {
      return errorResponse(res, 400, "Invalid or missing interview ID");
    }
    if (!roundId || !mongoose.isValidObjectId(roundId)) {
      return errorResponse(res, 400, "Invalid or missing round ID");
    }
    if (!Array.isArray(interviewerIds) || interviewerIds.length === 0) {
      return errorResponse(res, 400, "Invalid or missing interviewer IDs");
    }

    // Load interview with position populated
    let interview = type === "mockinterview"
      ? await MockInterview.findById(interviewId)
      : await Interview.findById(interviewId)
        .populate("candidateId", "FirstName LastName Email")
        .populate("ownerId", "firstName lastName")
        .populate("positionId", "title");

    if (!interview) return errorResponse(res, 404, "Interview not found");

    // Candidate
    let candidate = type === "mockinterview"
      ? await Contacts.findOne({ ownerId: interview.ownerId })
      : interview.candidateId;

    if (!candidate) return errorResponse(res, 404, "Candidate not found");

    const candidateName = type === "mockinterview"
      ? [candidate.firstName, candidate.lastName].filter(Boolean).join(" ") || "Candidate"
      : [candidate.FirstName, candidate.LastName].filter(Boolean).join(" ") || "Candidate";

    // Tenant → company name
    const tenant = await Tenant.findById(interview.tenantId);
    const showCompany =
      !!(
        tenant &&
        tenant.type === "organization" &&
        typeof tenant.company === "string" &&
        tenant.company.trim()
      );

    const orgCompanyName = showCompany
      ? tenant.company.trim()
      : null;



    // Load template
    const template = await emailTemplateModel.findOne({
      category: "outsource_interview_request",
      isSystemTemplate: true,
      isActive: true,
    });

    if (!template) return errorResponse(res, 404, "Template not found");

    const interviewers = await Contacts.find({ _id: { $in: interviewerIds } });
    if (!interviewers.length) return errorResponse(res, 404, "No valid interviewers found");

    const round = type === "mockinterview"
      ? await MockInterviewRound.findById(roundId)
      : await InterviewRounds.findById(roundId);

    if (!round) return errorResponse(res, 404, "Round not found");

    const showPosition =
      !!(
        interview?.positionId &&
        typeof interview.positionId.title === "string" &&
        interview.positionId.title.trim()
      );

    const position = showPosition
      ? interview.positionId.title.trim()
      : null;


    // Prepare template data
    const templateData = {
      companyName,
      roundTitle: round.roundTitle || "Interview Round",
      candidateName,
      interviewerName: "", // will be set per interviewer
      interviewMode: round.interviewMode || "Online",
      dateTime: round.dateTime ? formatStartDateTime(round.dateTime) : "To be scheduled",
      duration: round.duration || "60 minutes",
      instructions: round.instructions || "Please review the interview request and accept if you are available.",
      supportEmail,
      dashboardLink: `${config.REACT_APP_API_URL_FRONTEND}/home`,
      // 🔥 flags
      showCompany,
      orgCompanyName,

      showPosition,
      position,
    };

    // Compile Handlebars template once (outside loop for performance)
    const compiled = Handlebars.compile(template.body);

    const notifications = [];
    const emailPromises = [];

    for (const interviewer of interviewers) {
      if (!interviewer.email) continue;

      const interviewerName = [interviewer.firstName, interviewer.lastName]
        .filter(Boolean)
        .join(" ") || "Interviewer";

      // Set interviewer name for this iteration
      const data = { ...templateData, interviewerName };

      // Render with Handlebars (handles {{#if}} automatically)
      let emailBody = compiled(data);

      // Minimal cleanup (Handlebars usually doesn't need much)
      emailBody = emailBody
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .trim();

      const subject = template.subject.replace(/{{roundTitle}}/g, data.roundTitle);

      emailPromises.push(
        sendEmail(interviewer.email, subject, emailBody)
          .then(() => ({ success: true, email: interviewer.email, interviewerId: interviewer._id }))
          .catch(err => ({ success: false, email: interviewer.email, interviewerId: interviewer._id, error: err.message }))
      );

      notifications.push({
        title: subject,
        body: emailBody,
        notificationType: "email",
        object: { objectName: "outsource_interview_request", objectId: roundId },
        status: "Pending",
        tenantId: interview.tenantId,
        ownerId: interview.ownerId,
        recipientId: interviewer._id,
        createdBy: interview.ownerId,
        updatedBy: interview.ownerId,
      });
    }

    if (notifications.length) await Notification.insertMany(notifications);

    const emailResults = await Promise.all(emailPromises);
    const successfulEmails = emailResults.filter(r => r.success);
    const failedEmails = emailResults.filter(r => !r.success);

    // Your existing status update logic...
    if (successfulEmails.length > 0) {
      await Notification.updateMany(
        {
          objectName: "outsource_interview_request",
          objectId: roundId,
          recipientId: { $in: successfulEmails.map(r => r.interviewerId) },
        },
        { status: "Success" }
      );
    }

    if (failedEmails.length > 0) {
      await Notification.updateMany(
        {
          objectName: "outsource_interview_request",
          objectId: roundId,
          recipientId: { $in: failedEmails.map(r => r.interviewerId) },
        },
        { status: "Failed" }
      );
    }

    const result = {
      success: true,
      message: "Outsource interview request emails processed",
      data: {
        totalInterviewers: interviewers.length,
        successfulEmails: successfulEmails.length,
        failedEmails: failedEmails.length,
        roundId,
        successfulEmailsList: successfulEmails.map(r => ({ email: r.email, interviewerId: r.interviewerId })),
        failedEmailsList: failedEmails.map(r => ({ email: r.email, interviewerId: r.interviewerId, error: r.error })),
      }
    };

    if (res) return res.status(200).json(result);
    return result;

  } catch (error) {
    console.error("Error sending outsource interview request emails:", error);
    const errorResult = {
      success: false,
      message: "Failed to send outsource interview request emails",
      error: error.message,
    };
    if (res) return res.status(500).json(errorResult);
    return errorResult;
  }
};

function errorResponse(res, status, message) {
  const err = { success: false, message };
  return res ? res.status(status).json(err) : err;
}
//this helps us to send email when round cancelled with round status is scheduled.-Ashraf
exports.sendInterviewRoundCancellationEmails = async (req, res = null) => {
  try {
    const { interviewId, roundId, sendEmails = true, type } = req.body;
    console.log("sendInterviewRoundCancellationEmails");


    const companyName = process.env.COMPANY_NAME || "UpInterview";
    const supportEmail = process.env.SUPPORT_EMAIL || "support@upinterview.com";

    // Validation
    if (!interviewId || !mongoose.isValidObjectId(interviewId)) {
      return sendError(res, 400, "Invalid or missing interview ID");
    }
    if (!roundId || !mongoose.isValidObjectId(roundId)) {
      return sendError(res, 400, "Invalid or missing round ID");
    }

    // Load interview with position populated
    let interview = type === "mockinterview"
      ? await MockInterview.findById(interviewId)
      : await Interview.findById(interviewId)
        .populate("candidateId", "FirstName LastName Email")
        .populate("ownerId", "firstName lastName")
        .populate("positionId", "title");

    if (!interview) return errorResponse(res, 404, "Interview not found");

    // Candidate
    let candidate = type === "mockinterview"
      ? await Contacts.findOne({ ownerId: interview.ownerId })
      : interview.candidateId;

    if (!candidate) return errorResponse(res, 404, "Candidate not found");

    const candidateName = type === "mockinterview"
      ? [candidate.firstName, candidate.lastName].filter(Boolean).join(" ") || "Candidate"
      : [candidate.FirstName, candidate.LastName].filter(Boolean).join(" ") || "Candidate";

    const candidateEmail =
      type === "mockinterview" ? candidate.email : candidate.Email;

    // Fetch data
    // const interview = await Interview.findById(interviewId)
    //   .populate("candidateId")
    //   .populate("ownerId")
    //   .populate("positionId", "title");
    // if (!interview) return sendError(res, 404, "Interview not found");

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

    // const candidate = interview.candidateId;
    // if (!candidate || !candidate.Email) {
    //   return sendError(res, 400, "Candidate or email not found");
    // }

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
    // const dateTime = round.dateTime || "To be scheduled";
    const startDateTime = round.dateTime
      ? formatStartDateTime(round.dateTime)
      : "To be scheduled";
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
        dateTime: startDateTime,
        duration,
        supportEmail,
        position,
        address: interviewMode === "Face to Face" && address ? address : null,
      };

      return compileEmailTemplate(cancelTemplate.body, templateData);
    };

    // Send to Candidate
    // const candidateName =
    //   [candidate.FirstName, candidate.LastName].filter(Boolean).join(" ") ||
    //   "Candidate";
    const candidateBody = generateBody(candidateName);

    emailPromises.push(
      sendEmail(candidateEmail, subject, candidateBody)
        .then(() => ({
          email: candidateEmail,
          recipient: "candidate",
          success: true,
        }))
        .catch((err) => ({
          email: candidateEmail,
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
    if (schedulerEmail && type !== "mockinterview") {
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


//if scheduled round modifies interviewer then emails trigger

exports.sendInterviewerCancelledEmails = async (req, res = null) => {
  // console.log("sendInterviewerCancelledEmails called:", req.body);

  try {
    const {
      interviewId,
      roundId,
      cancelledInterviewerId,
      type,
      interviewerType, // "Internal" | "External"
    } = req.body;
    console.log("sendInterviewerCancelledEmails");

    /* ================= VALIDATION ================= */
    if (!mongoose.isValidObjectId(interviewId))
      return returnError("Invalid interview ID");
    if (!mongoose.isValidObjectId(roundId))
      return returnError("Invalid round ID");
    if (!mongoose.isValidObjectId(cancelledInterviewerId))
      return returnError("Invalid cancelled interviewer ID");
    if (!["Internal", "External"].includes(interviewerType))
      return returnError("Invalid interviewerType");

    /* ================= FETCH INTERVIEW ================= */
    const interview =
      type === "mockinterview"
        ? await MockInterview.findById(interviewId)
        : await Interview.findById(interviewId)
          .populate("candidateId", "FirstName LastName Email")
          .populate("ownerId")
          .populate("positionId", "title");

    if (!interview) return returnError("Interview not found");

    /* ================= CANDIDATE ================= */
    const candidate =
      type === "mockinterview"
        ? await Contacts.findOne({ ownerId: interview.ownerId })
        : interview.candidateId;

    if (!candidate) return returnError("Candidate not found");

    const candidateName =
      type === "mockinterview"
        ? [candidate.firstName, candidate.lastName].filter(Boolean).join(" ")
        : [candidate.FirstName, candidate.LastName].filter(Boolean).join(" ");

    const candidateEmail =
      type === "mockinterview" ? candidate.email : candidate.Email;

    /* ================= SCHEDULER ================= */
    let schedulerName = "Scheduler";
    let schedulerEmail = null;

    if (interview.ownerId) {
      const scheduler = await Contacts.findOne({ ownerId: interview.ownerId });
      schedulerEmail = scheduler?.email;
      schedulerName =
        [scheduler?.firstName, scheduler?.lastName].filter(Boolean).join(" ") ||
        schedulerName;
    }

    /* ================= TENANT / COMPANY ================= */
    const tenant = await Tenant.findById(interview.tenantId);
    const companyName = process.env.COMPANY_NAME || "UpInterview";

    const orgCompanyName =
      tenant?.type !== "individual" && tenant?.company?.trim()
        ? tenant.company.trim()
        : null;

    const supportEmail =
      process.env.SUPPORT_EMAIL || "support@upinterview.com";

    /* ================= ROUND ================= */
    const round =
      type === "mockinterview"
        ? await MockInterviewRound.findById(roundId)
        : await InterviewRounds.findById(roundId);

    if (!round) return returnError("Round not found");

    const roundTitle = round.roundTitle || "Interview Round";
    // const dateTime = round.dateTime || "To be rescheduled";
    const startDateTime = round.dateTime
      ? formatStartDateTime(round.dateTime)
      : "To be scheduled";
    const duration = round.duration || "60 minutes";
    const interviewMode = round.interviewMode || "Online";
    const position = interview.positionId?.title || "Not specified";

    /* ================= INTERVIEWER ================= */
    const cancelledInterviewer = await Contacts.findById(cancelledInterviewerId);
    if (!cancelledInterviewer?.email)
      return returnError("Cancelled interviewer not found or no email");

    const cancelledInterviewerName =
      [cancelledInterviewer.firstName, cancelledInterviewer.lastName]
        .filter(Boolean)
        .join(" ") || "Interviewer";

    /* ================= TEMPLATE CATEGORY ================= */
    const interviewerTemplateCategory =
      interviewerType === "Internal"
        ? "internal_interviewer_cancelled_interviewer"
        : "outsource_interviewer_cancelled_interviewer";

    const templates = {
      interviewer: await getTemplate(interviewerTemplateCategory),
      candidate: await getTemplate("interviewer_cancelled_candidate"),
      scheduler: await getTemplate("interviewer_cancelled_scheduler"),
    };

    if (!templates.interviewer || !templates.candidate || !templates.scheduler)
      return returnError("Required email template missing");

    /* ================= COMMON DATA ================= */
    const templateData = {
      interviewerName: cancelledInterviewerName,
      candidateName,
      schedulerName,
      companyName,
      orgCompanyName,
      roundTitle,
      dateTime: startDateTime,
      duration,
      interviewMode,
      position,
      supportEmail,
    };

    const emailPromises = [];
    const notifications = [];

    /* ================= INTERVIEWER EMAIL ================= */
    sendRenderedEmail(
      templates.interviewer,
      cancelledInterviewer.email,
      templateData,
      "interviewer"
    );

    /* ================= CANDIDATE EMAIL ================= */
    if (candidateEmail) {
      sendRenderedEmail(
        templates.candidate,
        candidateEmail,
        templateData,
        "candidate"
      );
    }

    /* ================= SCHEDULER EMAIL ================= */
    if (schedulerEmail && type !== "mockinterview") {
      sendRenderedEmail(
        templates.scheduler,
        schedulerEmail,
        templateData,
        "scheduler"
      );
    }

    /* ================= SAVE & SEND ================= */
    if (notifications.length) await Notification.insertMany(notifications);

    const results = await Promise.all(emailPromises);

    await Notification.updateMany(
      { objectId: roundId },
      { status: "Success" }
    );

    const response = {
      success: true,
      message: "Interviewer cancellation emails sent successfully",
      data: {
        emailsSent: results.length,
      },
    };

    if (res) return res.status(200).json(response);
    return response;

    /* ================= HELPERS ================= */

    function sendRenderedEmail(template, to, data, recipientType) {
      const subject = render(template.subject, data);
      const body = render(template.body, data);

      emailPromises.push(sendEmail(to, subject, body));

      notifications.push(
        createNotification(subject, body, to, interview, roundId)
      );
    }
  } catch (error) {
    console.error("sendInterviewerCancelledEmails error:", error);
    return returnError("Failed to send cancellation emails", error);
  }

  /* ================= GLOBAL HELPERS ================= */

  function render(template, data) {
    return Handlebars.compile(template)(data);
  }

  async function getTemplate(category) {
    return emailTemplateModel.findOne({
      category,
      isSystemTemplate: true,
      isActive: true,
    });
  }

  function createNotification(title, body, email, interview, roundId) {
    return {
      title,
      body,
      notificationType: "email",
      object: { objectName: "interviewer_cancelled", objectId: roundId },
      status: "Pending",
      tenantId: interview.tenantId,
      ownerId: interview.ownerId,
      recipientId: email,
      createdBy: interview.ownerId,
      updatedBy: interview.ownerId,
    };
  }

  function returnError(message, error = null) {
    const err = { success: false, message };
    if (error) err.error = error.message;
    if (res) res.status(400).json(err);
    return err;
  }
};
