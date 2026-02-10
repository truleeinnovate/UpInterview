const mongoose = require("mongoose");
const { InterviewRounds } = require("../models/Interview/InterviewRounds");
const { Interview } = require("../models/Interview/Interview.js");
const InterviewRequest = require("../models/InterviewRequest.js");
const Wallet = require("../models/WalletTopup");
const { Candidate } = require("../models/candidate.js");
const FeedbackModel = require("../models/feedback.js");
const {
  shareAssessment,
} = require("./EmailsController/assessmentEmailController.js");
const {
  sendOutsourceInterviewRequestEmails,
  sendInterviewRoundCancellationEmails,
  sendInterviewRoundEmails,
  sendInterviewerCancelledEmails,
} = require("./EmailsController/interviewEmailController.js");
const interviewQuestions = require("../models/Interview/selectedInterviewQuestion.js");
const { generateUniqueId } = require("../services/uniqueIdGeneratorService.js");
const {
  triggerWebhook,
  EVENT_TYPES,
} = require("../services/webhookService.js");
const {
  createInterviewRoundScheduledNotification,
} = require("./PushNotificationControllers/pushNotificationInterviewController.js");
const {
  WALLET_BUSINESS_TYPES,
  createWalletTransaction,
  applySelectionTimeWalletHoldForOutsourcedRound,
  processAutoSettlement,
  processWithdrawnRefund,
} = require("../utils/interviewWalletUtil");
//this will create agenda when round schedule based on round date time more than 20 mins interviwer or candidate no joined means it will update no show
const {
  scheduleOrRescheduleNoShow,
} = require("../services/interviews/roundNoShowScheduler");
// const {
// handleInterviewerRequestFlow
// } = require("../utils/Interviews/handleInterviewerRequestFlow.js");
//--------------------------------------- Main controllers -------------------------------------------

