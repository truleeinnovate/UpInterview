const mongoose = require("mongoose");
const { InterviewRounds } = require("../models/Interview/InterviewRounds");
const { Interview } = require("../models/Interview/Interview.js");
const InterviewRequest = require("../models/InterviewRequest.js");
const { createRequest } = require("./InterviewRequestController.js");
const { Candidate } = require("../models/candidate.js");
const {
  shareAssessment,
} = require("./EmailsController/assessmentEmailController.js");
const {
  sendOutsourceInterviewRequestEmails,
  sendInterviewRoundCancellationEmails,
  sendInterviewRoundEmails,
} = require("./EmailsController/interviewEmailController.js");



//-------------------------------------------Helper functions-------------------------------------------


async function handleInterviewQuestions(interviewId, roundId, questions) {
  // Add null check for questions parameter
  if (!questions || !Array.isArray(questions)) {
    return;
  }

  const existingQuestions = await interviewQuestions.find({
    interviewId,
    roundId,
  });
  const existingQuestionIds = existingQuestions.map((q) => q._id.toString());
  const newQuestionIds = questions.map((q) => q._id).filter((id) => id);

  const questionsToDelete = existingQuestionIds.filter(
    (id) => !newQuestionIds.includes(id)
  );
  if (questionsToDelete.length > 0) {
    await interviewQuestions.deleteMany({ _id: { $in: questionsToDelete } });
  }

  for (const q of questions) {
    if (q._id) {
      await interviewQuestions.findByIdAndUpdate(q._id, q, { new: true });
    } else {
      await interviewQuestions.create({
        interviewId,
        roundId,
        order: q.order,
        customizations: q.customizations,
        mandatory: q.mandatory,
        tenantId: q.tenantId,
        ownerId: q.ownerId,
        questionId: q.questionId,
        source: q.source,
        snapshot: q.snapshot,
        addedBy: q.addedBy,
      });
    }
  }
}

//this will help to create request for internal or external.if internl default it make accepted.dont send outsource emails to internal.
async function handleInterviewerRequestFlow({
  interviewId,
  round,
  selectedInterviewers,
  cancelOldRequests = false,
}) {
  const interview = await Interview.findById(interviewId).lean();
  if (!interview) return;

  // 1️⃣ Cancel old requests (PATCH only)
  if (cancelOldRequests) {
    await InterviewRequest.updateMany(
      { roundId: round._id, status: "inprogress" },
      { status: "withdrawn", respondedAt: new Date() }
    );
  }

  const resolveInterviewerId = (interviewer) =>
    interviewer?.contact?._id || interviewer?._id;

  // 2️⃣ Create requests (Internal + External)
  for (const interviewer of selectedInterviewers) {

    const interviewerId = resolveInterviewerId(interviewer);

    if (!mongoose.Types.ObjectId.isValid(interviewerId)) {
      console.error("Invalid interviewerId", interviewer);
      continue;
    }
    await createRequest(
      {
        body: {
          tenantId: interview.tenantId,
          ownerId: interview.ownerId,
          scheduledInterviewId: interview._id,
          interviewerType: round.interviewerType, // 🔥 SOURCE OF TRUTH
          interviewerId,
          dateTime: round.dateTime,
          duration: round.duration,
          candidateId: interview.candidateId,
          positionId: interview.positionId,
          roundId: round._id,
          expiryDateTime: round.expiryDateTime,
          isMockInterview: false,
        },
      },
      { status: () => ({ json: () => { } }), locals: {} }
    );
  }

  // 3️⃣ Send outsource emails (External ONLY)
  if (round.interviewerType === "External") {
    await sendOutsourceInterviewRequestEmails(
      {
        body: {
          interviewId: interview._id,
          roundId: round._id,
          interviewerIds: selectedInterviewers,
          type: "interview",
        },
      },
      { status: () => ({ json: () => { } }), locals: {} }
    );
    console.log("Outsource interview request emails sent successfully", selectedInterviewers);
  }
}

