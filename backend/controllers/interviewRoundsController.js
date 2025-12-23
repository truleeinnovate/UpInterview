const { InterviewRounds } = require("../models/Interview/InterviewRounds");

const {
  sendInterviewRoundCancellationEmails,
} = require("./EmailsController/interviewEmailController");

// Update interview round status
const updateInterviewRoundStatus = async (req, res) => {
  try {
    const { roundId } = req.params;
    const {
      status,
      //   currentAction,
      //   currentActionReason,
      //   previousAction,
      //   previousActionReason,
      //   rejectionReason,
      //   settlementStatus,
      //   settlementDate,
      //   settlementTransactionId,
      //   holdTransactionId,
    } = req.body;

    const { actingAsUserId, actingAsTenantId } = res.locals.auth;

    if (!actingAsUserId || !actingAsTenantId) {
      return res
        .status(400)
        .json({ message: "OwnerId or TenantId ID is required" });
    }

    // Validate roundId
    if (!roundId) {
      return res.status(400).json({
        success: false,
        message: "roundId is required",
      });
    }

    // Validate status if provided
    const validStatuses = [
      "Draft",
      "RequestSent",
      "Scheduled",
      "InProgress",
      "Completed",
      "InCompleted",
      "Rescheduled",
      "Rejected",
      "Selected",
      "Cancelled",
      "Incomplete",
      "NoShow",
    ];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Validate currentAction if provided
    // const validActions = [
    //   "Candidate_NoShow",
    //   "Interviewer_NoShow",
    //   "Technical_Issue",
    // ];

    // if (currentAction && !validActions.includes(currentAction)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: `Invalid currentAction. Must be one of: ${validActions.join(
    //       ", "
    //     )}`,
    //   });
    // }

    // Validate previousAction if provided
    // if (previousAction && !validActions.includes(previousAction)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: `Invalid previousAction. Must be one of: ${validActions.join(
    //       ", "
    //     )}`,
    //   });
    // }

    // Validate settlementStatus if provided
    // const validSettlementStatuses = ["pending", "completed", "failed"];
    // if (
    //   settlementStatus &&
    //   !validSettlementStatuses.includes(settlementStatus)
    // ) {
    //   return res.status(400).json({
    //     success: false,
    //     message: `Invalid settlementStatus. Must be one of: ${validSettlementStatuses.join(
    //       ", "
    //     )}`,
    //   });
    // }

    // Build update object
    const updateData = {};

    if (status !== undefined) updateData.status = status;
    // if (currentAction !== undefined) updateData.currentAction = currentAction;
    // if (currentActionReason !== undefined)
    //   updateData.currentActionReason = currentActionReason;
    // if (previousAction !== undefined)
    //   updateData.previousAction = previousAction;
    // if (previousActionReason !== undefined)
    //   updateData.previousActionReason = previousActionReason;
    // if (rejectionReason !== undefined)
    //   updateData.rejectionReason = rejectionReason;
    // if (settlementStatus !== undefined)
    //   updateData.settlementStatus = settlementStatus;
    // if (settlementDate !== undefined)
    //   updateData.settlementDate = settlementDate;
    // if (settlementTransactionId !== undefined)
    //   updateData.settlementTransactionId = settlementTransactionId;
    // if (holdTransactionId !== undefined)
    //   updateData.holdTransactionId = holdTransactionId;

    // Update the round
    const updatedRound = await InterviewRounds.findByIdAndUpdate(
      roundId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("interviewId", "title candidateName")
      .populate("interviewers", "firstName lastName email");

    if (!updatedRound) {
      return res.status(404).json({
        success: false,
        message: "Interview round not found",
      });
    }
    // console.log("updatedRound", updatedRound);

    // If round was cancelled, append a history entry capturing the cancellation time
    if (status === "Cancelled" && updatedRound && updatedRound.dateTime) {
      const scheduledAt = new Date(updatedRound.dateTime);

      if (!isNaN(scheduledAt.getTime())) {
        await InterviewRounds.findByIdAndUpdate(
          roundId,
          {
            $push: {
              history: {
                scheduledAt,
                action: "Cancelled",
                reasonCode: undefined,
                comment: undefined,
                participants: [],
                updatedBy: actingAsUserId,
                updatedAt: new Date(),
              },
            },
          },
          { new: true }
        );
      }
    }

    let result = await sendInterviewRoundCancellationEmails(
      {
        body: {
          interviewId: updatedRound?.interviewId,
          roundId: updatedRound?._id,
        },
      },
      {
        status: () => ({
          json: () => {},
        }),
        locals: {},
      }
    );

    console.log("result sendInterviewRoundCancellationEmails", result);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Interview round not found",
      });
    }

    // Optional: Add to history if status changed to Rescheduled or Cancelled
    // if (status === "Rescheduled" || status === "Cancelled") {
    //   // You can add logic here to create a history entry if needed
    // }

    res.status(200).json({
      success: true,
      message: "Interview round status updated successfully",
      //   data: {
      //     roundId: updatedRound._id,
      //     sequence: updatedRound.sequence,
      //     roundTitle: updatedRound.roundTitle,
      //     status: updatedRound.status,
      //     currentAction: updatedRound.currentAction,
      //     previousAction: updatedRound.previousAction,
      //     settlementStatus: updatedRound.settlementStatus,
      //     interviewId: updatedRound.interviewId,
      //     interviewers: updatedRound.interviewers,
      //   },
    });
  } catch (error) {
    console.error("Error updating interview round status:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid roundId format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

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

module.exports = { updateInterviewRoundStatus };
