// utils/assessmentEmailSender.js

const Tenant = require("../models/Tenant");
const emailTemplateModel = require("../models/EmailTemplatemodel");
const sendEmail = require("./sendEmail");


/**
 * Sends assessment invitation/resend emails for an array of CandidateAssessment documents
 * (must be populated with candidateId)
 *
 * @param {Object} options
 * @param {Array} options.candidateAssessments - Populated CandidateAssessment docs
 * @param {Object} options.assessment - Full Assessment document
 * @param {String} options.organizationId - Tenant/Organization ID
 * @param {String} options.companyName - Fallback company name
 * @param {String} options.supportEmail - Support email
 * @returns {Object} { results, successCount, failureCount }
 */
const sendAssessmentInvitationEmails = async ({
  candidateAssessments,
  assessment,
  organizationId,
  companyName = process.env.COMPANY_NAME,
  supportEmail = process.env.SUPPORT_EMAIL,
}) => {
  if (candidateAssessments.length === 0) {
    return { results: [], successCount: 0, failureCount: 0 };
  }

  // Fetch tenant for org name and template category
  const tenant = await Tenant.findById(organizationId);
  const orgCompanyName = tenant?.company || companyName;

  const templateCategory =
    tenant?.type === "individual"
      ? "assessment_invite_individual"
      : "assessment_invite";

  const emailTemplate = await emailTemplateModel.findOne({
    category: templateCategory,
    isSystemTemplate: true,
    isActive: true,
  });

  if (!emailTemplate) {
    throw new Error("Email template not found");
  }

  const assessmentDuration = assessment.assessmentDuration || 60;
  const results = [];
  let successCount = 0;
  let failureCount = 0;

  for (const ca of candidateAssessments) {
    try {
      const candidate = ca.candidateId;
      if (!candidate) {
        results.push({
          candidateAssessmentId: ca._id,
          success: false,
          message: "Candidate not found",
        });
        failureCount++;
        continue;
      }

      // Collect all possible emails
      const emails = []
        .concat(candidate.emails || [])
        .concat(candidate.Email ? [candidate.Email] : [])
        .filter(Boolean);

      if (emails.length === 0) {
        results.push({
          candidateAssessmentId: ca._id,
          success: false,
          message: "No valid email address for candidate",
        });
        failureCount++;
        continue;
      }

      if (!ca.assessmentLink) {
        results.push({
          candidateAssessmentId: ca._id,
          success: false,
          message: "No assessment link available",
        });
        failureCount++;
        continue;
      }

      if (!ca.isActive) {
        results.push({
          candidateAssessmentId: ca._id,
          success: false,
          message: "Candidate assessment is not active",
        });
        failureCount++;
        continue;
      }

      const candidateName =
        [candidate.FirstName, candidate.LastName].filter(Boolean).join(" ") ||
        "Candidate";

      const formattedExpiryDate = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        // second: "2-digit",    // ← optional, include only if you want seconds
        hour12: false,
      }).format(ca.expiryAt);

      // Clean body once
      const cleanedBody = emailTemplate.body.replace(/[\n\r]/g, "");

      const emailSubject = emailTemplate.subject.replace(
        /{{orgCompanyName}}/g,
        orgCompanyName
      );

      const emailBody = cleanedBody
        .replace(/{{candidateName}}/g, candidateName)
        .replace(/{{companyName}}/g, companyName)
        .replace(/{{orgCompanyName}}/g, orgCompanyName)
        .replace(/{{expiryDate}}/g, formattedExpiryDate)
        .replace(/{{assessmentLink}}/g, ca.assessmentLink)
        .replace(/{{assessmentDuration}}/g, assessmentDuration)
        .replace(/{{supportEmail}}/g, supportEmail)
        .replace(/{{title}}/g, assessment.AssessmentTitle || assessment.title);

      // Send to all emails
      const sendResponses = await Promise.all(
        emails.map((email) => sendEmail(email, emailSubject, emailBody))
      );

      const allSuccess = sendResponses.every((res) => res.success);

      if (allSuccess) successCount++;
      else failureCount++;

      // Log failures
      sendResponses.forEach((res, idx) => {
        if (!res.success) {
          console.error(`Email failed to ${emails[idx]}: ${res.message}`);
        }
      });

      results.push({
        candidateAssessmentId: ca._id,
        candidateName,
        emails,
        success: allSuccess,
        message: allSuccess
          ? "Assessment link sent successfully"
          : "Failed to send email",
      });
    } catch (err) {
      console.error(`Error processing candidate assessment ${ca._id}:`, err);
      results.push({
        candidateAssessmentId: ca._id,
        success: false,
        message: "Internal error during email send",
      });
      failureCount++;
    }
  }

  return { results, successCount, failureCount };
};

module.exports = {
  sendAssessmentInvitationEmails,
};