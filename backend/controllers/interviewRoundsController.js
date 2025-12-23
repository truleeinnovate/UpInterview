const { InterviewRounds } = require("../models/Interview/InterviewRounds");

const {
  sendInterviewRoundCancellationEmails,
} = require("./EmailsController/interviewEmailController");

// Update interview round status
const updateInterviewRoundStatus = async (req, res) => {
  try {
    const { roundId } = req.params;
    // const {
    //   status,
    //   //   currentAction,
    //   //   currentActionReason,
    //   //   previousAction,
    //   //   previousActionReason,
    //   //   rejectionReason,
    //   //   settlementStatus,
    //   //   settlementDate,
    //   //   settlementTransactionId,
    //   //   holdTransactionId,
    // } = req.body;

    console.log(" req.body status", req.body);

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

    if (req?.body?.status && !validStatuses.includes(req?.body?.status)) {
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

    if (req.body?.status !== undefined) updateData.status = req.body?.status;

    if (req.body?.status === "Cancelled") {
      updateData.currentActionReason = req.body?.cancellationReason;
      updateData.comments = req.body?.comment || null;
      updateData.currentAction = req.body?.status;
    }

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
    console.log("updatedRound", updatedRound);

    // If round was cancelled, append a history entry capturing the cancellation time
    if (
      req.body?.status === "Cancelled" &&
      updatedRound &&
      updatedRound.dateTime
    ) {
      // const scheduledAt = new Date(updatedRound.dateTime);
      const scheduledAt = parseDateTimeString(updatedRound.dateTime);

      console.log("scheduledAt ", scheduledAt);

      if (!isNaN(scheduledAt.getTime())) {
        await InterviewRounds.findByIdAndUpdate(
          roundId,
          {
            $push: {
              history: {
                scheduledAt,
                action: "Cancelled",
                reasonCode: req?.body?.cancellationReason,
                comment:
                  req?.body?.cancellationReason === "Other"
                    ? req?.body?.comment
                    : null,
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
