const mongoose = require("mongoose");
const { InterviewRounds } = require("../models/Interview/InterviewRounds");
const { Interview } = require("../models/Interview/Interview.js");
const InterviewRequest = require("../models/InterviewRequest.js");
const Wallet = require("../models/WalletTopup");
const { Candidate } = require("../models/candidate.js");
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
} = require("../utils/interviewWalletUtil");

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

    // Process interviewers if present
    if (round.interviewers) {
      round.interviewers = await processInterviewers(round.interviewers);
    }

    // Calculate sequence
    let totalRounds = await InterviewRounds.countDocuments({ interviewId });
    let newSequence = round.sequence || totalRounds + 1;

    await InterviewRounds.updateMany(
      { interviewId, sequence: { $gte: newSequence } },
      { $inc: { sequence: 1 } }
    );

    // Extract meetLink/meetPlatform
    const { meetPlatform, meetLink, ...otherRoundData } = round;

    // Fetch interview to get ownerId (needed for history)
    const interview = await Interview.findById(interviewId).lean();
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // ==================== DETERMINE FINAL STATUS ====================
    let finalStatus = "Draft";

    if (round.roundTitle === "Assessment") {
      finalStatus = "Scheduled";
    } else if (round.interviewerType !== "Internal") {
      // External / Outsource
      if (req.body.round?.selectedInterviewers?.length > 0) {
        finalStatus = "RequestSent";
      }
    } else {
      // Internal
      const hasInterviewers = req.body.round?.selectedInterviewers?.length > 0;
      const hasDateTime = !!round.dateTime;

      if (hasInterviewers && hasDateTime) {
        finalStatus = "Scheduled"; // First scheduling
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

    // ================= HISTORY (CREATE FLOW) =================

    //history should be update after creation of round
    const historyUpdate = buildSmartRoundUpdate({
      body: otherRoundData,
      actingAsUserId: interview?.ownerId,
      isCreate: true,
    });

    // console.log("historyUpdate", historyUpdate);

    if (historyUpdate) {
      await InterviewRounds.findByIdAndUpdate(savedRound._id, historyUpdate, {
        new: true,
      });
    }

    // =================== WALLET HOLD FOR OUTSOURCED INTERVIEWERS (SELECTION TIME) ========================
    // Delegate to helper so this controller stays clean and focused.
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

    // =================== start == assessment mails sending functionality == start ========================

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
        selectedInterviewers: req.body.round?.selectedInterviewers,
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

  console.log("req.bodyround", req.body);

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

  if (!changes.anyChange) {
    return res.status(200).json({
      message: "No changes detected. Round not updated.",
      status: "noop",
    });
  }
  // console.log("existingRound", existingRound);
  let updatedRound = null;

  // console.log("updatedRound", updatedRound);

  let updatePayload = null;

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
  // if (
  //   isOutsource &&
  //   changes.dateTimeChanged
  // ) {

  //   if (existingRound.status === "RequestSent") {
  //   await InterviewRequest.updateMany(
  //     { roundId: existingRound._id, status: "inprogress" },
  //     { status: "withdrawn", respondedAt: new Date() }
  //   );

  //   updatePayload.$set.status = "RequestSent";

  //   // Safely check and add Rescheduled history
  //   const hasRescheduled = updatePayload.$push.history.some(
  //     (h) => h.action === "Rescheduled"
  //   );
  //   if (!hasRescheduled) {
  //     updatePayload.$push.history.push({
  //       action: "Rescheduled",
  //       scheduledAt: req.body.round.dateTime,
  //       updatedAt: new Date(),
  //       createdBy: actingAsUserId,
  //       reasonCode: req.body.round.currentActionReason || "time_changed",
  //       comment: req.body.round.comments || null,
  //     });
  //   }
  // }

  // if (existingRound.status === "Scheduled") {
  // }

  // console.log("isOutsource", isOutsource);

  // ranjith added this for outsource interviwers or internal interviewers
  const hasInterviewers =
    req.body.round?.interviewerType === "Internal"
      ? req.body.round?.interviewers.length > 0 || false
      : false;

  //  for outsource interviewers
  const hasselectedInterviewers =
    req.body.round?.interviewerType === "External"
      ? req.body.round?.selectedInterviewers.length > 0
      : // ||
      // req.body.round?.interviewers.length > 0
      false;
  // req.body.round?.selectedInterviewers.length > 0

  // console.log(
  //   "req.body.round?.selectedInterviewers",
  //   req.body.round?.selectedInterviewers
  // );

  // console.log(
  //   "req.body.round?.selectedInterviewers",
  //   req.body.round?.selectedInterviewers
  // );

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

  const shouldUpdateQuestionsOrInstructions =
    statusAllowsQuestionUpdate &&
    // changes?.interviewersChanged &&
    (changes.questionsChanged || changes.instructionsChanged);
  console.log(
    "shouldUpdateQuestionsOrInstructions",
    shouldUpdateQuestionsOrInstructions
  );

  if (shouldUpdateQuestionsOrInstructions) {
    console.log("Updating only questions or instructions");

    await handleInterviewQuestions(interviewId, roundId, req.body.questions);
  } else if (changes.instructionsChanged) {
    updatePayload.$set.instructions = req.body.round.instructions;

    updatedRound = await InterviewRounds.findByIdAndUpdate(
      roundId,
      updatePayload,
      { new: true, runValidators: true }
    );
  } else {
    let shouldcreateRequestFlow = false;
    // ==================================================================
    // OUTSOURCE LOGIC (mirroring Internal style)
    // ==================================================================
    if (isOutsource) {
      // 1. Draft → RequestSent (sending new requests)
      if (existingRound.status === "Draft" && hasselectedInterviewers) {
        updatePayload.$set.status = "RequestSent";
        shouldcreateRequestFlow = true;
      }

      // 2. RequestSent → Draft (user removing interviewers / cancelling requests)
      else if (
        existingRound.status === "RequestSent" &&
        hasselectedInterviewers
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
          { status: "withdrawn", respondedAt: new Date() }
        );
        // console.log("withdrawnRequests", withdrawnRequests);

        updatePayload.$set.status = "Draft";
      }

      // 3. Scheduled → Draft (cancelling after acceptance)
      else if (
        (existingRound.status === "Scheduled" ||
          existingRound.status === "Rescheduled") &&
        // hasInterviewers
        hasselectedInterviewers
      ) {
        // PROTECT: Check if accepted (should always be true, but safe)
        if (hasAccepted) {
          // Cancel the accepted request
          await InterviewRequest.updateMany(
            { roundId: existingRound._id, status: "accepted" },
            { status: "cancelled", respondedAt: new Date() }
          );
        }

        updatePayload.$set.status = "Draft";
        updatePayload.$set.interviewers = []; // Clear assigned interviewer

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
              "Cancellation emails sent for cancelled outsource interviewer"
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
        existingRound.status
      );

      const willBeScheduled = hasInterviewers && !!req.body.round.dateTime;

      if (existingRound.status === "Draft" && willBeScheduled) {
        // Decide schedule action based on history
        const hasScheduledOnce = existingRound?.history?.some(
          (h) => h.action === "Scheduled"
        );

        const scheduleAction = hasScheduledOnce ? "Rescheduled" : "Scheduled";

        updatePayload.$set.status = scheduleAction;
        shouldSendInternalEmail = true; // First scheduling → send email
        shouldcreateRequestFlow = true;
      }
      //  else if (
      //   wasScheduledBefore &&
      //   (changes.dateTimeChanged || changes.interviewersChanged)
      // ) {
      //   updatePayload.$set.status = "Rescheduled";
      //   shouldSendInternalEmail = true; // Rescheduling → send email
      // }
      else if (
        (existingRound.status === "Rescheduled" ||
          existingRound.status === "Scheduled") &&
        hasInterviewers
      ) {
        // User cleared interviewers → cancel
        updatePayload.$set.status = "Draft";
        updatePayload.$set.interviewers = []; // making accepted interviwers clear
        await InterviewRequest.updateMany(
          { roundId: existingRound._id, status: "accepted" },
          { status: "cancelled", respondedAt: new Date() }
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
              "Cancellation emails sent for cancelled outsource interviewer"
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
    let smartUpdate;

    if (
      updatePayload.$set.status !== existingRound.status &&
      updatePayload.$set.status
    ) {
      smartUpdate = buildSmartRoundUpdate({
        existingRound,
        body: {
          // ...updatePayload,
          selectedInterviewers: req.body.round.selectedInterviewers,
          status: updatePayload.$set.status, //|| existingRound.status,
          interviewerType: existingRound.interviewerType,
        },
        // body: updatePayload,
        // {
        //   ...updatedRound,
        //   interviewerType: existingRound?.interviewerType,
        // },
        actingAsUserId,
        changes,
      });
    }

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
    //  date time change handling separately
    if (changes.dateTimeChanged) {
      updatePayload.$set.dateTime = req.body?.round?.dateTime;
    }

    if (changes.questionsChanged) {
      await handleInterviewQuestions(interviewId, roundId, req.body.questions);
    }

    if (changes.instructionsChanged) {
      updatePayload.$set.instructions = req.body.round.instructions;
    }

    // -------------------------------
    // 4️⃣ FINAL UPDATE (IMPORTANT)
    // -------------------------------
    let finalUpdate;

    // ✅ Only merge history if smartUpdate exists
    if (smartUpdate?.$push?.history?.length) {
      finalUpdate = mergeUpdates(updatePayload, smartUpdate);
    } else {
      // 🚫 No history creation
      finalUpdate = {
        $set: updatePayload.$set,
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

    updatedRound = await InterviewRounds.findByIdAndUpdate(
      roundId,
      finalUpdate,
      { new: true, runValidators: true }
    );

    // ==================================================================
    // SEND INTERNAL EMAIL ONLY WHEN STATUS BECOMES Scheduled/Rescheduled
    // ==================================================================
    if (shouldSendInternalEmail && isInternal) {
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
        // cancelOldRequests: true, // PATCH
      });

      // await InterviewRounds.findByIdAndUpdate(
      //   roundId,
      //   { status: "RequestSent" },
      //   { new: true }
      // );
    }
  }

  return res.status(200).json({
    message: "Round updated successfully",
    status: "ok",
    updatedRound,
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
    const { action, reasonCode, comment } = req.body; // reasonCode = your selected reason, comment = "Other" text

    console.log("req.body", req.body);

    if (!roundId || !action) {
      return res.status(400).json({
        success: false,
        message: "roundId and action are required",
      });
    }

    const existingRound = await InterviewRounds.findById(roundId)
      .populate("interviewId", "title candidateName")
      .populate("interviewers", "firstName lastName email");

    if (!existingRound) {
      return res.status(404).json({ success: false, message: "Round not found" });
    }

    // Map frontend "action" to actual status
    const actionToStatusMap = {
      Completed: "Completed",
      Selected: "Selected",
      Rejected: "Rejected",
      NoShow: "NoShow",
      Cancelled: "Cancelled",
    };

    const newStatus = actionToStatusMap[action];
    if (!newStatus) {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    // Detect changes
    const changes = {
      statusChanged: newStatus !== existingRound.status,
      dateTimeChanged: false, // assuming no datetime change in this endpoint
      anyChange: true,
    };

    // Build body for buildSmartRoundUpdate — this is key!
    const smartBody = {
      status: newStatus,
      interviewerType: existingRound.interviewerType,
      selectedInterviewers: existingRound.interviewers, // preserve current
      // Pass reason via generic fields that buildSmartRoundUpdate understands
      currentActionReason: reasonCode || null,
      comments: comment || null,
      // Optional: for reschedule cases (not used here, but safe)
      rescheduleReason: reasonCode || null,
    };

    // Let buildSmartRoundUpdate handle status change + history + reason
    let smartUpdate = buildSmartRoundUpdate({
      existingRound,
      body: smartBody,
      actingAsUserId,
      changes,
      statusChanged: changes.statusChanged,
    });

    // Extra logic ONLY for Cancelled (outside smart update)
    let extraUpdate = { $set: {} };
    let shouldSendCancellationEmail = false;

    if (action === "Completed") {
      //add wallet and policy code
    }

    if (action === "Cancelled") {

      //add wallet and policy code

      extraUpdate.$set.interviewers = []; // Clear interviewers

      // Cancel accepted interview requests
      const hasAccepted = await InterviewRequest.countDocuments({
        roundId: existingRound._id,
        status: "accepted",
      });

      if (hasAccepted > 0) {
        await InterviewRequest.updateMany(
          { roundId: existingRound._id, status: "accepted" },
          { status: "cancelled", respondedAt: new Date() }
        );
      }

      shouldSendCancellationEmail = true;
    }

    // Merge smartUpdate (status + history) with extraUpdate (cancel-specific)
    function mergeUpdates(a, b) {
      const out = {};

      if (a?.$set || b?.$set) {
        out.$set = { ...(a?.$set || {}), ...(b?.$set || {}) };
      }

      if (a?.$push?.history || b?.$push?.history) {
        out.$push = {
          history: [
            ...(a?.$push?.history || []),
            ...(b?.$push?.history || []),
          ],
        };
      }

      return out;
    }

    let finalUpdate = smartUpdate;

    if (Object.keys(extraUpdate.$set).length > 0) {
      finalUpdate = mergeUpdates(smartUpdate || { $set: {}, $push: { history: [] } }, extraUpdate);
    }

    // Safety check
    if (!finalUpdate || (!finalUpdate.$set && !finalUpdate.$push)) {
      return res.status(400).json({ success: false, message: "Nothing to update" });
    }

    // Apply update
    const updatedRound = await InterviewRounds.findByIdAndUpdate(
      roundId,
      finalUpdate,
      { new: true, runValidators: true }
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
        { status: () => ({ json: () => { } }), locals: {} }
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

/**
 * Smart update builder for InterviewRounds
 * ✅ Single place for ALL history creation
 * ✅ Clear Internal vs External handling
 * ✅ Append-only history
 */
function buildSmartRoundUpdate({
  existingRound,
  body,
  actingAsUserId,
  changes,
  isCreate = false,
  statusChanged = false,
}) {
  const update = { $set: {}, $push: { history: [] } };

  const isInternal = body.interviewerType === "Internal";
  const isExternal = !isInternal;

  console.log("body", body);
  console.log("changes", changes);
  console.log("isExternal", isExternal);

  const now = new Date();

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

  /* ================= CREATE ================= */

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
  //   if (isInternal) {
  //     if (
  //       ["Scheduled", "Rescheduled", "Cancelled", "Draft"].includes(body.status)
  //     ) {
  //       addHistory({
  //         action: body.status,
  //         scheduledAt: body.dateTime || existingRound.dateTime,
  //         reasonCode: update.$set.currentActionReason,
  //         comment: body.comments,
  //       });
  //     }
  //   }

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
  }

  /* ============= RESCHEDULE WITHOUT STATUS CHANGE ============= */

  if (
    (changes.dateTimeChanged &&
      ["Scheduled", "Rescheduled", "RequestSent", "Draft"].includes(
        existingRound.status
      )) ||
    (changes.statusChanged && body.status)
  ) {
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
  // cancelOldRequests = false,
}) {
  const interview = await Interview.findById(interviewId).lean();
  if (!interview) return;

  // console.log("body", {
  //   interviewId,
  //   round,
  //   selectedInterviewers,
  //   cancelOldRequests,
  // });

  // 1️⃣ Cancel old requests (PATCH only)
  // if (cancelOldRequests) {
  //   await InterviewRequest.updateMany(
  //     { roundId: round._id, status: "inprogress" },
  //     { status: "withdrawn", respondedAt: new Date() }
  //   );
  // }

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
    const contactIds = selectedInterviewers.map(
      (interviewer) =>
        interviewer.contact._id?.toString() || interviewer.contactId
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
      { status: () => ({ json: () => { } }), locals: {} }
    );
    console.log(
      "Outsource interview request emails sent successfully",
      selectedInterviewers
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
      },
    },
    {
      status: () => ({ json: () => { } }),
      locals: {},
    }
  );
}

// function detectRoundChanges({
//   existingRound,
//   incomingRound,
//   selectedInterviewers,
// }) {
//   const changes = {
//     statusChanged: false,
//     dateTimeChanged: false,
//     interviewersChanged: false,
//     anyChange: false,
//   };

//   // Status change
//   if (incomingRound.status && incomingRound.status !== existingRound.status) {
//     changes.statusChanged = true;
//     changes.anyChange = true;
//   }

//   // DateTime change
//   if (
//     incomingRound.dateTime &&
//     new Date(incomingRound.dateTime).getTime() !==
//       new Date(existingRound.dateTime).getTime()
//   ) {
//     changes.dateTimeChanged = true;
//     changes.anyChange = true;
//   }

//   // Interviewers change
//   const oldIds = (existingRound.interviewers || [])
//     .map((i) => String(i.contact?._id || i._id))
//     .sort();

//   const newIds = (selectedInterviewers || [])
//     .map((i) => String(i.contact?._id || i._id))
//     .sort();

//   if (JSON.stringify(oldIds) !== JSON.stringify(newIds)) {
//     changes.interviewersChanged = true;
//     changes.anyChange = true;
//   }

//   return changes;
// }

// function detectRoundChanges({
//   existingRound,
//   incomingRound,
//   selectedInterviewers = [],
//   compareInterviewers = true,
//   compareQuestions = true,
//   compareInstructions = true,
// }) {
//   const changes = {
//     statusChanged: false,
//     dateTimeChanged: false,
//     // interviewersChanged: false,
//     instructionsChanged: false, // ✅ NEW
//     questionsChanged: false, // ✅ NEW
//     anyChange: false,
//   };

//   console.log("detectRoundChanges", {
//     existingRound,
//     incomingRound,
//   });

//   // Status change
//   if (incomingRound.status && incomingRound.status !== existingRound.status) {
//     changes.statusChanged = true;
//     changes.anyChange = true;
//   }

//   // DateTime change
//   if (
//     incomingRound.dateTime &&
//     incomingRound.dateTime !== existingRound.dateTime
//     // incomingRound.dateTime &&
//     // new Date(incomingRound.dateTime).getTime() !==
//     //   new Date(existingRound.dateTime).getTime()
//   ) {
//     changes.dateTimeChanged = true;
//     changes.anyChange = true;
//   }

//   // Interviewers change (optional)
//   // if (compareInterviewers) {
//   //   const oldIds = (existingRound.interviewers || [])
//   //     .map((i) => String(i.contact?._id || i._id))
//   //     .sort();

//   //   const newIds = (selectedInterviewers || [])
//   //     .map((i) => String(i.contact?._id || i._id))
//   //     .sort();

//   //   if (JSON.stringify(oldIds) !== JSON.stringify(newIds)) {
//   //     changes.interviewersChanged = true;
//   //     changes.anyChange = true;
//   //   }
//   // }

//   // Instructions change (optional)
//   if (
//     compareInstructions &&
//     incomingRound.instructions !== undefined &&
//     incomingRound.instructions !== existingRound.instructions
//   ) {
//     changes.instructionsChanged = true;
//     changes.anyChange = true;
//   }

//   // Questions change (optional – deep compare)
//   if (compareQuestions) {
//     const oldQuestions = JSON.stringify(existingRound.questions || []);
//     const newQuestions = JSON.stringify(incomingRound.questions || []);

//       const existingQuestions = await interviewQuestions.find({
//   interviewId : existingRound?.interviewId,
//   roundId: existingRound?._id,
// });

//     if (oldQuestions !== newQuestions) {
//       changes.questionsChanged = true;
//       changes.anyChange = true;
//     }
//   }

//   return changes;
// }

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

  // console.log("detectRoundChanges", { existingRound, incomingRound });

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
          (q) => `${q.questionId}|${q.source}|${q.order}|${q.mandatory}`
        )
      );
      console.log("existingSet", existingSet);

      const incomingSet = new Set(
        incomingQuestions.map(
          (q) => `${q.questionId}|${q.source}|${q.order}|${q.mandatory}`
        )
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

createRequest = async (req, res) => {
  // Mark that logging will be handled by this controller
  res.locals.loggedByController = true;
  res.locals.processName = "Create Interview Request";

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
    res.locals.logData = {
      tenantId: tenantId || "",
      ownerId: ownerId || "",
      processName: "Create Interview Request",
      requestBody: req.body,
      status: "success",
      message: "Interview request created successfully",
      responseBody: newRequest,
    };

    res.status(201).json({
      message: "Interview request created successfully",
      data: newRequest,
    });
  } catch (error) {
    console.error("Error creating interview request:", error);
    // Structured internal log for error case
    res.locals.logData = {
      tenantId: req.body?.tenantId || "",
      ownerId: req.body?.ownerId || "",
      processName: "Create Interview Request",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const triggerInterviewRoundStatusUpdated = async (
  round,
  oldStatus,
  interview = null
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
      interview.tenantId
    );

    console.log(
      `Webhook triggered for interview round ${round._id} status change: ${oldStatus} -> ${round.status}`
    );
  } catch (error) {
    console.error("Error in triggerInterviewRoundStatusUpdated:", error);
  }
};

module.exports = {
  saveInterviewRound,
  updateInterviewRound,
  updateInterviewRoundStatus,
  buildSmartRoundUpdate,
  // parseDateTimeString,
};