//this will help to send emails when round select internal interviewers then it will send email to scheduler,interviewers,candidate.
async function handleInternalRoundEmails({
  interviewId,
  roundId,
  round,
  selectedInterviewers,
  isEdit = false, // PATCH → true
}) {
  // 🔒 Only Internal rounds
  if (round.interviewerType !== "Internal") return;

  // 🔒 Must have selected interviewers
  if (!Array.isArray(selectedInterviewers) || selectedInterviewers.length === 0)
    return;

  // 🧪 PATCH dummy condition (replace later with diff check)
  if (isEdit) {
    const dummyInterviewerChanged = true; // TODO: replace later
    if (!dummyInterviewerChanged) return;
  }

  await sendInterviewRoundEmails(
    {
      body: {
        interviewId,
        roundId,
        sendEmails: true,
      },
    },
    {
      status: () => ({ json: () => { } }),
      locals: {},
    }
  );
}

function detectRoundChanges({
  existingRound,
  incomingRound,
  selectedInterviewers,
}) {
  const changes = {
    statusChanged: false,
    dateTimeChanged: false,
    interviewersChanged: false,
    anyChange: false,
  };

  // Status change
  if (incomingRound.status && incomingRound.status !== existingRound.status) {
    changes.statusChanged = true;
    changes.anyChange = true;
  }

  // DateTime change
  if (
    incomingRound.dateTime &&
    new Date(incomingRound.dateTime).getTime() !==
    new Date(existingRound.dateTime).getTime()
  ) {
    changes.dateTimeChanged = true;
    changes.anyChange = true;
  }

  // Interviewers change
  const oldIds = (existingRound.interviewers || [])
    .map((i) => String(i.contact?._id || i._id))
    .sort();

  const newIds = (selectedInterviewers || [])
    .map((i) => String(i.contact?._id || i._id))
    .sort();

  if (JSON.stringify(oldIds) !== JSON.stringify(newIds)) {
    changes.interviewersChanged = true;
    changes.anyChange = true;
  }

  return changes;
}

async function processInterviewers(interviewers) {
  if (!Array.isArray(interviewers)) {
    return [];
  }

  const processedInterviewers = [];
  for (const interviewer of interviewers) {
    try {
      if (
        mongoose.Types.ObjectId.isValid(interviewer) &&
        !Array.isArray(interviewer)
      ) {
        processedInterviewers.push(interviewer);
        continue;
      }
      if (interviewer.email) {
        let contact = await Contacts.findOne({ email: interviewer.email });
        if (!contact) {
          contact = new Contacts({
            firstName: interviewer.name?.split(" ")[0] || "Unknown",
            lastName: interviewer.name?.split(" ").slice(1).join(" ") || "User",
            email: interviewer.email,
            phone: interviewer.phone || "",
            technology: interviewer.technology ? [interviewer.technology] : [],
            contactType: "Interviewer",
            createdDate: new Date(),
          });
          await contact.save();
        }
        if (contact._id) {
          processedInterviewers.push(contact._id);
        }
      }
    } catch (error) {
      console.error("Error processing interviewer:", error);
    }
  }
  return processedInterviewers;
}


//--------------------------------------- Main controllers -------------------------------------------


