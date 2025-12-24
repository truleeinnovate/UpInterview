const { InterviewRounds } = require("../models/Interview/InterviewRounds");

const {
  sendInterviewRoundCancellationEmails,
} = require("./EmailsController/interviewEmailController");

// Update interview round status
// const updateInterviewRoundStatus = async (req, res) => {
//   try {
//     const { roundId } = req.params;
//     // const {
//     //   status,
//     //   //   currentAction,
//     //   //   currentActionReason,
//     //   //   previousAction,
//     //   //   previousActionReason,
//     //   //   rejectionReason,
//     //   //   settlementStatus,
//     //   //   settlementDate,
//     //   //   settlementTransactionId,
//     //   //   holdTransactionId,
//     // } = req.body;

//     console.log(" req.body status", req.body);

//     const { actingAsUserId, actingAsTenantId } = res.locals.auth;

//     if (!actingAsUserId || !actingAsTenantId) {
//       return res
//         .status(400)
//         .json({ message: "OwnerId or TenantId ID is required" });
//     }

//     // Validate roundId
//     if (!roundId) {
//       return res.status(400).json({
//         success: false,
//         message: "roundId is required",
//       });
//     }

//     // Validate status if provided
//     const validStatuses = [
//       "Draft",
//       "RequestSent",
//       "Scheduled",
//       "InProgress",
//       "Completed",
//       "InCompleted",
//       "Rescheduled",
//       "Rejected",
//       "Selected",
//       "Cancelled",
//       "Incomplete",
//       "NoShow",
//     ];

//     if (req?.body?.status && !validStatuses.includes(req?.body?.status)) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
//       });
//     }

//     // Validate currentAction if provided
//     // const validActions = [
//     //   "Candidate_NoShow",
//     //   "Interviewer_NoShow",
//     //   "Technical_Issue",
//     // ];

//     // if (currentAction && !validActions.includes(currentAction)) {
//     //   return res.status(400).json({
//     //     success: false,
//     //     message: `Invalid currentAction. Must be one of: ${validActions.join(
//     //       ", "
//     //     )}`,
//     //   });
//     // }

//     // Validate previousAction if provided
//     // if (previousAction && !validActions.includes(previousAction)) {
//     //   return res.status(400).json({
//     //     success: false,
//     //     message: `Invalid previousAction. Must be one of: ${validActions.join(
//     //       ", "
//     //     )}`,
//     //   });
//     // }

//     // Validate settlementStatus if provided
//     // const validSettlementStatuses = ["pending", "completed", "failed"];
//     // if (
//     //   settlementStatus &&
//     //   !validSettlementStatuses.includes(settlementStatus)
//     // ) {
//     //   return res.status(400).json({
//     //     success: false,
//     //     message: `Invalid settlementStatus. Must be one of: ${validSettlementStatuses.join(
//     //       ", "
//     //     )}`,
//     //   });
//     // }

//     // Build update object
//     const updateData = {};

//     if (req.body?.status !== undefined) updateData.status = req.body?.status;

//     if (req.body?.status === "Cancelled") {
//       updateData.currentActionReason = req.body?.cancellationReason;
//       updateData.comments = req.body?.comment || null;
//       updateData.currentAction = req.body?.status;
//     }

//     // Update the round
//     const updatedRound = await InterviewRounds.findByIdAndUpdate(
//       roundId,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     )
//       .populate("interviewId", "title candidateName")
//       .populate("interviewers", "firstName lastName email");

//     if (!updatedRound) {
//       return res.status(404).json({
//         success: false,
//         message: "Interview round not found",
//       });
//     }
//     console.log("updatedRound", updatedRound);

//     // If round was cancelled, append a history entry capturing the cancellation time
//     if (
//       req.body?.status === "Cancelled" &&
//       updatedRound &&
//       updatedRound.dateTime
//     ) {
//       // const scheduledAt = new Date(updatedRound.dateTime);
//       const scheduledAt = parseDateTimeString(updatedRound.dateTime);

//       console.log("scheduledAt ", scheduledAt);

//       if (!isNaN(scheduledAt.getTime())) {
//         await InterviewRounds.findByIdAndUpdate(
//           roundId,
//           {
//             $push: {
//               history: {
//                 scheduledAt,
//                 action: "Cancelled",
//                 reasonCode: req?.body?.cancellationReason,
//                 comment:
//                   req?.body?.cancellationReason === "Other"
//                     ? req?.body?.comment
//                     : null,
//                 participants: [],
//                 updatedBy: actingAsUserId,
//                 updatedAt: new Date(),
//               },
//             },
//           },
//           { new: true }
//         );
//       }
//     }

