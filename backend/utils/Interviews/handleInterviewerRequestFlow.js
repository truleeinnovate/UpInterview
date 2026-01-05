const mongoose = require("mongoose");
const { MockInterview } = require("../../models/Mockinterview/mockinterview");
const { Interview } = require("../../models/Interview/Interview.js");
const InterviewRequest = require("../../models/InterviewRequest.js");
const { generateUniqueId } = require("../../services/uniqueIdGeneratorService");
const { sendOutsourceInterviewRequestEmails } = require("../../controllers/EmailsController/interviewEmailController");
// const { createRequest } = require("../../controllers/InterviewRequestController.js");

async function handleInterviewerRequestFlow({
  interviewId,
  round,
  selectedInterviewers = [],
  isMockInterview = false,
}) {
    console.log("isMockInterview",isMockInterview);
    
  let interview;

  try {
    if (isMockInterview) {
      interview = await MockInterview.findById(interviewId).lean();
    } else {
      interview = await Interview.findById(interviewId).lean();
    }

    if (!interview) {
      console.error("Parent not found:", interviewId);
      return;
    }
  } catch (err) {
    console.error("DB error:", err);
    return;
  }

  // Force External for mock interviews
  const effectiveInterviewerType = isMockInterview ? "External" : round.interviewerType;

  for (const interviewer of selectedInterviewers) {
    // For mock: interviewer._id
    // For real: interviewer.contact._id
    const interviewerId = interviewer._id || interviewer.contact?._id;

    if (!interviewerId || !mongoose.Types.ObjectId.isValid(interviewerId)) {
      console.error("Invalid interviewer ID:", interviewer);
      continue;
    }

    // For mock interviews, contactId = interviewerId (since no separate contact)
    const contactId = isMockInterview ? interviewerId : (interviewer.contactId || interviewer.contact?._id);

    await createRequest({
      body: {
        tenantId: interview.tenantId,
        ownerId: interview.ownerId,
        scheduledInterviewId: isMockInterview ? undefined : interview._id,
        interviewerType: effectiveInterviewerType, // ← FORCE External for mock
        interviewerId,
        contactId, // ← correct for both cases
        dateTime: round.dateTime,
        duration: round.duration,
        candidateId: isMockInterview ? undefined : interview.candidateId,
        positionId: isMockInterview ? undefined : interview.positionId,
        roundId: round._id,
        expiryDateTime: round.expiryDateTime || new Date(Date.now() + 24*60*60*1000),
        isMockInterview,
      }
    }, { status: () => ({ json: () => {} }) });
  }

  // Send emails only for External
  if (effectiveInterviewerType === "External") {
    const interviewerIds = selectedInterviewers
      .map(i => (i._id || i.contact?._id)?.toString())
      .filter(Boolean);

    if (interviewerIds.length > 0) {
      await sendOutsourceInterviewRequestEmails({
        body: {
          interviewId: interview._id,
          roundId: round._id,
          interviewerIds,
          type: isMockInterview ? "mockinterview" : "interview",
        }
      }, { status: () => ({ json: () => {} }) });
      console.log("Emails sent to:", interviewerIds);
    }
  }
}

createRequest = async (req, res) => {
  // Mark that logging will be handled by this controller
//   res.locals.loggedByController = true;
//   res.locals.processName = "Create Interview Request";

  try {
    const {
      tenantId,
      ownerId,
      scheduledInterviewId,
      interviewerType,
      dateTime,
      duration,
      interviewerId,
      candidateId,
      positionId,
      // status,
      roundId,
      requestMessage,
      expiryDateTime,
      isMockInterview,
      contactId,
    } = req.body;
    const isInternal = interviewerType === "Internal";

    // Generate custom request ID using centralized service with tenant ID
    const customRequestId = await generateUniqueId(
      "INT-RQST",
      InterviewRequest,
      "customRequestId",
      tenantId
    );

    const newRequest = new InterviewRequest({
      interviewRequestCode: customRequestId,
      tenantId: new mongoose.Types.ObjectId(tenantId),
      ownerId,
      scheduledInterviewId: isMockInterview
        ? undefined
        : new mongoose.Types.ObjectId(scheduledInterviewId),
      interviewerType,
      contactId: new mongoose.Types.ObjectId(contactId),
      interviewerId: new mongoose.Types.ObjectId(interviewerId), // Save interviewerId instead of an array
      dateTime,
      duration,
      candidateId: isMockInterview
        ? undefined
        : new mongoose.Types.ObjectId(candidateId),
      positionId: isMockInterview
        ? undefined
        : new mongoose.Types.ObjectId(positionId),
      status: isInternal ? "accepted" : "inprogress",
      roundId: new mongoose.Types.ObjectId(roundId),
      requestMessage: isInternal
        ? "Internal interview request"
        : "Outsource interview request",
      expiryDateTime,
      isMockInterview,
    });

    await newRequest.save();

    // Structured internal log for successful interview request creation
    // res.locals.logData = {
    //   tenantId: tenantId || "",
    //   ownerId: ownerId || "",
    //   processName: "Create Interview Request",
    //   requestBody: req.body,
    //   status: "success",
    //   message: "Interview request created successfully",
    //   responseBody: newRequest,
    // };

    res.status(201).json({
      message: "Interview request created successfully",
      data: newRequest,
    });
  } catch (error) {
    console.error("Error creating interview request:", error);
    // Structured internal log for error case
    // res.locals.logData = {
    //   tenantId: req.body?.tenantId || "",
    //   ownerId: req.body?.ownerId || "",
    //   processName: "Create Interview Request",
    //   requestBody: req.body,
    //   status: "error",
    //   message: error.message,
    // };

    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports = { handleInterviewerRequestFlow };