// post call for interview round creation
const saveInterviewRound = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Save Interview Round";

  try {
    const { roundId, interviewId, round, questions } = req.body;

    console.log("req.bodyround", round);

    if (!interviewId || !round) {
      return res
        .status(400)
        .json({ message: "Interview ID and round data are required." });
    }

    const hasInterviewers =
      Array.isArray(round?.interviewers) && round.interviewers.length > 0;

    const hasSelectedInterviewers =
      Array.isArray(round?.selectedInterviewers) &&
      round.selectedInterviewers.length > 0;

    const hasAssessment =
      !!round?.assessmentId
    // || !!round?.selectedAssessmentData;

    const shouldValidateParallelScheduling =
      hasInterviewers || hasSelectedInterviewers || hasAssessment;


    // ==================== ADD PARALLEL SCHEDULING VALIDATION HERE ====================
    // Only validate for new rounds (not updates - roundId would be present for updates)
    if (!roundId) {
      const validation = await validateRoundCreationBasedOnParallelScheduling({
        interviewId: interviewId,
        isNewRound: true,
        shouldValidateParallelScheduling: shouldValidateParallelScheduling
      });
      //       interviewId,
      // isNewRound = false,
      // roundId = null,
      // shouldValidateParallelScheduling = false,
      console.log("validation", validation);
      console.log("round?.interviewers.length", round?.interviewers);
      if (
        !validation.isValid
        // &&
        // (round?.interviewers.length > 0 ||
        // round?.selectedInterviewers.length > 0)
      ) {
        return res.status(400).json({
          success: false,
          message: validation.message,
          code: validation.code,
          details: validation.activeRound || validation.latestRoundOutcome,
          timestamp: new Date().toISOString(),
        });
      }
    }
    // ==================== END VALIDATION ====================

    // Process interviewers if present
    if (round.interviewers) {
      round.interviewers = await processInterviewers(round.interviewers);
    }

    // Calculate sequence
    let totalRounds = await InterviewRounds.countDocuments({ interviewId });
    let newSequence = round.sequence || totalRounds + 1;

    await InterviewRounds.updateMany(
      { interviewId, sequence: { $gte: newSequence } },
      { $inc: { sequence: 1 } },
    );
    let generateMeetingLink = false;

    // Extract meetLink/meetPlatform
    const { meetPlatform, meetLink, ...otherRoundData } = round;

    // Fetch interview to get ownerId (needed for history)
    let interview = await Interview.findById(interviewId).lean();
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // ==================== DETERMINE FINAL STATUS ====================
    let finalStatus = "Draft";

    if (round.roundTitle === "Assessment" && round?.assessmentId) {
      finalStatus = "Scheduled";
    } else if (round.interviewerType !== "Internal") {
      // External / Outsource
      if (req.body.round?.selectedInterviewers?.length > 0) {
        finalStatus = "RequestSent";
        // NOTE: Wallet hold for outsourced interviewers will be applied AFTER round is saved
        // See below after savedRound is created
        generateMeetingLink = true;
      }
    } else {
      // Internal
      const hasInterviewers = req.body.round?.selectedInterviewers?.length > 0;
      const hasDateTime = !!round.dateTime;

      if (hasInterviewers && hasDateTime) {
        finalStatus = "Scheduled"; // First scheduling
        generateMeetingLink = true;
        await scheduleOrRescheduleNoShow(round);
      }
    }

    // round?.status = finalStatus;

    // Apply status to the round data
    otherRoundData.status = finalStatus;

    // ==================== CREATE DOCUMENT WITH CORRECT STATUS ====================
    const newInterviewRound = new InterviewRounds({
      interviewId,
      ...otherRoundData,
      sequence: newSequence,
      status: finalStatus, // Ensure it's set directly too
    });

    // Set meeting links if provided
    if (meetLink && Array.isArray(meetLink)) {
      newInterviewRound.meetLink = meetLink;
      newInterviewRound.meetPlatform = meetPlatform;
    }

    const oldStatusForWebhook = undefined;
    // ==================== SAVE THE ROUND ====================
    const savedRound = await newInterviewRound.save();

    // =================== WALLET HOLD FOR OUTSOURCED INTERVIEWERS (NOW THAT savedRound EXISTS) ========================
    if (
      round.interviewerType !== "Internal" &&
      req.body.round?.selectedInterviewers?.length > 0
    ) {
      const walletHoldResponse =
        await applySelectionTimeWalletHoldForOutsourcedRound({
          req,
          res,
          interview,
          round,
          savedRound,
        });

      if (walletHoldResponse) {
        // Helper already sent a response (e.g. error); stop further processing.
        return walletHoldResponse;
      }
    }

    // =================== start == assessment mails sending functionality == start ========================

    const candidate = await Candidate.findById(interview.candidateId).lean();

    if (!candidate && savedRound.roundTitle === "Assessment") {
      return res.status(404).json({
        message: "Candidate not found for assessment sharing",
        status: "error",
      });
    }

    let linkExpiryDays = null;
    if (round?.selectedAssessmentData?.ExpiryDate) {
      const expiryDate = new Date(round.selectedAssessmentData.ExpiryDate);
      const today = new Date();
      const diffTime = expiryDate.getTime() - today.getTime();
      linkExpiryDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    if (savedRound.roundTitle === "Assessment" && round?.assessmentId) {
      try {
        console.log("[ASSESSMENT] shareAssessment() triggered");

        let assessmentResponse = null;
        let responseStatus = 200;

        const mockRes = {
          status: function (statusCode) {
            responseStatus = statusCode;
            console.log(
              "[ASSESSMENT] shareAssessment response status:",
              statusCode,
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

        const scheduledAssessmentId =
          assessmentResponse?.data?.scheduledAssessmentId;

        if (!scheduledAssessmentId) {
          return res.status(500).json({
            message: "Assessment created but scheduleAssessmentId missing",
            status: "error",
          });
        }

        // ✅ Persist in round
        savedRound.scheduleAssessmentId = scheduledAssessmentId;
        await savedRound.save();

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

    // ================= HISTORY (CREATE FLOW) =================

    //history should be update after creation of round
    const historyUpdate = await buildSmartRoundUpdate({
      body: otherRoundData,
      actingAsUserId: interview?.ownerId,
      isCreate: true,
    });

    console.log("historyUpdate", historyUpdate);

    // if (historyUpdate) {
    //   await InterviewRounds.findByIdAndUpdate(savedRound._id, historyUpdate, {
    //     new: true,
    //   });
    // }

    let updatedRound = savedRound;
    if (historyUpdate) {
      updatedRound = await InterviewRounds.findByIdAndUpdate(
        savedRound._id,
        historyUpdate,
        { new: true },
      );
    }

    console.log("updatedRound InterviewRounds", updatedRound);

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
        selectedInterviewers: req.body.round?.selectedInterviewers,
        isMockInterview: false,
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
          notificationError,
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
      parentInterviewForLog =
        await Interview.findById(interviewId).select("tenantId ownerId");
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
      message: "Interview round created successfully.",
      savedRound,
      emailResult,
      status: "ok",
      generateMeetingLink,
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
  const { actingAsUserId, actingAsTenantId } = res.locals.auth;

  let roundIdParam = req.params.roundId;

  // console.log("req.bodyround", req.body);

  if (!mongoose.Types.ObjectId.isValid(roundIdParam)) {
    return res.status(400).json({ message: "Invalid roundId" });
  }

  const roundId = new mongoose.Types.ObjectId(roundIdParam);

  if (!interviewId || !roundId || !round) {
    return res.status(400).json({
      message: "Interview ID, Round ID, and round data are required.",
    });
  }

  // ==================== ADD PARALLEL SCHEDULING VALIDATION HERE ====================
  // Only validate for new rounds (not updates - roundId would be present for updates)
  if (roundId) {
    const validation = await validateRoundCreationBasedOnParallelScheduling({
      interviewId: interviewId,
      isNewRound: false,
      roundId: roundId,
    });
    //  interviewId: interviewId,
    // isNewRound: true,
    // shouldValidateParallelScheduling: shouldValidateParallelScheduling
    console.log("validation", validation);
    console.log("round?.interviewers.length", round?.interviewers);
    if (
      !validation.isValid
      // &&
      // (round?.interviewers.length > 0 || round?.selectedInterviewers.length > 0)
    ) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        code: validation.code,
        details: validation.activeRound || validation.latestRoundOutcome,
        timestamp: new Date().toISOString(),
      });
    }
  }
  // ==================== END VALIDATION ====================

  if (round.interviewers) {
    round.interviewers = await processInterviewers(round.interviewers);
  }

  const existingRound = await InterviewRounds.findById(roundId).lean();
  if (!existingRound) {
    return res.status(404).json({ message: "Round not found." });
  }

  const updateType = req.body.updateType;
  console.log("updateType", updateType);
  let updatePayload = {
    $set: {},
    $push: { history: [] },
  };

  const incomingRound = round || {};

  // =======================================================
  // ASSESSMENT (DRAFT → SCHEDULED ONLY)
  // =======================================================
  // Fetch interview to get ownerId (needed for history)
  let interview = await Interview.findById(interviewId).lean();
  if (!interview) {
    return res.status(404).json({ message: "Interview not found" });
  }

  const candidate = await Candidate.findById(interview.candidateId).lean();

  if (!candidate) {
    return res.status(404).json({
      message: "Candidate not found for assessment sharing",
      status: "error",
    });
  }

  let linkExpiryDays = null;
  if (round?.selectedAssessmentData?.ExpiryDate) {
    const expiryDate = new Date(round.selectedAssessmentData.ExpiryDate);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    linkExpiryDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  console.log(
    "[ASSESSMENT] linkExpiryDays",
    existingRound.scheduleAssessmentId,
  );
  console.log("[ASSESSMENT] existingRound", existingRound.roundTitle);
  console.log("[ASSESSMENT] req.body.round", req.body.round);
  if (
    incomingRound.roundTitle === "Assessment" &&
    !existingRound.scheduleAssessmentId &&
    incomingRound?.assessmentId
    //  &&
    // updateType === "AssessmentChange"
  ) {
    console.log("[ASSESSMENT] Auto scheduling assessment");

    const interview = await Interview.findById(interviewId).lean();
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const candidate = await Candidate.findById(interview.candidateId).lean();
    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found for assessment",
      });
    }

    let assessmentResponse = null;
    let responseStatus = 200;

    const mockRes = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(data) {
        assessmentResponse = data;
        return this;
      },
    };

    const payload = {
      assessmentId: incomingRound?.assessmentId,
      selectedCandidates: [candidate],
      organizationId: actingAsTenantId,
      userId: actingAsUserId,
    };

    await shareAssessment({ body: payload }, mockRes);

    if (responseStatus !== 200 || !assessmentResponse?.success) {
      return res.status(400).json({
        message: "Assessment scheduling failed",
        status: "error",
      });
    }

    console.log(
      "[ASSESSMENT] Assessment scheduled successfully",
      assessmentResponse,
    );

    updatePayload.$set.scheduleAssessmentId =
      assessmentResponse.data?.scheduledAssessmentId;
    updatePayload.$set.assessmentId = req.body.round?.assessmentId;
    // updatePayload.$set.status = req.body.round?.status;
    updatePayload.$set.dateTime = req.body.round?.dateTime;
    updatePayload.$set.instructions = req.body.round?.instructions;
    updatePayload.$set.sequence = req.body.round?.sequence;

    console.log(
      "[ASSESSMENT] Scheduled assessment created:",
      updatePayload.$set.scheduleAssessmentId,
    );
  }

  if (updateType === "FULL_UPDATE") {
    // For full updates, set all provided fields
    Object.keys(round).forEach((key) => {
      updatePayload.$set[key] = round[key];
    });
  }

  console.log("incomingRound", incomingRound);

  //after round create in post meeting id will update using this if condtion
  if (
    (incomingRound.meetingId || incomingRound.meetPlatform) &&
    updateType === "MEETING_UPDATE"
  ) {
    const updateOps = { $set: {} };

    if (incomingRound.meetingId)
      updateOps.$set.meetingId = incomingRound.meetingId;
    if (incomingRound.meetPlatform)
      updateOps.$set.meetPlatform = incomingRound.meetPlatform;

    const updatedRound = await InterviewRounds.findByIdAndUpdate(
      roundId,
      updateOps,
      { new: true },
    );

    return res.status(200).json({
      message: "Meeting link saved",
      status: "ok",
      updatedRound,
    });
  }

  // === NEW: EARLY SAFE UPDATE PATH ===
  // Safe path only if:
  // - No dangerous fields (interviewers, dateTime, status, etc.)
  // - And at least one safe change (instructions, sequence, or questions)

  const incomingKeys = Object.keys(incomingRound);
  const hasOnlySafeChanges =
    incomingKeys.length > 0 &&
    incomingKeys.every((key) => ["instructions", "sequence"].includes(key));

  const hasOnlyQuestionsChange = incomingKeys.length === 0;
  // && hasQuestionsUpdate;

  if (
    (hasOnlySafeChanges || hasOnlyQuestionsChange) &&
    updateType === "SAFE_UPDATE"
  ) {
    console.log("Safe update: only instructions, sequence, or questions");

    const updateOps = { $set: {}, $push: { history: [] } };

    if (
      incomingRound.instructions !== undefined &&
      incomingRound.instructions !== existingRound.instructions
    ) {
      updateOps.$set.instructions = incomingRound.instructions;
      updateOps.$push.history.push({
        action: "Updated",
        field: "instructions",
        updatedAt: new Date(),
        createdBy: actingAsUserId,
      });
    }

    if (
      incomingRound.sequence !== undefined &&
      incomingRound.sequence !== existingRound.sequence
    ) {
      updateOps.$set.sequence = incomingRound.sequence;
      updateOps.$push.history.push({
        action: "Updated",
        field: "sequence",
        updatedAt: new Date(),
        createdBy: actingAsUserId,
      });
    }

    // Handle questions update
    // if (hasQuestionsUpdate) {
    await handleInterviewQuestions(interviewId, roundId, questions);
    // }

    // Apply round field updates if any
    if (Object.keys(updateOps.$set).length > 0) {
      const updatedRound = await InterviewRounds.findByIdAndUpdate(
        roundId,
        updateOps,
        { new: true },
      );

      return res.status(200).json({
        message: "Round updated (instructions/sequence only)",
        status: "ok",
        updatedRound,
      });
    }

    // If only questions were updated
    return res.status(200).json({
      message: "Questions updated successfully",
      status: "ok",
    });
  }

  const hasAccepted = await InterviewRequest.exists({
    roundId: existingRound._id,
    status: "accepted",
  });

  const changes = await detectRoundChanges({
    existingRound,
    incomingRound: {
      ...req?.body?.round,
      questions: questions || [],
    },
    selectedInterviewers: req?.body?.round?.selectedInterviewers || [],
  });

  console.log("changesDone", changes);

  if (!changes.anyChange && updateType !== "FULL_UPDATE") {
    return res.status(200).json({
      message: "No changes detected. Round not updated.",
      status: "noop",
    });
  }
  // console.log("existingRound", existingRound);
  let updatedRound = null;

  // console.log("updatedRound", updatedRound);

  // Always save interviewers if sent
  if (req.body.round?.interviewerType) {
    updatePayload.$set.interviewerType = req.body.round.interviewerType;
  }
  if (
    req.body.round?.interviewers &&
    Array.isArray(req.body.round.interviewers)
  ) {
    updatePayload.$set.interviewers = req.body.round.interviewers;
  }

  const isInternal = req.body.round?.interviewerType === "Internal";
  const isOutsource = req.body.round?.interviewerType !== "Internal";

  // ranjith added this for outsource interviwers or internal interviewers
  const hasInterviewers =
    Array.isArray(req.body.round?.interviewers) &&
    req.body.round.interviewers.length > 0;

  //  for outsource interviewers
  const hasselectedInterviewers =
    Array.isArray(req.body.round?.selectedInterviewers) &&
    req.body.round.selectedInterviewers.length > 0;
  const statusAllowsQuestionUpdate = [
    "Draft",
    "RequestSent",
    "Scheduled",
    "Rescheduled",
  ].includes(existingRound.status);

  const interviewersUnchanged = !changes.dateTimeChanged;
  // && !hasselectedInterviewers && !hasInterviewers;

  // console.log("statusAllowsQuestionUpdate", statusAllowsQuestionUpdate);
  // console.log("interviewersUnchanged", interviewersUnchanged);

  // console.log("questionsChanged", changes?.questionsChanged);
  // console.log("instructionsChanged", changes.instructionsChanged);

  // const shouldUpdateQuestionsOrInstructions =
  //   statusAllowsQuestionUpdate &&
  //   // changes?.interviewersChanged &&
  //   (changes.questionsChanged || changes.instructionsChanged);
  // console.log(
  //   "shouldUpdateQuestionsOrInstructions",
  //   shouldUpdateQuestionsOrInstructions
  // );

  // if (shouldUpdateQuestionsOrInstructions) {
  //   console.log("Updating only questions or instructions");

  //   await handleInterviewQuestions(interviewId, roundId, req.body.questions);
  // } else if (changes.instructionsChanged) {
  //   updatePayload.$set.instructions = req.body.round.instructions;

  //   updatedRound = await InterviewRounds.findByIdAndUpdate(
  //     roundId,
  //     updatePayload,
  //     { new: true, runValidators: true }
  //   );
  // } else {
  let shouldcreateRequestFlow = false;
  let generateMeetingLink = false;
  // ==================================================================
  // OUTSOURCE LOGIC (mirroring Internal style)
  // ==================================================================
  if (isOutsource) {
    // 1. Draft → RequestSent (sending new requests)
    if (
      (existingRound.status === "Draft" ||
        existingRound.status === "Cancelled") &&
      hasselectedInterviewers
    ) {
      updatePayload.$set.status = "RequestSent";
      shouldcreateRequestFlow = true;
      generateMeetingLink = true;

      // =================== WALLET HOLD FOR OUTSOURCED INTERVIEWERS (SELECTION TIME) ========================
      // Fetch the interview document for wallet operations
      const interview = await Interview.findById(interviewId).lean();
      if (!interview) {
        return res
          .status(404)
          .json({ message: "Interview not found for wallet hold." });
      }

      // Delegate to helper so this controller stays clean and focused.
      const walletHoldResponse =
        await applySelectionTimeWalletHoldForOutsourcedRound({
          req,
          res,
          interview,
          round: req.body.round,
          savedRound: existingRound,
        });

      if (walletHoldResponse) {
        // Helper already sent a response (e.g. error); stop further processing.
        return walletHoldResponse;
      }
    }

    // 2. RequestSent → Draft (user removing interviewers / cancelling requests)
    else if (
      existingRound.status === "RequestSent" &&
      updateType === "CLEAR_INTERVIEWERS"
      //  &&
      // hasselectedInterviewers
    ) {
      // PROTECT: Check if any request was already accepted

      if (hasAccepted) {
        return res.status(400).json({
          message:
            "Cannot cancel requests: At least one outsource interviewer has already accepted this round.",
          status: "error",
        });
      }

      // Safe to withdraw inprogress requests
      await InterviewRequest.updateMany(
        { roundId: existingRound._id, status: "inprogress" },
        { status: "withdrawn", respondedAt: new Date() },
      );
      // console.log("withdrawnRequests", withdrawnRequests);

      // Refund the selection time hold - full amount + GST (no policy)
      try {
        await processWithdrawnRefund({
          roundId: existingRound._id.toString(),
        });
        console.log(
          "[saveInterviewRound] Selection hold refunded for withdrawn round:",
          existingRound._id,
        );
      } catch (refundError) {
        console.error(
          "[saveInterviewRound] Error refunding selection hold:",
          refundError,
        );
        // Continue - don't block status update
      }

      updatePayload.$set.status = "Draft";
      updatePayload.$set.meetingId = ""; // Clear assigned meetingId
      updatePayload.$set.meetPlatform = ""; // Clear assigned meetPlatform
    }

    // 3. Scheduled → Draft (cancelling after acceptance)
    else if (
      ["Scheduled", "Rescheduled"].includes(existingRound.status) &&
      updateType === "CLEAR_INTERVIEWERS"
      // &&
      // hasselectedInterviewers  // ← cleared (selectedInterviewers empty or not sent)
    ) {
      if (existingRound.status === "InProgress") {
        return res
          .status(400)
          .json({ message: "Cannot reschedule in-progress round" });
      }

      // PROTECT: Check if accepted (should always be true, but safe)

      // Auto reschedule settlement process - pay interviewer based on policy before resetting
      if (hasAccepted) {
        try {
          await processAutoSettlement({
            roundId: existingRound._id.toString(),
            action: "Rescheduled",
          });
          console.log(
            "[saveInterviewRound] Auto-settlement for rescheduled round:",
            existingRound._id,
          );
        } catch (settlementError) {
          console.error(
            "[saveInterviewRound] Auto-settlement error for rescheduled round:",
            settlementError,
          );
          // Continue with reschedule even if settlement fails
        }
      }

      if (hasAccepted) {
        // Cancel the accepted request
        await InterviewRequest.updateMany(
          { roundId: existingRound._id, status: "accepted" },
          { status: "cancelled", respondedAt: new Date() },
        );
      }

      updatePayload.$set.status = "Draft";
      updatePayload.$set.interviewers = []; // Clear assigned interviewer
      updatePayload.$set.meetingId = ""; // Clear assigned meetingId
      updatePayload.$set.meetPlatform = ""; // Clear assigned meetPlatform

      // === SEND CANCELLATION EMAILS ===
      // Only if there was an accepted interviewer (we know who was cancelled)
      if (
        hasAccepted &&
        existingRound.interviewers &&
        existingRound.interviewers.length > 0
      ) {
        const cancelledInterviewerId = existingRound.interviewers[0]; // Assuming one accepted

        try {
          await sendInterviewerCancelledEmails({
            body: {
              interviewId: interviewId,
              roundId: roundId,
              cancelledInterviewerId: cancelledInterviewerId,
              type: "interview",
              interviewerType: "External",
            },
          });
          console.log(
            "Cancellation emails sent for cancelled outsource interviewer",
          );
        } catch (emailError) {
          console.error("Failed to send cancellation emails:", emailError);
          // Do not block the update — just log
        }
      }
    }
  }

  let shouldSendInternalEmail = false;

  // ==================================================================
  // INTERNAL LOGIC
  // ==================================================================
  if (isInternal) {
    const wasScheduledBefore = ["Scheduled", "Rescheduled"].includes(
      existingRound.status,
    );

    const willBeScheduled = hasInterviewers && !!req.body.round.dateTime;

    if (
      existingRound.status === "Draft" ||
      existingRound.status === "Cancelled"
      //  && willBeScheduled
    ) {
      // Decide schedule action based on history
      const hasScheduledOnce = existingRound?.history?.some(
        (h) => h.action === "Scheduled",
      );

      console.log("starting round status:", generateMeetingLink);

      const scheduleAction = hasScheduledOnce ? "Rescheduled" : "Scheduled";

      updatePayload.$set.status = scheduleAction;
      shouldSendInternalEmail = true; // First scheduling → send email
      shouldcreateRequestFlow = true;
      generateMeetingLink = true;
      await scheduleOrRescheduleNoShow(round);
    }
    //  else if (
    //   wasScheduledBefore &&
    //   (changes.dateTimeChanged || changes.interviewersChanged)
    // ) {
    //   updatePayload.$set.status = "Rescheduled";
    //   shouldSendInternalEmail = true; // Rescheduling → send email
    // }
    else if (
      ["Scheduled", "Rescheduled"].includes(existingRound.status) &&
      updateType === "CLEAR_INTERVIEWERS"
      // &&
      // hasInterviewers
    ) {
      // User cleared interviewers → cancel
      updatePayload.$set.status = "Draft";
      updatePayload.$set.interviewers = []; // making accepted interviwers clear
      updatePayload.$set.meetingId = ""; // Clear assigned meetingId
      updatePayload.$set.meetPlatform = ""; // Clear assigned meetPlatform
      await InterviewRequest.updateMany(
        { roundId: existingRound._id, status: "accepted" },
        { status: "cancelled", respondedAt: new Date() },
      );

      // === SEND CANCELLATION EMAILS ===
      // Only if there was an accepted interviewer (we know who was cancelled)
      if (
        hasAccepted &&
        existingRound.interviewers &&
        existingRound.interviewers.length > 0
      ) {
        const cancelledInterviewerId = existingRound.interviewers[0]; // Assuming one accepted

        try {
          await sendInterviewerCancelledEmails({
            body: {
              interviewId: interviewId,
              roundId: roundId,
              cancelledInterviewerId: cancelledInterviewerId,
              type: "interview",
              interviewerType: "Internal",
            },
          });
          console.log(
            "Cancellation emails sent for cancelled outsource interviewer",
          );
        } catch (emailError) {
          console.error("Failed to send cancellation emails:", emailError);
          // Do not block the update — just log
        }
      }
    }

    // Internal rescheduling history entry
    // if (changes.dateTimeChanged || changes.interviewersChanged) {
    //   const hasScheduledOnce = existingRound.history?.some(
    //     (h) => h.action === "Scheduled"
    //   );
    //   const correctAction =
    //     hasScheduledOnce || wasScheduledBefore ? "Rescheduled" : "Scheduled";

    //   const newEntry = {
    //     action: correctAction,
    //     scheduledAt: req.body.round.dateTime || existingRound.dateTime,
    //     updatedAt: new Date(),
    //     createdBy: actingAsUserId,
    //     reasonCode: req.body.round.currentActionReason || "updated",
    //     comment: req.body.round.comments || null,
    //   };

    //   const existingIndex = updatePayload.$push.history.findIndex((h) =>
    //     ["Scheduled", "Rescheduled"].includes(h.action)
    //   );

    //   if (existingIndex !== -1) {
    //     updatePayload.$push.history[existingIndex] = newEntry;
    //   } else {
    //     updatePayload.$push.history.push(newEntry);
    //   }
    // }
  }

  console.log("updatePayload:", updatePayload);

  // === DATE/TIME CHANGE (always save if sent) ===
  if (req.body.round?.dateTime) {
    updatePayload.$set.dateTime = req.body.round.dateTime;
  }

  // === INSTRUCTIONS CHANGE ===
  if (req.body.round?.instructions !== undefined) {
    updatePayload.$set.instructions = req.body.round.instructions;
  }

  // Handle questions update in main flow (safe path already handles it)
  if (
    changes.questionsChanged ||
    (req.body.questions && req.body.questions.length > 0)
  ) {
    await handleInterviewQuestions(interviewId, roundId, req.body.questions);
  }

  let smartUpdate = null;

  if (
    updatePayload.$set.status &&
    updatePayload.$set.status !== existingRound.status
  ) {
    smartUpdate = await buildSmartRoundUpdate({
      existingRound,
      body: {
        selectedInterviewers: req.body.round?.selectedInterviewers || [],
        status: updatePayload.$set.status,
        interviewerType:
          req.body.round?.interviewerType || existingRound.interviewerType,
        dateTime: req.body.round?.dateTime,
      },
      actingAsUserId,
      changes,
    });
  }
  console.log("ending round status:", generateMeetingLink);
  // merging history from both updates interviwers and date time change
  function mergeUpdates(a, b) {
    const out = {};

    if (a?.$set || b?.$set) {
      out.$set = { ...(a?.$set || {}), ...(b?.$set || {}) };
    }

    if (a?.$push?.history || b?.$push?.history) {
      out.$push = {
        history: [...(a?.$push?.history || []), ...(b?.$push?.history || [])],
      };
    }

    return out;
  }
  // -------------------------------
  // 4️⃣ FINAL UPDATE (IMPORTANT)
  // -------------------------------
  // === MERGE HISTORY ===
  let finalUpdate = updatePayload;

  if (smartUpdate?.$push?.history?.length > 0) {
    finalUpdate = {
      $set: updatePayload.$set,
      $push: {
        history: [...updatePayload.$push.history, ...smartUpdate.$push.history],
      },
    };
  }

  console.log("finalUpdate", finalUpdate);

  //     const smartUpdate = buildSmartRoundUpdate({
  //   existingRound,
  //   body: {
  //     ...req.body.round,
  //     status: businessUpdate.$set.status || existingRound.status,
  //     interviewerType: existingRound.interviewerType,
  //   },
  //   actingAsUserId,
  //   changes,
  // });

  // ==================================================================
  // APPLY UPDATE
  // ==================================================================

  updatedRound = await InterviewRounds.findByIdAndUpdate(roundId, finalUpdate, {
    new: true,
    runValidators: true,
  });

  // ==================================================================
  // SEND INTERNAL EMAIL ONLY WHEN STATUS BECOMES Scheduled/Rescheduled
  // ==================================================================
  if (shouldSendInternalEmail && isInternal) {
    console.log("shouldSendInternalEmail", shouldSendInternalEmail);
    console.log("isInternal", isInternal);
    await handleInternalRoundEmails({
      interviewId,
      roundId: updatedRound._id,
      round: updatedRound,
      selectedInterviewers: req.body.round.selectedInterviewers,
      isEdit: true,
    });
  }

  // === Only trigger interviewer change flow if interviewers actually changed ===
  if (
    (hasselectedInterviewers || hasInterviewers) &&
    shouldcreateRequestFlow
    // changes.interviewersChanged &&
    // req.body?.round?.selectedInterviewers?.length > 0
  ) {
    await handleInterviewerRequestFlow({
      interviewId,
      round: existingRound,
      selectedInterviewers: req.body.round?.selectedInterviewers,
      isMockInterview: false,
    });

    // await InterviewRounds.findByIdAndUpdate(
    //   roundId,
    //   { status: "RequestSent" },
    //   { new: true }
    // );
  }

  return res.status(200).json({
    message: "Round updated successfully",
    status: "ok",
    updatedRound,
    generateMeetingLink,
  });
};