//     let result = await sendInterviewRoundCancellationEmails(
//       {
//         body: {
//           interviewId: updatedRound?.interviewId,
//           roundId: updatedRound?._id,
//         },
//       },
//       {
//         status: () => ({
//           json: () => {},
//         }),
//         locals: {},
//       }
//     );

//     console.log("result sendInterviewRoundCancellationEmails", result);

//     if (!result) {
//       return res.status(404).json({
//         success: false,
//         message: "Interview round not found",
//       });
//     }

//     // Optional: Add to history if status changed to Rescheduled or Cancelled
//     // if (status === "Rescheduled" || status === "Cancelled") {
//     //   // You can add logic here to create a history entry if needed
//     // }

//     res.status(200).json({
//       success: true,
//       message: "Interview round status updated successfully",
//       //   data: {
//       //     roundId: updatedRound._id,
//       //     sequence: updatedRound.sequence,
//       //     roundTitle: updatedRound.roundTitle,
//       //     status: updatedRound.status,
//       //     currentAction: updatedRound.currentAction,
//       //     previousAction: updatedRound.previousAction,
//       //     settlementStatus: updatedRound.settlementStatus,
//       //     interviewId: updatedRound.interviewId,
//       //     interviewers: updatedRound.interviewers,
//       //   },
//     });
//   } catch (error) {
//     console.error("Error updating interview round status:", error);

//     if (error.name === "ValidationError") {
//       return res.status(400).json({
//         success: false,
//         message: "Validation error",
//         error: error.message,
//       });
//     }

//     if (error.name === "CastError") {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid roundId format",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

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
        { status: () => ({ json: () => {} }), locals: {} }
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

// Helper function to parse dateTime string
const parseDateTimeString = (dateTimeStr) => {
  if (!dateTimeStr) return null;

  try {
    // Check the format first
    if (dateTimeStr.includes(" - ")) {
      // Format: '27-12-2025 06:13 PM - 07:13 PM'
      // Extract the start date part
      const startDateTimeStr = dateTimeStr.split(" - ")[0]; // '27-12-2025 06:13 PM'

      // Parse day-month-year time with AM/PM
      const [datePart, timePart, meridiem] = startDateTimeStr.split(" ");
      const [day, month, year] = datePart.split("-").map(Number);

      let [hours, minutes] = timePart.split(":").map(Number);

      // Convert to 24-hour format
      if (meridiem === "PM" && hours < 12) hours += 12;
      if (meridiem === "AM" && hours === 12) hours = 0;

      // Create Date object (month is 0-indexed in JavaScript)
      return new Date(year, month - 1, day, hours, minutes);
    } else {
      // Try direct Date parsing for other formats
      return new Date(dateTimeStr);
    }
  } catch (error) {
    console.error("Error parsing dateTime:", error);
    return null;
  }
};

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
  existingRound,
  body,
  actingAsUserId,
  changes,
}) {
  if (!changes?.anyChange) return null;

  const update = {
    $set: {},
    $push: { history: [] }, // We will push multiple entries if needed
  };
  const now = new Date();

  // Helper to safely add a history entry
  const addHistoryEntry = (
    action,
    reasonCode = null,
    comment = null,
    interviewers = []
  ) => {
    update.$push.history.push({
      scheduledAt: existingRound.dateTime || null, // current scheduled time (String)
      action,
      reasonCode: reasonCode || null,
      comment: comment || null,
      participants: [], // extend later if needed
      interviewers: [],
      createdBy: actingAsUserId,
      // updatedAt: now,
    });
  };

  // 1. Generic field updates (skip 'status' — handled separately)
  Object.keys(body).forEach((key) => {
    if (body[key] !== undefined && key !== "status") {
      update.$set[key] = body[key];
    }
  });

  // 2. Status change handling
  if (changes.statusChanged && body.status) {
    // Always track action flow
    update.$set.previousAction = existingRound.currentAction || null;
    update.$set.currentAction = body.status;
    update.$set.status = body.status;

    // Special handling for Cancelled
    if (body.status === "Cancelled") {
      update.$set.currentActionReason = body.cancellationReason || null;
      update.$set.comments =
        body.cancellationReason === "Other" ? body.comment || null : null;

      addHistoryEntry("Cancelled", body.cancellationReason, body.comment);
    } else if (body.status === "RequestSent") {
      // Special handling for Scheduled
      if (body.status === "RequestSent") {
        update.$set.currentActionReason =
          body.cancellationReason || "time_changed";
        update.$set.comments =
          body.cancellationReason === "Other" ? body.comment || null : null;

        addHistoryEntry("Cancelled", body.cancellationReason, body.comment);
      }
    } else if (body.status === "Scheduled") {
      update.$set.currentActionReason =
        body.cancellationReason || "time_changed";
      update.$set.comments =
        body.cancellationReason === "Other" ? body.comment || null : null;

      addHistoryEntry("Scheduled", body.cancellationReason, body.comment);
    } else if (body.status === "Rescheduled") {
      update.$set.currentActionReason =
        body.cancellationReason || "time_changed";
      update.$set.comments =
        body.cancellationReason === "Other" ? body.comment || null : null;

      addHistoryEntry("Rescheduled", body.cancellationReason, body.comment);
    }
    //  else {
    //   // Other status changes (Completed, NoShow, etc.)
    //   addHistoryEntry(body.status);
    // }
  }

  // 3. Reschedule (dateTime changed) — only valid when currently Scheduled
  if (changes.dateTimeChanged && existingRound.status === "Scheduled") {
    addHistoryEntry(
      "Rescheduled",
      body.rescheduleReason || "time_changed",
      null
    );

    // Update action tracking
    update.$set.previousAction = existingRound.currentAction || null;
    update.$set.currentAction = "Rescheduled";
    update.$set.currentActionReason = body.rescheduleReason || "time_changed";
  }

  // 4. Interviewers changed
  // if (changes.interviewersChanged) {
  //   addHistoryEntry("Interviewer_Changed");

  //   // Optional: force status to RequestSent (uncomment if desired here)
  //   // update.$set.status = "RequestSent";
  // }

  // Clean up empty operators
  if (update.$push.history.length === 0) {
    delete update.$push;
  }

  if (Object.keys(update.$set).length === 0) {
    delete update.$set;
  }

  // If nothing left to update, return null
  if (!update.$set && !update.$push) {
    return null;
  }

  return update;
}