// post call for interview round creation
const saveInterviewRound = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Save Interview Round";

  try {
    const { interviewId, round, roundId, questions } = req.body;

    //  // Validate the request data
    //  const validationResult = validateInterviewRound(req.body, !!roundId);

    //  if (validationResult.error) {
    //    return res.status(400).json({
    //      message: "Validation failed",
    //      errors: validationResult.error
    //    });
    //  }

    // Initialize emailResult variable
    let emailResult = { success: false, message: "No email sending attempted" };

    if (!interviewId || !round) {
      return res
        .status(400)
        .json({ message: "Interview ID and round data are required." });
    }

    if (round.interviewers) {
      round.interviewers = await processInterviewers(round.interviewers);
    }

    let savedRound;

    let totalRounds = await InterviewRounds.countDocuments({ interviewId });
    let newSequence = round.sequence || totalRounds + 1;

    await InterviewRounds.updateMany(
      { interviewId, sequence: { $gte: newSequence } },
      { $inc: { sequence: 1 } }
    );

    // Handle meetLink field separately for new rounds too
    const { meetPlatform, meetLink, ...otherRoundData } = round;
    const newInterviewRound = new InterviewRounds({
      interviewId,
      ...otherRoundData,
      sequence: newSequence,
    });

    // Set meetLink directly if it exists
    if (meetLink && Array.isArray(meetLink)) {
      newInterviewRound.meetLink = meetLink;
      newInterviewRound.meetPlatform = meetPlatform;
    }

    // For new rounds there is no previous status; if caller sets a status
    // like "Scheduled" we still want to emit the webhook once it is saved.
    const oldStatusForWebhook = undefined;
    savedRound = await newInterviewRound.save();



    const interview = await Interview.findById(interviewId).lean();
    console.log("interview", interview);

    const candidate = await Candidate.findById(interview.candidateId).lean();

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found for assessment sharing",
        status: "error",
      });
    }

    // ================= HISTORY (CREATE FLOW) =================
    const historyUpdate = buildSmartRoundUpdate({
      body: round,
      actingAsUserId: interview?.ownerId,
      isCreate: true,
    });

    if (historyUpdate) {
      await InterviewRounds.findByIdAndUpdate(
        savedRound._id,
        historyUpdate,
        { new: true }
      );
    }


    // =================== start == assessment mails sending functionality == start ========================

    let linkExpiryDays = null;
    if (round?.selectedAssessmentData?.ExpiryDate) {
      const expiryDate = new Date(round.selectedAssessmentData.ExpiryDate);
      const today = new Date();
      const diffTime = expiryDate.getTime() - today.getTime();
      linkExpiryDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    console.log("[ASSESSMENT] Preparing assessment share payload", {
      interviewId,
      roundTitle: savedRound?.roundTitle,
      assessmentId: round?.assessmentId,
      candidateId: interview?.candidateId,
      linkExpiryDays,
      tenantId: interview?.tenantId,
      ownerId: interview?.ownerId,
    });

    if (savedRound.roundTitle === "Assessment") {
      try {
        console.log("[ASSESSMENT] shareAssessment() triggered");

        let assessmentResponse = null;
        let responseStatus = 200;

        const mockRes = {
          status: function (statusCode) {
            responseStatus = statusCode;
            console.log(
              "[ASSESSMENT] shareAssessment response status:",
              statusCode
            );
            return this;
          },
          json: function (data) {
            assessmentResponse = data;
            console.log("[ASSESSMENT] shareAssessment response body:", data);
            return this;
          },
        };

        const payload = {
          assessmentId: round?.assessmentId,
          selectedCandidates: [candidate],
          linkExpiryDays,
          organizationId: interview?.tenantId.toString(),
          userId: interview?.ownerId.toString(),
        };

        console.log("[ASSESSMENT] shareAssessment payload:", payload);

        await shareAssessment({ body: payload }, mockRes);

        console.log("[ASSESSMENT] shareAssessment completed");

        if (responseStatus !== 200 || !assessmentResponse?.success) {
          console.error("[ASSESSMENT] shareAssessment failed", {
            responseStatus,
            assessmentResponse,
          });

          return res.status(404).json({
            message: "Assessment sharing failed",
            details: assessmentResponse?.message || "Unknown error",
            status: "error",
          });
        }

        console.log("[ASSESSMENT] Assessment shared successfully");
      } catch (error) {
        console.error("[ASSESSMENT] Error during shareAssessment execution:", {
          message: error.message,
          stack: error.stack,
        });

        return res.status(404).json({
          message: "Assessment sharing failed",
          details: error.message,
          status: "error",
        });
      }
    }

    //================ end ==   assessment mails sending fuctionality == end =======================

    if (
      interview &&
      savedRound.roundTitle !== "Assessment" &&
      Array.isArray(req.body?.round?.selectedInterviewers) &&
      req.body.round.selectedInterviewers.length > 0
    ) {
      // ================= CREATE INTERVIEW REQUEST for internal or external (BACKEND ONLY) =================
      await handleInterviewerRequestFlow({
        interviewId,
        round: savedRound,
        selectedInterviewers: req.body.round.selectedInterviewers,
        cancelOldRequests: false, // CREATE
      });
      //sending emails for internal interviewers,scheduler,candidate.for external we will send where outsource accept
      if (savedRound.interviewerType === "Internal") {
        await handleInternalRoundEmails({
          interviewId: interview._id,
          roundId: savedRound._id,
          round: savedRound,
          selectedInterviewers: req.body.round.selectedInterviewers,
        });
      }

    }

    // sending outsource interview request emails fuctionality === end === =====================

    // Trigger interview.round.status.updated if status is one of the allowed values
    await triggerInterviewRoundStatusUpdated(savedRound, oldStatusForWebhook);
    await reorderInterviewRounds(interviewId);

    // Create notification for round scheduling
    if (savedRound.dateTime || savedRound.interviewers?.length > 0) {
      try {
        await createInterviewRoundScheduledNotification(savedRound);
      } catch (notificationError) {
        console.error(
          "[INTERVIEW] Error creating round scheduled notification:",
          notificationError
        );
        // Continue execution even if notification fails
      }
    }

    // Only call handleInterviewQuestions if questions is provided
    if (questions && Array.isArray(questions)) {
      try {
        await handleInterviewQuestions(interviewId, savedRound._id, questions);
      } catch (error) {
        console.error("[INTERVIEW] Error handling interview questions:", error);
        // Continue execution even if question handling fails
      }
    } else {
    }

    // Email sending is now handled in the frontend after meeting links are generated
    // This ensures emails contain the proper encrypted meeting links
    emailResult = {
      success: true,
      message:
        "Emails will be sent from frontend after meeting links are generated",
    };

    // Enrich logging context with parent interview identifiers when possible
    let parentInterviewForLog = null;
    try {
      parentInterviewForLog = await Interview.findById(interviewId).select(
        "tenantId ownerId"
      );
    } catch (e) {
      // Ignore enrichment errors for logging
    }
    res.locals.logData = {
      tenantId: parentInterviewForLog?.tenantId?.toString() || "",
      ownerId: parentInterviewForLog?.ownerId?.toString() || "",
      processName: "Save Interview Round",
      requestBody: req.body,
      status: "success",
      message: roundId
        ? "Interview round updated successfully."
        : "Interview round created successfully.",
      responseBody: {
        savedRound,
        emailResult,
      },
    };

    return res.status(200).json({
      message: roundId
        ? "Round updated successfully."
        : "Interview round created successfully.",
      savedRound,
      emailResult,
      status: "ok",
    });

    async function reorderInterviewRounds(interviewId) {
      const rounds = await InterviewRounds.find({ interviewId });
      rounds.sort((a, b) => a.sequence - b.sequence);

      for (let i = 0; i < rounds.length; i++) {
        rounds[i].sequence = i + 1;
        await rounds[i].save();
      }
    }
  } catch (error) {
    console.error("Error saving interview round:", error);

    res.locals.logData = {
      tenantId: "",
      ownerId: "",
      processName: "Save Interview Round",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    return res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

// PATCH call for interview round update
const updateInterviewRound = async (req, res) => {
  const { interviewId, round, questions } = req.body;
  const { actingAsUserId } = res.locals.auth;

  let roundIdParam = req.params.roundId;

  console.log(" req.body", req.body);

  if (!mongoose.Types.ObjectId.isValid(roundIdParam)) {
    return res.status(400).json({ message: "Invalid roundId" });
  }

  const roundId = new mongoose.Types.ObjectId(roundIdParam);

  if (!interviewId || !roundId || !round) {
    return res.status(400).json({
      message: "Interview ID, Round ID, and round data are required.",
    });
  }

  if (round.interviewers) {
    round.interviewers = await processInterviewers(round.interviewers);
  }

  const existingRound = await InterviewRounds.findById(roundId).lean();
  if (!existingRound) {
    return res.status(404).json({ message: "Round not found." });
  }

  const changes = detectRoundChanges({
    existingRound,
    incomingRound: req?.body?.round,
    selectedInterviewers: req?.body?.round?.selectedInterviewers || [],
  });

  if (!changes.anyChange) {
    return res.status(200).json({
      message: "No changes detected. Round not updated.",
      status: "noop",
    });
  }

  let updatePayload = buildSmartRoundUpdate({
    existingRound,
    body: req.body.round,
    actingAsUserId,
    changes,
  });

  // Safe initialization if buildSmartRoundUpdate returned null or no $push
  if (!updatePayload) {
    updatePayload = { $set: {} };
  }
  if (!updatePayload.$push) {
    updatePayload.$push = { history: [] };
  }
  if (!Array.isArray(updatePayload.$push.history)) {
    updatePayload.$push.history = [];
  }

  const isInternal = req.body.round?.interviewerType === "Internal";
  const isOutsource = req.body.round?.interviewerType !== "Internal";

  // === OUTSOURCE RESCHEDULING: Cancel old requests, keep RequestSent ===
  if (
    isOutsource &&
    changes.dateTimeChanged &&
    existingRound.status === "RequestSent"
  ) {
    await InterviewRequest.updateMany(
      { roundId: existingRound._id, status: "inprogress" },
      { status: "withdrawn", respondedAt: new Date() }
    );

    updatePayload.$set.status = "RequestSent";

    // Safely check and add Rescheduled history
    const hasRescheduled = updatePayload.$push.history.some(h => h.action === "Rescheduled");
    if (!hasRescheduled) {
      updatePayload.$push.history.push({
        action: "Rescheduled",
        scheduledAt: req.body.round.dateTime,
        updatedAt: new Date(),
        createdBy: actingAsUserId,
        reasonCode: req.body.round.currentActionReason || "time_changed",
        comment: req.body.round.comments || null,
      });
    }
  }

  // === INTERNAL RESCHEDULING: Correct Scheduled vs Rescheduled ===
  if (
    isInternal &&
    (changes.dateTimeChanged || changes.interviewersChanged)
  ) {
    const hasScheduledOnce = existingRound.history?.some(h => h.action === "Scheduled");
    const correctAction = hasScheduledOnce ? "Rescheduled" : "Scheduled";

    const newEntry = {
      action: correctAction,
      scheduledAt: req.body.round.dateTime,
      updatedAt: new Date(),
      createdBy: actingAsUserId,
      reasonCode: req.body.round.currentActionReason || null,
      comment: req.body.round.comments || null,
    };

    const existingIndex = updatePayload.$push.history.findIndex(h =>
      ["Scheduled", "Rescheduled"].includes(h.action)
    );

    if (existingIndex !== -1) {
      updatePayload.$push.history[existingIndex] = newEntry;
    } else {
      updatePayload.$push.history.push(newEntry);
    }
  }

  const updatedRound = await InterviewRounds.findByIdAndUpdate(
    roundId,
    updatePayload,
    { new: true, runValidators: true }
  );

  // === Only trigger interviewer change flow if interviewers actually changed ===
  if (
    changes.interviewersChanged &&
    req.body?.round?.selectedInterviewers?.length > 0
  ) {
    await handleInterviewerRequestFlow({
      interviewId,
      round: existingRound,
      selectedInterviewers: req.body.round.selectedInterviewers,
      cancelOldRequests: true, // PATCH
    });
    //if internal interviwers change then send mails
    await handleInternalRoundEmails({
      interviewId: interviewId,
      roundId: updatedRound._id,
      round: updatedRound,
      selectedInterviewers: req.body.round.selectedInterviewers,
      isEdit: true, // 🔥 dummy for now
    });


    await InterviewRounds.findByIdAndUpdate(
      roundId,
      { status: "RequestSent" },
      { new: true }
    );
  }


  return res.status(200).json({
    message: "Round updated successfully",
    status: "ok",
    updatedRound,
  });
};
//patch call use to update round status along with actions and reasons
const updateInterviewRoundStatus = async (req, res) => {
  try {
    const { roundId } = req.params;
    const { actingAsUserId } = res.locals.auth;

    console.log("req.body", req.body);

    if (!roundId) {
      return res
        .status(400)
        .json({ success: false, message: "roundId required" });
    }

    const round = await InterviewRounds.findById(roundId);
    if (!round) {
      return res
        .status(404)
        .json({ success: false, message: "Round not found" });
    }

    // Compute changes dynamically
    const changes = {
      statusChanged:
        req.body.status !== undefined && req.body.status !== round.status,
      dateTimeChanged:
        req.body.dateTime !== undefined && req.body.dateTime !== round.dateTime,
      // Add more as needed, e.g., interviewersChanged: !_.isEqual(req.body.interviewers, round.interviewers) // if using lodash for deep compare
    };
    changes.anyChange = Object.values(changes).some(
      (changed) => changed === true
    );

    const updatePayload = buildSmartRoundUpdate({
      existingRound: round,
      body: req.body,
      actingAsUserId,
      changes,
    });

    if (!updatePayload) {
      return res.status(400).json({
        success: false,
        message: "Nothing to update",
      });
    }

    const updatedRound = await InterviewRounds.findByIdAndUpdate(
      roundId,
      updatePayload,
      { new: true, runValidators: true }
    )
      .populate("interviewId", "title candidateName")
      .populate("interviewers", "firstName lastName email");

    // Side effects (emails, notifications)
    if (req.body.status === "Cancelled") {
      await sendInterviewRoundCancellationEmails(
        {
          body: {
            interviewId: updatedRound.interviewId,
            roundId: updatedRound._id,
          },
        },
        { status: () => ({ json: () => { } }), locals: {} }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Interview round updated successfully",
      data: updatedRound,
    });
  } catch (error) {
    console.error("updateInterviewRoundStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// // Helper function to parse dateTime string
// const parseDateTimeString = (dateTimeStr) => {
//   if (!dateTimeStr) return null;

//   try {
//     // Check the format first
//     if (dateTimeStr.includes(" - ")) {
//       // Format: '27-12-2025 06:13 PM - 07:13 PM'
//       // Extract the start date part
//       const startDateTimeStr = dateTimeStr.split(" - ")[0]; // '27-12-2025 06:13 PM'

//       // Parse day-month-year time with AM/PM
//       const [datePart, timePart, meridiem] = startDateTimeStr.split(" ");
//       const [day, month, year] = datePart.split("-").map(Number);

//       let [hours, minutes] = timePart.split(":").map(Number);

//       // Convert to 24-hour format
//       if (meridiem === "PM" && hours < 12) hours += 12;
//       if (meridiem === "AM" && hours === 12) hours = 0;

//       // Create Date object (month is 0-indexed in JavaScript)
//       return new Date(year, month - 1, day, hours, minutes);
//     } else {
//       // Try direct Date parsing for other formats
//       return new Date(dateTimeStr);
//     }
//   } catch (error) {
//     console.error("Error parsing dateTime:", error);
//     return null;
//   }
// };

/**
 * Builds a MongoDB update object for InterviewRounds with smart change detection
 * - Properly appends to history[] (append-only)
 * - Correctly updates currentAction / previousAction / reason fields
 * - Handles status changes, reschedules, interviewer changes, and generic fields
 *
 * @param {Object} params
 * @param {Object} params.existingRound - Current round document from DB
 * @param {Object} params.body - Incoming request body (or round data)
 * @param {String} params.actingAsUserId - User performing the action
 * @param {Object} params.changes - Result from detectRoundChanges()
 * @returns {Object|null} MongoDB update object or null if no changes
 */
function buildSmartRoundUpdate({
  existingRound = null,
  body,
  actingAsUserId,
  changes,
  isCreate = false,
}) {
  const update = {
    $set: {},
    $push: { history: [] },
  };

  /* ------------------------------------
   * Helpers
   * ---------------------------------- */
  const resolveComment = (reasonCode, comment) =>
    reasonCode === "Other" ? comment || null : null;

  const normalizeAction = (status) =>
    status === "RequestSent" ? "Scheduled" : status;

  const extractInterviewers = () =>
    Array.isArray(body.selectedInterviewers)
      ? body.selectedInterviewers.map(
        (i) => i.contact?._id || i._id
      )
      : [];

  const addHistoryEntry = ({
    action,
    scheduledAt,
    reasonCode = null,
    comment = null,
    interviewers = [],
  }) => {
    update.$push.history.push({
      action,
      scheduledAt,
      reasonCode,
      comment: resolveComment(reasonCode, comment),
      interviewers,
      participants: [],
      createdBy: actingAsUserId,
    });
  };

  /* =====================================================
   * CREATE FLOW
   * =================================================== */
  if (isCreate) {
    const status = body.status;
    const action = normalizeAction(status);
    const reasonCode = body.currentActionReason || null;

    update.$set.status = status;
    update.$set.currentAction = action;
    update.$set.previousAction = null;
    update.$set.currentActionReason = reasonCode;
    update.$set.comments = resolveComment(reasonCode, body.comment);

    // History only if dateTime exists (policy-relevant)
    if (body.dateTime) {
      addHistoryEntry({
        action,
        scheduledAt: body.dateTime,
        reasonCode,
        comment: body.comment,
        interviewers: extractInterviewers(),
      });
    }

    return update;
  }

  /* =====================================================
   * UPDATE FLOW (unchanged core logic)
   * =================================================== */

  if (!changes?.anyChange) return null;

  // Generic field updates (except status)
  Object.keys(body).forEach((key) => {
    if (body[key] !== undefined && key !== "status") {
      update.$set[key] = body[key];
    }
  });

  // Status change
  if (changes.statusChanged && body.status) {
    const action = normalizeAction(body.status);
    const reasonCode =
      body.cancellationReason ||
      body.rescheduleReason ||
      body.currentActionReason ||
      null;

    update.$set.previousAction = existingRound.currentAction || null;
    update.$set.currentAction = action;
    update.$set.currentActionReason = reasonCode;
    update.$set.status = body.status;
    update.$set.comments = resolveComment(reasonCode, body.comment);

    if (["Scheduled", "Rescheduled", "Cancelled"].includes(action)) {
      addHistoryEntry({
        action,
        scheduledAt: body.dateTime || existingRound.dateTime || null,
        reasonCode,
        comment: body.comment,
        interviewers: extractInterviewers(),
      });
    }
  }

  // DateTime change → Reschedule
  if (changes.dateTimeChanged && existingRound.status === "Scheduled") {
    const reasonCode = body.rescheduleReason || "time_changed";

    update.$set.previousAction = existingRound.currentAction || null;
    update.$set.currentAction = "Rescheduled";
    update.$set.currentActionReason = reasonCode;
    update.$set.comments = resolveComment(reasonCode, body.comment);

    addHistoryEntry({
      action: "Rescheduled",
      scheduledAt: body.dateTime,
      reasonCode,
      comment: body.comment,
      interviewers: extractInterviewers(),
    });
  }

  // Cleanup
  if (update.$push.history.length === 0) delete update.$push;
  if (Object.keys(update.$set).length === 0) delete update.$set;
  if (!update.$set && !update.$push) return null;

  return update;
}

module.exports = {
  saveInterviewRound,
  updateInterviewRound,
  updateInterviewRoundStatus,
  buildSmartRoundUpdate,
  // parseDateTimeString,
};