//patch call use to update round status along with actions and reasons
// const updateInterviewRoundStatus = async (req, res) => {
//   try {
//     const { roundId } = req.params;
//     const { actingAsUserId } = res.locals.auth;

//     console.log("req.body", req.body);
//     console.log("roundId", roundId);

//     if (!roundId) {
//       return res
//         .status(400)
//         .json({ success: false, message: "roundId required" });
//     }

//     const round = await InterviewRounds.findById(roundId);
//     if (!round) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Round not found" });
//     }

//     // Compute changes dynamically
//     const changes = {
//       statusChanged:
//         req.body.status !== undefined && req.body.status !== round.status,
//       dateTimeChanged:
//         req.body.dateTime !== undefined && req.body.dateTime !== round.dateTime,
//       // Add more as needed, e.g., interviewersChanged: !_.isEqual(req.body.interviewers, round.interviewers) // if using lodash for deep compare
//     };
//     changes.anyChange = Object.values(changes).some(
//       (changed) => changed === true
//     );

//     console.log("changes", changes);

//     const updatePayload = buildSmartRoundUpdate({
//       existingRound: round,
//       body: req.body,
//       actingAsUserId,
//       changes,
//       statusChanged: true,
//     });
//     console.log("updatePayload", updatePayload);

//     if (!updatePayload) {
//       return res.status(400).json({
//         success: false,
//         message: "Nothing to update",
//       });
//     }