/**
 * Builds Mongo update payload for InterviewRound based on status
 */
// function buildRoundUpdatePayload({ existingRound, body, actingAsUserId }) {
//   const update = { $set: {}, $push: {} };
//   const now = new Date();

//   const status = body.status;

//   if (!status) return null;

//   // Always track action transition
//   update.$set.previousAction = existingRound.currentAction || null;
//   update.$set.currentAction = status;
//   update.$set.status = status;

//   /* ------------------------------------
//    * STATUS-SPECIFIC RULES
//    * ---------------------------------- */
//   switch (status) {
//     case "Cancelled": {
//       update.$set.currentActionReason = body.cancellationReason || null;
//       update.$set.comments =
//         body.cancellationReason === "Other" ? body.comment || null : null;

//       const scheduledAt = parseDateTimeString(existingRound.dateTime);

//       if (!isNaN(scheduledAt?.getTime())) {
//         update.$push.history = {
//           scheduledAt,
//           action: "Cancelled",
//           reasonCode: body.cancellationReason,
//           comment:
//             body.cancellationReason === "Other" ? body.comment || null : null,
//           participants: [],
//           updatedBy: actingAsUserId,
//           updatedAt: now,
//         };
//       }
//       break;
//     }

//     case "Rescheduled": {
//       const scheduledAt = parseDateTimeString(existingRound.dateTime);

//       update.$push.history = {
//         scheduledAt,
//         action: "Rescheduled",
//         reasonCode: body.rescheduleReason || null,
//         comment: body.comment || null,
//         participants: [],
//         updatedBy: actingAsUserId,
//         updatedAt: now,
//       };
//       break;
//     }

//     case "Scheduled": {
//       const scheduledAt = parseDateTimeString(body.dateTime);

//       if (!isNaN(scheduledAt?.getTime())) {
//         update.$push.history = {
//           scheduledAt,
//           action: "Scheduled",
//           participants: [],
//           updatedBy: actingAsUserId,
//           updatedAt: now,
//         };
//       }
//       break;
//     }

//     case "NoShow": {
//       update.$set.currentActionReason = body.noShowReason || null;
//       break;
//     }

//     case "Completed":
//     case "InProgress":
//     case "InCompleted":
//     case "Incomplete":
//     default:
//       // no history needed
//       break;
//   }

//   // Clean empty operators
//   if (!Object.keys(update.$push).length) delete update.$push;
//   if (!Object.keys(update.$set).length) delete update.$set;

//   return update;
// }

// const getAllInterviewRounds = async (req, res) => {
//   try {
//     const rounds = await InterviewRounds.find()
//       .populate({
//         path: 'interviewId',
//         populate: [
//           { path: 'candidateId', model: 'Candidate' },
//           { path: 'positionId', model: 'Position' }
//         ]
//       });
//     res.status(200).json(rounds);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching interview rounds', error: error.message });
//   }
// };

module.exports = {
  updateInterviewRoundStatus,
  buildSmartRoundUpdate,
  // parseDateTimeString,
};