//     updatedRound = await InterviewRounds.findByIdAndUpdate(
//       roundId,
//       updatePayload,
//       { new: true, runValidators: true }
//     )
//       .populate("interviewId", "title candidateName")
//       .populate("interviewers", "firstName lastName email");

//     // Side effects (emails, notifications)
//     if (req.body.status === "Cancelled") {
//       await sendInterviewRoundCancellationEmails(
//         {
//           body: {
//             interviewId: updatedRound.interviewId,
//             roundId: updatedRound._id,
//           },
//         },
//         { status: () => ({ json: () => {} }), locals: {} }
//       );
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Interview round updated successfully",
//       data: updatedRound,
//     });
//   } catch (error) {
//     console.error("updateInterviewRoundStatus error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

const updateInterviewRoundStatus = async (req, res) => {
  try {
    const { roundId } = req.params;
    const { actingAsUserId } = res.locals.auth;
    const {
      action,
      reasonCode,
      comment,
      cancellationReason,
      roundOutcome,
      reason,
      // participantCandidateRole,
    } = req.body; // reasonCode = your selected reason, comment = "Other" text, cancellationReason = specific cancellation reason

    const isParticipantUpdate = req.body?.role || req.body?.joined;

    console.log("req.body isParticipantUpdate", req.body);

    if (!roundId || (!action && !isParticipantUpdate)) {
      return res.status(400).json({
        success: false,
        message: "roundId and action are required",
      });
    }
    console.log("isParticipantUpdate", isParticipantUpdate);

    const existingRound = await InterviewRounds.findById(roundId)
      .populate("interviewId", "title candidateName")
      .populate("interviewers", "firstName lastName email");

    if (!existingRound) {
      return res
        .status(404)
        .json({ success: false, message: "Round not found" });
    }

    // ────────────────────────────────────────────────
    // validation when existing status is FeedbackPending and action is Evaluated stop when external
    // ────────────────────────────────────────────────
    if (action === "Evaluated") {
      if (
        existingRound.interviewerType === "External" &&
        existingRound.status === "FeedbackPending"
      ) {
        return res.status(400).json({
          success: false,
          code: "FEEDBACK_REQUIRED_FOR_EXTERNAL",
          message:
            "Please submit feedback before marking this round as Evaluated",
          // Optional: you can send more context if frontend needs it
          // code: "FEEDBACK_REQUIRED_FOR_EXTERNAL"
        });
      }
    }

    let newStatus = null;
    if (!isParticipantUpdate) {
      // Map frontend "action" to actual status
      const actionToStatusMap = {
        // Completed: "Completed",
        // Selected: "Selected",
        // Rejected: "Rejected",
        // NoShow: "NoShow",
        // Cancelled: "Cancelled",

        RequestSent: "RequestSent",
        Scheduled: "Scheduled",
        InProgress: "InProgress",
        Completed: "Completed",
        InCompleted: "InCompleted",
        Rescheduled: "Rescheduled",
        Rejected: "Rejected",
        Selected: "Selected",
        Cancelled: "Cancelled",
        Incomplete: "Incomplete",
        NoShow: "NoShow",
        Evaluated: "Evaluated",
        Skipped: "Skipped",
        FeedbackPending: "FeedbackPending",
        FeedbackSubmitted: "FeedbackSubmitted",
        // FeedbackPending: "FeedbackPending", // Override status to FeedbackPending if feedback is still in draft
      };

      newStatus = actionToStatusMap[action];
      if (!newStatus) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid action" });
      }
    }

    // ===== SAFE PARTICIPANT UPSERT (NO DUPLICATES, NO FAIL) =====
    // ===== SAFE PARTICIPANT UPSERT (NO DUPLICATES, NO FAIL) =====
    if (isParticipantUpdate) {
      const { role, userId, joined } = req.body;

      const status = joined ? "Joined" : "Not_Joined";
      const joinedAt = joined ? new Date() : null;

      const match =
        role === "Candidate" ? { role: "Candidate" } : { role, userId };

      // Update existing participant if exists
      let updatedRound = await InterviewRounds.findOneAndUpdate(
        {
          _id: roundId,
          participants: { $elemMatch: match },
        },
        {
          $set: {
            "participants.$.status": status,
            "participants.$.joinedAt": joinedAt,
          },
        },
        { new: true },
      );

      // If participant doesn't exist, add it
      if (!updatedRound) {
        const participantData = { role, status, joinedAt };
        if (role !== "Candidate") participantData.userId = userId;

        updatedRound = await InterviewRounds.findByIdAndUpdate(
          roundId,
          { $push: { participants: participantData } },
          { new: true },
        );
      }

      // ===== NEW LOGIC: Do NOT create history here for participant-only update =====
      // History will be handled only by buildSmartRoundUpdate if `action` is provided.

      // If no action/status is provided, return after participant update
      if (!action) {
        return res.status(200).json({
          success: true,
          message: "Participant updated successfully",
          data: updatedRound,
        });
      }
    }

    // Check for submitted feedback
    // const feedback = await FeedbackModel.findOne({
    //   interviewRoundId: existingRound._id,
    // });

    // ===== STRICT CHECK: ALL INTERVIEWERS FEEDBACK STATUS = DRAFT =====

    // Interviewer IDs from round
    const interviewerIds = (existingRound.interviewers || []).map((id) => id);

    // Fetch feedbacks only for these interviewers
    // const feedbacks = await FeedbackModel.find({
    //   interviewRoundId: existingRound._id,
    //   interviewerId: { $in: interviewerIds },
    // });
    const feedbacks = await FeedbackModel.find({
      interviewRoundId: existingRound._id,
      interviewerId: { $in: interviewerIds },
    }).select("interviewerId status");

    // Build a map: interviewerId -> status
    // const feedbackStatusMap = new Map(
    //   feedbacks.map((fb) => [fb.interviewerId.toString(), fb.status]),
    // );

    const feedbackStatusMap = new Map(
      feedbacks.map((fb) => [fb.interviewerId.toString(), fb.status]),
    );

    // Check:
    // 1. Every interviewer has a feedback entry
    // 2. Every feedback status is "draft"
    // const allInterviewersDraft =
    //   interviewerIds.length > 0 &&
    //   interviewerIds.every(
    //     (interviewerId) =>
    //       feedbackStatusMap.has(interviewerId) &&
    //       feedbackStatusMap.get(interviewerId) === "draft",
    //   );
    const draftCount = await FeedbackModel.countDocuments({
      interviewRoundId: existingRound._id,
      interviewerId: { $in: interviewerIds },
      status: "draft",
    });

    const allInterviewersDraft = draftCount === interviewerIds.length;

    console.log("interviewerIds", allInterviewersDraft);

    // const feedbackDraft = Array.isArray(feedback)
    //   ? feedback.some((fb) => fb.status === "Draft")
    //   : feedback?.status === "Draft";

    // const feedbackDraft = feedback?.some((fb) => fb.status === "Draft");

    // if (req.body?.role) {
    //   const { role, userId, joined } = req.body;

    //   const status = joined ? "Joined" : "Not_Joined";
    //   const joinedAt = joined ? new Date() : null;

    //   const match =
    //     role === "Candidate" ? { role: "Candidate" } : { role, userId };

    //   let updatedRound = await InterviewRounds.findOneAndUpdate(
    //     {
    //       _id: roundId,
    //       participants: { $elemMatch: match },
    //     },
    //     {
    //       $set: {
    //         "participants.$.status": status,
    //         "participants.$.joinedAt": joinedAt,
    //       },
    //     },
    //     { new: true }
    //   );

    //   if (!updatedRound) {
    //     if (role === "Candidate") {
    //       const exists = await InterviewRounds.exists({
    //         _id: roundId,
    //         "participants.role": "Candidate",
    //       });

    //       updatedRound = exists
    //         ? await InterviewRounds.findById(roundId)
    //         : await InterviewRounds.findByIdAndUpdate(
    //             roundId,
    //             {
    //               $push: {
    //                 participants: {
    //                   role: "Candidate",
    //                   status,
    //                   joinedAt,
    //                 },
    //               },
    //             },
    //             { new: true }
    //           );
    //     } else {
    //       updatedRound = await InterviewRounds.findByIdAndUpdate(
    //         roundId,
    //         {
    //           $push: {
    //             participants: {
    //               role,
    //               userId,
    //               status,
    //               joinedAt,
    //             },
    //           },
    //         },
    //         { new: true }
    //       );
    //     }
    //   }

    //   console.log("updatedRound updatedRound", updatedRound);

    //   return res.status(200).json({
    //     success: true,
    //     message: "Participant updated successfully",
    //     data: updatedRound,
    //   });
    // }

    // Detect changes
    // const changes = {
    //   statusChanged: newStatus !== existingRound.status,
    //   dateTimeChanged: false, // assuming no datetime change in this endpoint
    //   anyChange: true,
    // };

    // ===== HISTORY CREATION LOGIC =====
    // Check if this is a special one-time history case
    // const participants = existingRound.participants || [];
    // const isHistoryHandled = participants.some(
    //   (p) => p.role === "Interviewer" || p.role === "Scheduler"
    // );

    // const isSpecialHistoryCase =
    //   req.body?.History_Type === "Histoy_Handling" &&
    //   !isHistoryHandled &&
    //   action === "InProgress";

    let smartUpdate = null;

    if (req.body?.History_Type === "Histoy_Handling") {
      // Special handling: only create history if conditions are met
      const participants = existingRound.participants || [];

      console.log("participants", participants);
      const isHistoryHandled = participants.some(
        (p) => p.role === "Interviewer" || p.role === "Scheduler",
      );
      console.log("isHistoryHandled", isHistoryHandled);

      if (!isHistoryHandled && action === "InProgress") {
        // ONE-TIME SPECIAL HISTORY CREATION
        const smartBody = {
          status: action,
          interviewerType: existingRound.interviewerType,
          selectedInterviewers: existingRound.interviewers,
          currentActionReason: reasonCode || null,
          comments: comment || null,
          rescheduleReason: reasonCode || null,
        };

        smartUpdate = await buildSmartRoundUpdate({
          existingRound,
          body: smartBody,
          actingAsUserId,
          statusChanged: true,
        });
      }
      // If conditions not met, smartUpdate remains null (no history created)
    } else {
      // NORMAL HISTORY CREATION FOR ALL OTHER CASES
      const smartBody = {
        status: newStatus,
        interviewerType: existingRound.interviewerType,
        selectedInterviewers: existingRound.interviewers,
        currentActionReason: reasonCode || cancellationReason || null,
        comments: comment || null,
        rescheduleReason: reasonCode || null,
      };

      if (
        action === "Completed" &&
        allInterviewersDraft &&
        existingRound.interviewMode === "Virtual"
      ) {
        smartUpdate = await buildSmartRoundUpdate({
          existingRound,
          body: {
            ...smartBody,
            status: "FeedbackPending", // Override status to FeedbackPending if feedback is still in draft
          },
          actingAsUserId,
          statusChanged: true,
        });
      } else if (!allInterviewersDraft && action === "Completed") {
        smartUpdate = await buildSmartRoundUpdate({
          existingRound,
          body: {
            ...smartBody,
            status: "FeedbackSubmitted", // Override status to FeedbackPending if feedback is still in draft
          },
          actingAsUserId,
          statusChanged: true,
        });
      }
      // else if (existingRound?.)
      else {
        smartUpdate = await buildSmartRoundUpdate({
          existingRound,
          body: smartBody,
          actingAsUserId,
          statusChanged: true,
        });
      }
    }
    // Build body for buildSmartRoundUpdate — this is key!
    // const smartBody = {
    //   status: newStatus,
    //   interviewerType: existingRound.interviewerType,
    //   selectedInterviewers: existingRound.interviewers, // preserve current
    //   // Pass reason via generic fields that buildSmartRoundUpdate understands
    //   currentActionReason: reasonCode || null,
    //   comments: comment || null,
    //   // Optional: for reschedule cases (not used here, but safe)
    //   rescheduleReason: reasonCode || null,
    // };

    // // Let buildSmartRoundUpdate handle status change + history + reason
    // let smartUpdate = null;

    // smartUpdate = buildSmartRoundUpdate({
    //   existingRound,
    //   body: smartBody,
    //   actingAsUserId,
    //   // changes,
    //   statusChanged: true,
    // });

    // console.log("smartUpdate", smartUpdate);

    // Extra logic ONLY for Cancelled (outside smart update)
    let extraUpdate = { $set: {} };
    let shouldSendCancellationEmail = false;

    if (action === "Completed") {
      // Auto-settlement for completed interviews ONLY if feedback is submitted
      if (existingRound.interviewerType === "External") {
        try {
          await processAutoSettlement({
            roundId: existingRound._id.toString(),
            action: "Completed",
            //reasonCode: reasonCode || comment || null,
          });
          console.log(
            "[updateInterviewRoundStatus] Auto-settlement completed for round:",
            existingRound._id,
          );
        } catch (settlementError) {
          console.error(
            "[updateInterviewRoundStatus] Auto-settlement error:",
            settlementError,
          );
          // Continue with status update even if settlement fails
        }
      }
      // //  else {
      // //   console.log(
      // //     "[updateInterviewRoundStatus] Skipping auto-settlement: Feedback not submitted or not found for round:",
      // //     existingRound._id,
      // //   );
      // }
    }

    if (action === "Cancelled") {
      if (existingRound.interviewerType === "External") {
        // Auto-settlement for cancelled interviews
        try {
          await processAutoSettlement({
            roundId: existingRound._id.toString(),
            action: "Cancelled",
            reasonCode: cancellationReason || reasonCode || comment || null,
          });

          console.log(
            "[updateInterviewRoundStatus] Auto-settlement for cancelled round:",
            existingRound._id,
          );
        } catch (settlementError) {
          console.error(
            "[updateInterviewRoundStatus] Auto-settlement error for cancelled round:",
            settlementError,
          );
        }
        // Continue with status update even if settlement fails
      }

      // Cancel accepted interview requests
      const hasAccepted = await InterviewRequest.countDocuments({
        roundId: existingRound._id,
        status: "accepted",
      });

      if (hasAccepted > 0) {
        await InterviewRequest.updateMany(
          { roundId: existingRound._id, status: "accepted" },
          { status: "cancelled", respondedAt: new Date() },
        );
      }

      shouldSendCancellationEmail = true;

      extraUpdate.$set.interviewers = []; // Clear interviewers
      extraUpdate.$set.meetingId = "";
      extraUpdate.$set.meetPlatform = "";
    }

    // Handle Evaluated action - save roundOutcome and evaluation reason
    if (action === "Evaluated") {
      if (roundOutcome) {
        extraUpdate.$set.roundOutcome = roundOutcome;
        extraUpdate.$set.roundScore = getRoundScoreFromOutcome(roundOutcome);
      }
      if (reason) {
        extraUpdate.$set.currentActionReason = reason;
      }
      if (comment) {
        extraUpdate.$set.comments = comment;
      }
    }

    // Merge smartUpdate (status + history) with extraUpdate (cancel-specific)
    // function mergeUpdates(a, b) {
    //   const out = {};

    //   if (a?.$set || b?.$set) {
    //     out.$set = { ...(a?.$set || {}), ...(b?.$set || {}) };
    //   }

    //   if (a?.$push?.history || b?.$push?.history) {
    //     out.$push = {
    //       history: [...(a?.$push?.history || []), ...(b?.$push?.history || [])],
    //     };
    //   }

    //   return out;
    // }

    // Merge smartUpdate (status + history) with extraUpdate (cancel-specific)
    function mergeUpdates(a, b) {
      const out = {};

      if (a?.$set || b?.$set) {
        out.$set = { ...(a?.$set || {}), ...(b?.$set || {}) };
      }

      if (a?.$push?.history || b?.$push?.history) {
        out.$push = {
          history: [...(a?.$push?.history || []), ...(b?.$push?.history || [])],
        };
      }

      return out;
    }

    let finalUpdate = smartUpdate;

    console.log("finalUpdate", finalUpdate);

    // if (Object.keys(extraUpdate.$set).length > 0) {
    //   finalUpdate = mergeUpdates(
    //     smartUpdate || { $set: {}, $push: { history: [] } },
    //     extraUpdate
    //   );
    // }

    if (Object.keys(extraUpdate.$set).length > 0) {
      finalUpdate = mergeUpdates(
        smartUpdate || { $set: {}, $push: { history: [] } },
        extraUpdate,
      );
    }

    // Safety check
    if (!finalUpdate || (!finalUpdate.$set && !finalUpdate.$push)) {
      return res
        .status(200)
        .json({ success: true, message: "Nothing to update" });
    }

    if (req.body?.roundOutcome) {
      // const Updated = { $set: {} };
      finalUpdate.$set.roundOutcome = req.body.roundOutcome;
    }

    // Apply update
    const updatedRound = await InterviewRounds.findByIdAndUpdate(
      roundId,
      finalUpdate,
      { new: true, runValidators: true },
    )
      .populate("interviewId", "title candidateName")
      .populate("interviewers", "firstName lastName email");

    // Send cancellation email
    if (shouldSendCancellationEmail) {
      await sendInterviewRoundCancellationEmails(
        {
          body: {
            interviewId: updatedRound.interviewId,
            roundId: updatedRound._id,
            reasonCode,
            comment,
          },
        },
        { status: () => ({ json: () => { } }), locals: {} },
      );
    }

    return res.status(200).json({
      success: true,
      message: "Interview round status updated successfully",
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

const getRoundScoreFromOutcome = (roundOutcome) => {
  const outcomeScoreMap = {
    STRONG_YES: 5,
    YES: 4,
    NEUTRAL: 3,
    NO: 2,
    STRONG_NO: 1,
  };

  return outcomeScoreMap[roundOutcome] || null;
};

/**
 * Smart update builder for InterviewRounds
 * ✅ Single place for ALL history creation
 * ✅ Clear Internal vs External handling
 * ✅ Append-only history
 */
async function buildSmartRoundUpdate({
  existingRound,
  body,
  actingAsUserId,
  changes,
  isCreate = false,
  statusChanged = false,
  OutsourceAccepted = false,
}) {
  const update = { $set: {}, $push: { history: [] } };

  const isInternal = body.interviewerType === "Internal";
  const isExternal = !isInternal;

  const now = new Date();

  console.log("existingRound", {
    existingRound,
    body,
    actingAsUserId,
    changes,
    isCreate,
    statusChanged,
    OutsourceAccepted,
  });

  /* ---------------- Helpers ---------------- */

  const resolveComment = (reasonCode, comment) =>
    reasonCode === "Other" ? comment || null : null;

  const extractInterviewers = () =>
    Array.isArray(body.selectedInterviewers)
      ? body.selectedInterviewers.map((i) => i.contact?._id || i._id)
      : [];

  const addHistory = ({
    action,
    scheduledAt,
    reasonCode = null,
    comment = null,
  }) => {
    update.$push.history.push({
      action,
      scheduledAt,
      reasonCode,
      comment: resolveComment(reasonCode, comment),
      interviewers: body.status === "Draft" ? [] : extractInterviewers(),
      participants: [],
      createdBy: actingAsUserId,
      createdAt: now,
    });
  };

  if (OutsourceAccepted) {
    update.$set.previousAction = existingRound.currentAction || null;
    update.$set.currentAction = body.status;
    update.$set.status = body.status;
    update.$set.currentActionReason = "accepted_by_outsource" || null;
    // body.currentActionReason ||
    // body.rescheduleReason ||
    // body.cancellationReason ||
    // null;
    addHistory({
      action: body.status, //existingRound.status,
      scheduledAt: existingRound.dateTime,
      reasonCode: "accepted_by_outsource",
      comment: null,
    });

    return update;
  }

  /* ================= CREATE ================= */

  //  intial create round history
  if (isCreate) {
    update.$set.status = body.status;
    update.$set.currentAction = body.status;
    update.$set.previousAction = null;
    update.$set.currentActionReason = body.currentActionReason || null;

    if (body.dateTime) {
      addHistory({
        action: body.status,
        scheduledAt: body.dateTime,
        reasonCode: body.currentActionReason,
        comment: body.comments,
      });
    }

    console.log("update update", update);

    return update;
  }

  // status api history create
  if (statusChanged) {
    update.$set.previousAction = existingRound.currentAction || null;
    update.$set.currentAction = body.status;
    update.$set.status = body.status;
    update.$set.currentActionReason =
      body.currentActionReason ||
      body.rescheduleReason ||
      body.cancellationReason ||
      null;

    //  update.$set.previousAction = existingRound.currentAction || null;
    // update.$set.currentAction = body.status; // || existingRound.status;
    // update.$set.currentActionReason = body.rescheduleReason || "time_changed";

    // update.$set.interviewers =
    //   body.status === "Draft"
    //     ? []
    //     : Array.isArray(body.selectedInterviewers)
    //     ? existingRound.interviewers.map((i) => i.contact?._id || i._id)
    //     : [];
    // update.$set.participants = [];

    // /* ---------- adding histotry status changing ---------- */

    addHistory({
      action: body.status, //existingRound.status,
      scheduledAt: existingRound.dateTime,
      reasonCode: body.currentActionReason,
      comment: body.comments,
    });

    return update;
  }

  if (!changes?.anyChange) return null;

  /* ============= GENERIC FIELD UPDATE ============= */

  Object.keys(body).forEach((key) => {
    if (key !== "status" && body[key] !== undefined) {
      update.$set[key] = body[key];
    }
  });

  /* ============= STATUS CHANGE ============= */

  // if (!changes.statusChanged && body.status) {
  //   update.$set.previousAction = existingRound.currentAction || null;
  //   update.$set.currentAction = body.status;
  //   update.$set.status = body.status;
  //   update.$set.currentActionReason =
  //     body.currentActionReason ||
  //     body.rescheduleReason ||
  //     body.cancellationReason ||
  //     null;

  //   /* ---------- INTERNAL ---------- */
  if (isInternal && body?.status !== existingRound?.status) {
    if (
      ["Scheduled", "Rescheduled", "Cancelled", "Draft"].includes(body.status)
    ) {
      update.$set.previousAction = existingRound.currentAction || null;
      update.$set.currentAction = body.status;
      update.$set.status = body.status;
      update.$set.currentActionReason =
        body.currentActionReason ||
        body.rescheduleReason ||
        body.cancellationReason ||
        null;
      addHistory({
        action: body.status,
        scheduledAt: body.dateTime || existingRound.dateTime,
        reasonCode: update.$set.currentActionReason,
        comment: body.comments,
      });
    }
  }

  //   /* ---------- EXTERNAL ---------- */
  //   if (isExternal) {
  //     if (
  //       [
  //         "RequestSent",
  //         "Scheduled",
  //         "Rescheduled",
  //         "Cancelled",
  //         "Draft",
  //       ].includes(body.status)
  //     ) {
  //       addHistory({
  //         action: body.status,
  //         scheduledAt: body.dateTime || existingRound.dateTime,
  //         reasonCode: update.$set.currentActionReason,
  //         comment: body.comments,
  //       });
  //     }
  //   }
  // }

  /* ============= RESCHEDULE WITHOUT STATUS CHANGE ============= */

  if (
    (changes.dateTimeChanged &&
      ["Scheduled", "Rescheduled", "RequestSent", "Draft"].includes(
        existingRound.status,
      )) ||
    (changes.statusChanged && body.status)
  ) {
    changes.statusChanged && body.status;
    update.$set.previousAction = existingRound.currentAction || null;
    update.$set.currentAction = body.status; // || existingRound.status;
    update.$set.currentActionReason = body.rescheduleReason || "time_changed";

    addHistory({
      action: body.status, //existingRound.status,
      scheduledAt: body.dateTime,
      reasonCode: update.$set.currentActionReason,
      comment: body.comments,
    });
  }

  /* ============= CLEANUP ============= */

  if (!update.$push.history.length) delete update.$push;
  if (!Object.keys(update.$set).length) delete update.$set;
  if (!update.$push && !update.$set) return null;

  return update;
}

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
    (id) => !newQuestionIds.includes(id),
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
  // cancelOldRequests = false,
}) {
  const { createRequest } = require("./InterviewRequestController.js");

  const interview = await Interview.findById(interviewId).lean();
  if (!interview) return;

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
      { status: () => ({ json: () => { } }), locals: {} },
    );
  }

  // 3️⃣ Send outsource emails (External ONLY)
  if (round.interviewerType === "External") {
    const contactIds = selectedInterviewers.map(
      (interviewer) =>
        interviewer.contact._id?.toString() || interviewer.contactId,
    );
    await sendOutsourceInterviewRequestEmails(
      {
        body: {
          interviewId: interview._id,
          roundId: round._id,
          interviewerIds: contactIds, // ← Only Contact _ids
          type: "interview",
        },
      },
      { status: () => ({ json: () => { } }), locals: {} },
    );
    console.log(
      "Outsource interview request emails sent successfully",
      selectedInterviewers,
    );
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
        type: "interview",
      },
    },
    {
      status: () => ({ json: () => { } }),
      locals: {},
    },
  );
}

async function detectRoundChanges({
  existingRound,
  incomingRound,
  selectedInterviewers = [],
  compareInterviewers = true,
  compareInstructions = true,
  compareQuestions = true,
}) {
  const changes = {
    statusChanged: false,
    dateTimeChanged: false,
    interviewersChanged: false,
    instructionsChanged: false,
    questionsChanged: false,
    anyChange: false,
  };

  console.log("detectRoundChanges", incomingRound);
  console.log("detectRoundChanges", existingRound);

  // 1. Status change
  if (incomingRound.status && incomingRound.status !== existingRound.status) {
    changes.statusChanged = true;
    changes.anyChange = true;
  }

  // 2. DateTime change (safe date comparison)
  if (incomingRound.dateTime || existingRound.dateTime) {
    const oldTime = existingRound.dateTime;
    const newTime = incomingRound.dateTime;
    if (oldTime !== newTime) {
      changes.dateTimeChanged = true;
      changes.anyChange = true;
    }
  }

  // 3. Instructions change
  if (
    compareInstructions &&
    incomingRound.instructions !== undefined &&
    incomingRound.instructions !== existingRound.instructions
  ) {
    changes.instructionsChanged = true;
    changes.anyChange = true;
  }

  // 4. Interviewers change (uncomment and fix if needed)
  // if (compareInterviewers) {
  //   const oldIds = (existingRound.interviewers || []).map(String).sort();
  //   const newIds = (selectedInterviewers || []).map(i => String(i._id || i)).sort();
  //   if (JSON.stringify(oldIds) !== JSON.stringify(newIds)) {
  //     changes.interviewersChanged = true;
  //     changes.anyChange = true;
  //   }
  // }

  // 5. Questions change – CORRECT WAY
  // if (compareQuestions) {
  //   const incomingQuestions = incomingRound.questions || [];

  //   console.log("incomingQuestions", incomingQuestions);

  //   // Fetch actual existing questions from DB
  //   const existingQuestionsFromDB = await interviewQuestions
  //     .find({
  //       // interviewId: existingRound.interviewId,
  //       roundId: existingRound._id,
  //     })
  //     .lean();

  //   console.log("existingQuestionsFromDB", existingQuestionsFromDB);

  //   // Create maps keyed by _id (for updates) and order+snapshot (for new ones)
  //   const existingMap = new Map();
  //   existingQuestionsFromDB.forEach((q) => {
  //     existingMap.set(q._id.toString(), q);
  //   });
  //   console.log("existingMap", existingMap);

  //   let hasChanged = false;

  //   // Check length first
  //   if (existingQuestionsFromDB.length !== incomingQuestions.length) {
  //     hasChanged = true;
  //   } else {
  //     // Deep compare each question
  //     for (const incoming of incomingQuestions) {
  //       if (incoming.questionId) {
  //         // Existing question being updated
  //         const existing = existingMap.get(incoming.questionId.toString());
  //         if (!existing) {
  //           hasChanged = true;
  //           break;
  //         }

  //         // Compare relevant fields (you can adjust which ones matter)
  //         const fieldsToCompare = [
  //           "order",
  //           "customizations",
  //           "mandatory",
  //           "snapshot",
  //           "source",
  //         ];
  //         for (const field of fieldsToCompare) {
  //           if (
  //             JSON.stringify(incoming[field]) !==
  //             JSON.stringify(existing[field])
  //           ) {
  //             hasChanged = true;
  //             break;
  //           }
  //         }
  //         if (hasChanged) break;
  //       } else {
  //         // New question added → definitely changed
  //         hasChanged = true;
  //         break;
  //       }
  //     }

  //     // Also check if any existing question was removed
  //     if (!hasChanged) {
  //       const incomingIds = incomingQuestions
  //         .filter((q) => q._id)
  //         .map((q) => q._id);

  //       if (
  //         existingQuestionsFromDB.some(
  //           (q) => !incomingIds.includes(q._id.toString())
  //         )
  //       ) {
  //         hasChanged = true;
  //       }
  //     }
  //   }

  //   if (hasChanged) {
  //     changes.questionsChanged = true;
  //     changes.anyChange = true;
  //   }
  // }

  if (compareQuestions) {
    const incomingQuestions = incomingRound.questions || [];

    const existingQuestionsFromDB = await interviewQuestions
      .find({
        interviewId: existingRound.interviewId,
        roundId: existingRound._id,
      })
      .lean();

    // Simple but effective: if lengths differ → changed
    if (existingQuestionsFromDB.length !== incomingQuestions.length) {
      changes.questionsChanged = true;
      changes.anyChange = true;
    } else {
      // Optional: deep compare snapshot.questionId or order/customizations
      // But usually, if user opened question editor → assume changed
      // OR compare by source + questionId + order
      const existingSet = new Set(
        existingQuestionsFromDB.map(
          (q) => `${q.questionId}|${q.source}|${q.order}|${q.mandatory}`,
        ),
      );
      console.log("existingSet", existingSet);

      const incomingSet = new Set(
        incomingQuestions.map(
          (q) => `${q.questionId}|${q.source}|${q.order}|${q.mandatory}`,
        ),
      );

      console.log("incomingSet", incomingSet);

      if (
        existingSet.size !== incomingSet.size ||
        ![...existingSet].every((val) => incomingSet.has(val))
      ) {
        changes.questionsChanged = true;
        changes.anyChange = true;
      }
    }
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

const triggerInterviewRoundStatusUpdated = async (
  round,
  oldStatus,
  interview = null,
) => {
  try {
    // Skip if no status change or if status is not set
    if (!round.status || round.status === oldStatus) {
      return;
    }

    // Skip draft status as per requirements
    if (round.status === "Draft") {
      return;
    }

    // If interview is not provided, fetch it
    if (!interview) {
      interview = await Interview.findById(round.interviewId).lean();
      if (!interview) {
        console.error("Interview not found for round:", round._id);
        return;
      }
    }

    // Prepare the webhook data
    const webhookData = {
      interviewId: interview._id,
      interviewCode: interview.interviewCode,
      roundId: round._id,
      roundTitle: round.roundTitle,
      previousStatus: oldStatus,
      newStatus: round.status,
      updatedAt: new Date().toISOString(),
      candidateId: interview.candidateId,
      positionId: interview.positionId,
      tenantId: interview.tenantId,
    };

    // Trigger the webhook
    await triggerWebhook(
      EVENT_TYPES.INTERVIEW_ROUND_STATUS_UPDATED,
      webhookData,
      interview.tenantId,
    );

    console.log(
      `Webhook triggered for interview round ${round._id} status change: ${oldStatus} -> ${round.status}`,
    );
  } catch (error) {
    console.error("Error in triggerInterviewRoundStatusUpdated:", error);
  }
};

// Common validation function for both POST and PATCH APIs Healper fucntion
// const validateRoundCreationBasedOnParallelScheduling = async (
//   interviewId,
//   isNewRound = true,
//   roundId = null
// ) => {
//   try {
//     const interview = await Interview.findById(interviewId).lean();
//     if (!interview) {
//       return { isValid: false, message: "Interview not found" };
//     }

//     // Check if allowParallelScheduling is false
//     if (!interview.allowParallelScheduling) {
//       // Find all existing rounds for this interview
//       const existingRounds = await InterviewRounds.find({
//         interviewId,
//         status: { $nin: ["Completed", "Cancelled", "Skipped", "Rejected"] },
//       });

//       // ✅ in-memory sort (safe for Cosmos)
//       existingRounds.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

//       if (existingRounds.length > 0) {
//         // Check if any round has NO or STRONG_NO outcome
//         const hasNegativeOutcomeRound = existingRounds.some((round) =>
//           ["NO", "STRONG_NO"].includes(round.roundOutcome)
//         );

//         if (hasNegativeOutcomeRound) {
//           // For new round creation - block it
//           if (isNewRound) {
//             return {
//               isValid: false,
//               message:
//                 "Cannot create new round. A previous round has negative outcome (NO/STRONG_NO) and parallel scheduling is disabled.",
//               code: "PARALLEL_SCHEDULING_DISABLED_NEGATIVE_OUTCOME",
//             };
//           }

//           // For updating existing round to scheduled/rescheduled status
//           if (roundId) {
//             // Check if this is the round with negative outcome
//             const currentRoundIndex = existingRounds.findIndex(
//               (r) => r._id.toString() === roundId.toString()
//             );
//             const currentRound = existingRounds[currentRoundIndex];

//             // If current round has negative outcome, prevent scheduling/rescheduling
//             if (
//               currentRound &&
//               ["NO", "STRONG_NO"].includes(currentRound.roundOutcome)
//             ) {
//               return {
//                 isValid: false,
//                 message:
//                   "Cannot schedule/reschedule this round. It has negative outcome (NO/STRONG_NO) and parallel scheduling is disabled.",
//                 code: "NEGATIVE_OUTCOME_NO_SCHEDULING",
//               };
//             }
//           }
//         }

//         // Additional check: If any round is in Scheduled/Rescheduled status and parallel scheduling is false
//         // This prevents creating new rounds when previous ones are still active
//         const hasActiveScheduledRound = existingRounds.some((round) =>
//           ["Scheduled", "Rescheduled", "RequestSent", "InProgress"].includes(
//             round.status
//           )
//         );

//         if (hasActiveScheduledRound && isNewRound) {
//           // Find the active round
//           const activeRound = existingRounds.find((round) =>
//             ["Scheduled", "Rescheduled", "RequestSent", "InProgress"].includes(
//               round.status
//             )
//           );

//           return {
//             isValid: false,
//             message: `Cannot create new round. Round "${
//               activeRound.roundTitle || "#" + activeRound.sequence
//             }" is currently ${activeRound.status.toLowerCase()} and parallel scheduling is disabled.`,
//             activeRound: {
//               sequence: activeRound.sequence,
//               roundTitle: activeRound.roundTitle,
//               status: activeRound.status,
//             },
//             code: "ACTIVE_ROUND_EXISTS_NO_PARALLEL",
//           };
//         }
//       }
//     }

//     return { isValid: true };
//   } catch (error) {
//     console.error(
//       "Error in validateRoundCreationBasedOnParallelScheduling:",
//       error
//     );
//     return {
//       isValid: false,
//       message: "Validation error",
//       error: error.message,
//     };
//   }
// };

const validateRoundCreationBasedOnParallelScheduling = async ({
  interviewId,
  isNewRound = false,
  roundId = null,
  shouldValidateParallelScheduling = false,
}) => {
  try {
    const interview = await Interview.findById(interviewId).lean();
    if (!interview) {
      return { isValid: false, message: "Interview not found" };
    }

    // Parallel scheduling ON → no restriction
    if (interview?.allowParallelScheduling) {
      return { isValid: true };
    }

    // Fetch all rounds for interview
    const rounds = await InterviewRounds.find({ interviewId }).lean();

    if (!rounds.length) {
      return { isValid: true };
    }

    // --------------------------------------------------
    // RULE 3: NO / STRONG_NO → HARD STOP
    // --------------------------------------------------
    const hasNegativeOutcome = rounds?.some((r) =>
      ["NO", "STRONG_NO"].includes(r?.roundOutcome),
    );

    if (hasNegativeOutcome) {
      return {
        isValid: false,
        message:
          "Cannot create or schedule rounds. A previous round has outcome NO or STRONG_NO.",
        code: "NEGATIVE_OUTCOME_BLOCK",
      };
    }

    // --------------------------------------------------
    // RULE: New round → all existing must be Evaluated or Skipped
    // Exception: Allow creating ONE draft if no draft exists
    // --------------------------------------------------
    if (isNewRound) {
      // "Evaluated" and "Skipped" are terminal statuses - rounds are considered "done"
      const terminalStatuses = ["Evaluated", "Skipped"];

      // Active statuses — rounds that are currently in progress / awaiting action
      const activeStatuses = ["Scheduled", "Rescheduled", "RequestSent", "InProgress"];

      // Check if ALL rounds are in terminal status (Evaluated/Skipped)
      const allRoundsTerminal = rounds.every(r => terminalStatuses?.includes(r?.status));

      // Check if any round is currently active (Scheduled/Rescheduled/RequestSent/InProgress)
      const hasActiveRound = rounds.some(r => activeStatuses?.includes(r?.status));

      // Count existing draft rounds
      const draftCount = rounds.filter(r => r?.status === "Draft").length;

      console.log("isNewRound:", isNewRound, "allRoundsTerminal:", allRoundsTerminal, "hasActiveRound:", hasActiveRound, "draftCount:", draftCount);

      // CASE 1: All rounds are Evaluated/Skipped → allow creating new round (any status)
      if (allRoundsTerminal) {
        return { isValid: true };
      }

      // CASE 2: Any round is Scheduled/Rescheduled/RequestSent/InProgress → only allow ONE draft
      // if (draftCount === 0) {
      if (hasActiveRound) {
        if (draftCount >= 1) {
          return {
            isValid: false,
            message: "Only one draft round is allowed at a time. Complete or evaluate the active round first.",
            code: "ONLY_ONE_DRAFT_ALLOWED",
          };
        }
        if (shouldValidateParallelScheduling) {
          return { isValid: false, message: "Parallel scheduling is not allowed when there is an active round." };
        }
        // Allow creating one draft round while active round exists
        return { isValid: true };
      }

      // CASE 3: No active rounds, not all terminal (e.g., only drafts exist) → allow only one draft
      if (draftCount >= 1) {
        return {
          isValid: false,
          message: "Only one draft round is allowed at a time when parallel scheduling is disabled.",
          code: "ONLY_ONE_DRAFT_ALLOWED",
        };
      }

      return { isValid: true };
    }

    // --------------------------------------------------
    // RULE (PATCH): Validations for updating existing rounds
    // --------------------------------------------------
    if (!isNewRound && roundId) {
      const terminalStatuses = ["Evaluated", "Skipped"];
      const currentRound = rounds.find(
        (r) => r._id.toString() === roundId.toString(),
      );

      // Check 1: Block if current round has NO/STRONG_NO outcome
      if (
        currentRound &&
        ["NO", "STRONG_NO"].includes(currentRound.roundOutcome)
      ) {
        return {
          isValid: false,
          message:
            "Cannot schedule or reschedule this round due to NO or STRONG_NO outcome.",
          code: "NEGATIVE_OUTCOME_NO_SCHEDULING",
        };
      }

      // Check 2: All rounds (excluding current) must be Evaluated or Skipped
      const otherRounds = rounds.filter(
        (r) => r._id.toString() !== roundId.toString()
      );

      const allOtherRoundsTerminal =
        // otherRounds.length === 0 ||
        otherRounds.every((r) => terminalStatuses.includes(r.status));

      console.log("PATCH - allOtherRoundsTerminal:", allOtherRoundsTerminal);
      console.log("PATCH - !allOtherRoundsTerminal:", !allOtherRoundsTerminal);

      // If not all other rounds are Evaluated/Skipped, block
      if (!allOtherRoundsTerminal) {
        return {
          isValid: false,
          message: "Cannot schedule this round. All other rounds must be evaluated or skipped first.",
          code: "ACTIVE_ROUNDS_EXIST",
        };
      }
    }

    return { isValid: true };
  } catch (error) {
    console.error(
      "validateRoundCreationBasedOnParallelScheduling error:",
      error,
    );
    return {
      isValid: false,
      message: "Parallel scheduling validation failed",
      error: error.message,
    };
  }
};

module.exports = {
  saveInterviewRound,
  updateInterviewRound,
  updateInterviewRoundStatus,
  buildSmartRoundUpdate,
  getRoundScoreFromOutcome,
  // parseDateTimeString,
};
