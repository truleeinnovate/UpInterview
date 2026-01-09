const {
  CandidateAssessment,
} = require("../models/Assessment/candidateAssessment");
const { Candidate } = require("../models/candidate.js");
const { generateOTP } = require("../utils/generateOtp");
const Otp = require("../models/Otp");
const mongoose = require("mongoose");
const cron = require("node-cron");
const ScheduleAssessment = require("../models/Assessment/assessmentsSchema");
const {
  createAssessmentSubmissionNotification,
  createAssessmentStatusUpdateNotification,
} = require("./PushNotificationControllers/pushNotificationAssessmentController");

const {
  handleAssessmentStatusChange,
} = require("../services/assessmentUsageService");

exports.getCandidateAssessmentBasedOnId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send({ message: "id is missing" });
    }
    const document = await CandidateAssessment.findById(id);
    if (!document) {
      return res
        .status(400)
        .send({
          message: `no document found for given candidate assessment id:${id}`,
        });
    }
    return res.status(200).send({
      message: "Retrieved candidate Assessment",
      success: true,
      candidateAssessment: document,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to get candidate assessment details",
      error: error.message,
    });
  }
};

exports.getPublicCandidateDetailsByAssessmentId = async (req, res) => {
  try {
    const { candidateAssessmentId } = req.params;

    if (!candidateAssessmentId) {
      return res.status(400).json({
        success: false,
        message: "Candidate assessment ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(candidateAssessmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate assessment ID format",
      });
    }

    const candidateAssessment = await CandidateAssessment.findById(
      candidateAssessmentId
    ).select("candidateId");

    if (!candidateAssessment) {
      return res.status(404).json({
        success: false,
        message: "Candidate assessment not found",
      });
    }

    const candidate = await Candidate.findById(
      candidateAssessment.candidateId
    )
      .select("FirstName LastName Email Phone ImageData")
      .lean();

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    const publicCandidate = {
      _id: candidate._id,
      FirstName: candidate.FirstName,
      LastName: candidate.LastName,
      Email: candidate.Email,
      Phone: candidate.Phone,
      ImageData: candidate.ImageData || null,
    };

    return res.status(200).json(publicCandidate);
  } catch (error) {
    console.error(
      "[CandidateAssessment] Error fetching public candidate details:",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Failed to fetch candidate details",
      error: error.message,
    });
  }
};

exports.verifyOtp = async (req, res) => {
  const { candidateAssessmentId, otp } = req.body;

  if (!candidateAssessmentId || !otp) {
    return res.status(400).json({
      isValid: false,
      message: "Missing required fields.",
    });
  }

  try {
    const storedOtp = await Otp.findOne({ candidateAssessmentId });
    if (!storedOtp) {
      return res.status(404).json({
        isValid: false,
        message: "Invalid OTP. Please request a new one.",
      });
    }

    if (new Date() > storedOtp.expiresAt) {
      await Otp.findByIdAndDelete(storedOtp._id);
      return res.status(410).json({
        isValid: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    const isValid = String(storedOtp.otp) === String(otp);
    if (isValid) {
      await Otp.findByIdAndDelete(storedOtp._id);
      return res.status(200).json({
        isValid: true,
        message: "OTP is valid.",
      });
    } else {
      return res.status(400).json({
        isValid: false,
        message: "Invalid OTP.",
      });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({
      isValid: false,
      message: "Internal server error. Please try again.",
    });
  }
};

function verifyAnswer(question, selectedAnswer) {
  if (!question) {
    console.error("Question is undefined in verifyAnswer");
    return false;
  }
  const correctAnswer = question.correctAnswer;
  const questionType = question.questionType;
  if (selectedAnswer === undefined || selectedAnswer === null) {
    return false;
  }
  const normalizeAnswer = (answer) => {
    if (answer === null || answer === undefined) return '';
    return String(answer).trim().toLowerCase();
  };
  const normalizedSelected = normalizeAnswer(selectedAnswer);
  const normalizedCorrect = normalizeAnswer(correctAnswer);
  let isCorrect = false;

  switch (questionType) {
    case 'MCQ':
    case 'Multiple Choice':
      isCorrect = normalizedSelected === normalizedCorrect;
      break;

    case 'Short Answer':
    case 'Long Answer':
      isCorrect = normalizedSelected === normalizedCorrect;
      break;

    case 'Number':
    case 'Numeric':
      isCorrect = parseFloat(normalizedSelected) === parseFloat(normalizedCorrect);
      break;

    case 'Boolean':
      isCorrect = Boolean(normalizedSelected) === Boolean(normalizedCorrect);
      break;

    default:
      isCorrect = normalizedSelected === normalizedCorrect;
  }
  return isCorrect;
}
exports.submitCandidateAssessment = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Submit Candidate Assessment";

  const session = await mongoose.startSession();
  
  // Set a timeout for the transaction
  const transactionOptions = {
    readPreference: 'primary',
    readConcern: { level: 'snapshot' },
    writeConcern: { w: 'majority' }
  };

  try {
    let oldStatus;
    let updatedAssessment;
    await session.withTransaction(async () => {
    const {
      candidateAssessmentId,
      scheduledAssessmentId,
      candidateId,
      status,
      sections,
      submittedAt
    } = req.body;

    // Input validation
    if (!candidateAssessmentId || !sections || !submittedAt) {
      console.error("Missing required fields in request");
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    let candidateAssessment = await CandidateAssessment.findById(
      new mongoose.Types.ObjectId(candidateAssessmentId)
    ).session(session).populate('scheduledAssessmentId');

    if (!candidateAssessment) {
      return res.status(404).json({
        success: false,
        message: "Candidate assessment not found",
      });
    }

    const processedSections = await Promise.all(
      sections.map(async (section, sectionIndex) => {

        console.log("section", section);

        const processedAnswers = await Promise.all(
          section.questions.map(async (question) => {

            const isCorrect = question.isCorrect;
            const score = question.score || 0;

            return {
              questionId: question.questionId,
              userAnswer: question.userAnswer,
              correctAnswer: question.correctAnswer, // Store the correct answer
              isCorrect,
              score,
              isAnswerLater: question.isAnswerLater || false,
              submittedAt: new Date(question.submittedAt || Date.now())
            };
          })
        );

        const sectionScore = processedAnswers.reduce((sum, answer) => sum + (answer.score || 0), 0);
        const sectionPassScore = Number(section.passScore) || 0;
        const sectionResult = sectionScore >= sectionPassScore ? "pass" : "fail";

        return {
          sectionId: section.sectionId,
          sectionName: section.sectionName,
          totalScore: sectionScore,
          passScore: sectionPassScore,
          sectionResult,
          sectionPassed: sectionResult === "pass",
          Answers: processedAnswers  // FIX: Only Answers (removed questions)
        };
      })
    );

    // Calculate overall assessment result
    const totalScore = processedSections.reduce((total, section) => total + section.totalScore, 0);
    const allSectionsPassed = processedSections.every(section => section.sectionResult === 'pass');
    const overallResult = allSectionsPassed ? 'pass' : 'fail';
    const remainingTime = req.body.remainingTime || null;
    // Update candidate assessment
    oldStatus = candidateAssessment.status;
    const updateData = {
      status: overallResult, // Set status to 'pass' or 'fail' instead of 'completed'
      sections: processedSections,
      totalScore,
      submittedAt: new Date(submittedAt),
      endedAt: new Date(),
      remainingTime,
      overallResult,
      updatedAt: new Date()
    };

    updatedAssessment = await CandidateAssessment.findByIdAndUpdate(
      candidateAssessmentId,
      { $set: updateData },
      { new: true, session }
    ).populate('scheduledAssessmentId');

    if (!updatedAssessment) {
      throw new Error("Failed to update candidate assessment");
    }

    // Transaction will be committed automatically if no errors are thrown
    }, transactionOptions);

    // End the session after transaction is complete
    await session.endSession();

    // Process notifications outside of transaction
    if (oldStatus !== updatedAssessment.status) {
      try {
        await createAssessmentStatusUpdateNotification(
          updatedAssessment,
          oldStatus,
          updatedAssessment.status
        );

        await handleAssessmentStatusChange(
          updatedAssessment._id,
          oldStatus,
          updatedAssessment.status
        );

        await createAssessmentSubmissionNotification(updatedAssessment);
      } catch (notificationError) {
        console.error("Error in notification handling:", notificationError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Assessment submitted successfully",
      data: updatedAssessment,
    });

  } catch (error) {
    // Check if session is still active before trying to abort
    if (session.inTransaction()) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error('Error aborting transaction:', abortError);
      }
    }

    // End the session if it's still active
    try {
      if (session) await session.endSession();
    } catch (sessionError) {
      console.error('Error ending session:', sessionError);
    }

    console.error("Error in submitCandidateAssessment:", {
      error: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });

    // More specific error messages based on error type
    let errorMessage = "Failed to submit assessment";
    let statusCode = 500;

    if (error.code === 2 || error.message.includes('Transaction is not active')) {
      errorMessage = "Transaction timed out. Please try again.";
      statusCode = 408; // Request Timeout
    } else if (error.name === 'ValidationError') {
      errorMessage = `Validation error: ${error.message}`;
      statusCode = 400;
    } else if (error.name === 'MongoError' && error.code === 112) {
      errorMessage = "Database write operation conflict. Please try again.";
      statusCode = 409; // Conflict
    }

    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.message,
    });
  }
};

// Extend candidate assessment expiry date
exports.extendCandidateAssessment = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Extend Candidate Assessment";

  try {
    const { candidateAssessmentIds, extensionDays } = req.body;

    if (
      !candidateAssessmentIds ||
      !Array.isArray(candidateAssessmentIds) ||
      candidateAssessmentIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid candidate assessment IDs",
      });
    }

    if (!extensionDays || extensionDays < 1 || extensionDays > 10) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid extension days (1-10 days)",
      });
    }

    const results = [];
    const errors = [];

    for (const candidateAssessmentId of candidateAssessmentIds) {
      try {
        const candidateAssessment = await CandidateAssessment.findById(
          candidateAssessmentId
        );

        if (!candidateAssessment) {
          errors.push(
            `Candidate assessment not found: ${candidateAssessmentId}`
          );
          continue;
        }

        // Check if assessment can be extended (not completed, cancelled, or already extended)
        // Allow only 1 extension per assessment
        if (
          ["completed", "cancelled", "extended"].includes(
            candidateAssessment.status
          )
        ) {
          errors.push(
            `Assessment ${candidateAssessmentId} cannot be extended (status: ${candidateAssessment.status})`
          );
          continue;
        }

        // Check if within extension window (24-72 hours before expiry)
        const now = new Date();
        const expiryDate = new Date(candidateAssessment.expiryAt);
        const timeUntilExpiry = expiryDate.getTime() - now.getTime();
        const hoursUntilExpiry = timeUntilExpiry / (1000 * 60 * 60);

        // Allow extension only if within 24-72 hours before expiry
        if (hoursUntilExpiry < 24 || hoursUntilExpiry > 72) {
          errors.push(
            `Assessment ${candidateAssessmentId} can only be extended 24-72 hours before expiry. Current time until expiry: ${Math.round(
              hoursUntilExpiry
            )} hours`
          );
          continue;
        }

        // Calculate new expiry date
        const currentExpiry = new Date(candidateAssessment.expiryAt);
        const newExpiry = new Date(
          currentExpiry.getTime() + extensionDays * 24 * 60 * 60 * 1000
        );

        // Update the candidate assessment
        const oldStatus = candidateAssessment.status;
        candidateAssessment.expiryAt = newExpiry;
        candidateAssessment.status = "extended";

        await candidateAssessment.save();

        // Create notification for status update
        if (oldStatus !== "extended") {
          try {
            await createAssessmentStatusUpdateNotification(
              candidateAssessment,
              oldStatus,
              "extended"
            );
          } catch (notificationError) {
            console.error(
              "[ASSESSMENT] Error creating extension notification:",
              notificationError
            );
          }
        }

        results.push({
          candidateAssessmentId,
          newExpiryDate: newExpiry,
          status: "extended",
        });
      } catch (error) {
        console.error(
          `Error extending assessment ${candidateAssessmentId}:`,
          error
        );
        errors.push(
          `Failed to extend assessment ${candidateAssessmentId}: ${error.message}`
        );
      }
    }

    res.locals.logData = {
      tenantId: "",
      ownerId: "",
      processName: "Extend Candidate Assessment",
      requestBody: req.body,
      status: "success",
      message: `Successfully extended ${results.length} assessment(s)`,
      responseBody: {
        extended: results,
        errors: errors,
      },
    };

    return res.status(200).json({
      success: true,
      message: `Successfully extended ${results.length} assessment(s)`,
      data: {
        extended: results,
        errors: errors,
      },
    });
  } catch (error) {
    console.error("Error extending candidate assessments:", error);

    res.locals.logData = {
      tenantId: "",
      ownerId: "",
      processName: "Extend Candidate Assessment",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    return res.status(500).json({
      success: false,
      message: "Failed to extend assessments",
      error: error.message,
    });
  }
};

// Cancel candidate assessments
exports.cancelCandidateAssessments = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Cancel Candidate Assessments";

  try {
    const { candidateAssessmentIds } = req.body;

    if (
      !candidateAssessmentIds ||
      !Array.isArray(candidateAssessmentIds) ||
      candidateAssessmentIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid candidate assessment IDs",
      });
    }

    const results = [];
    const errors = [];

    for (const candidateAssessmentId of candidateAssessmentIds) {
      try {
        const candidateAssessment = await CandidateAssessment.findById(
          candidateAssessmentId
        );

        if (!candidateAssessment) {
          errors.push(
            `Candidate assessment not found: ${candidateAssessmentId}`
          );
          continue;
        }

        // Check if assessment can be cancelled (not already completed or cancelled)
        // Allow cancelling extended assessments (1 chance to cancel)
        if (["completed", "cancelled"].includes(candidateAssessment.status)) {
          errors.push(
            `Assessment ${candidateAssessmentId} cannot be cancelled (status: ${candidateAssessment.status})`
          );
          continue;
        }

        // Update the candidate assessment status
        const oldStatus = candidateAssessment.status;
        candidateAssessment.status = "cancelled";
        candidateAssessment.isActive = false;

        await candidateAssessment.save();

        // Create notification for cancellation
        if (oldStatus !== "cancelled") {
          try {
            await createAssessmentStatusUpdateNotification(
              candidateAssessment,
              oldStatus,
              "cancelled"
            );
          } catch (notificationError) {
            console.error(
              "[ASSESSMENT] Error creating cancellation notification:",
              notificationError
            );
          }

          // Update assessment usage when status changes to cancelled
          try {
            await handleAssessmentStatusChange(
              candidateAssessmentId,
              oldStatus,
              "cancelled"
            );
          } catch (usageError) {
            console.error(
              "[ASSESSMENT] Error updating assessment usage:",
              usageError
            );
            // Continue execution even if usage update fails
          }
        }

        results.push({
          candidateAssessmentId,
          status: "cancelled",
        });
      } catch (error) {
        console.error(
          `Error cancelling assessment ${candidateAssessmentId}:`,
          error
        );
        errors.push(
          `Failed to cancel assessment ${candidateAssessmentId}: ${error.message}`
        );
      }
    }

    res.locals.logData = {
      tenantId: "",
      ownerId: "",
      processName: "Cancel Candidate Assessments",
      requestBody: req.body,
      status: "success",
      message: `Successfully cancelled ${results.length} assessment(s)`,
      responseBody: {
        cancelled: results,
        errors: errors,
      },
    };

    return res.status(200).json({
      success: true,
      message: `Successfully cancelled ${results.length} assessment(s)`,
      data: {
        cancelled: results,
        errors: errors,
      },
    });
  } catch (error) {
    console.error("Error cancelling candidate assessments:", error);

    res.locals.logData = {
      tenantId: "",
      ownerId: "",
      processName: "Cancel Candidate Assessments",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    return res.status(500).json({
      success: false,
      message: "Failed to cancel assessments",
      error: error.message,
    });
  }
};

// Function to update schedule assessment status based on candidate assessment statuses
exports.updateScheduleAssessmentStatus = async (scheduleAssessmentId) => {
  try {
    const scheduleAssessment = await ScheduleAssessment.findById(
      scheduleAssessmentId
    );
    if (!scheduleAssessment) {
      return null;
    }

    // Get all candidate assessments for this schedule
    const candidateAssessments = await CandidateAssessment.find({
      scheduledAssessmentId: scheduleAssessmentId,
    });

    if (!candidateAssessments || candidateAssessments.length === 0) {
      return scheduleAssessment;
    }

    // Get all candidate statuses
    const candidateStatuses = candidateAssessments.map((ca) => ca.status);
    const uniqueStatuses = [...new Set(candidateStatuses)];

    let newScheduleStatus = scheduleAssessment.status;

    // Check if all candidates have final statuses (completed, cancelled, expired, failed, pass)
    const finalStatuses = [
      "completed",
      "cancelled",
      "expired",
      "failed",
      "pass",
    ];
    const allHaveFinalStatus = candidateStatuses.every((status) =>
      finalStatuses.includes(status)
    );

    if (allHaveFinalStatus) {
      // All candidates have final statuses, determine schedule status
      if (uniqueStatuses.length === 1) {
        // All candidates have the same status
        const singleStatus = uniqueStatuses[0];
        if (["completed", "pass"].includes(singleStatus)) {
          newScheduleStatus = "completed";
        } else if (singleStatus === "cancelled") {
          newScheduleStatus = "cancelled";
        } else if (singleStatus === "expired") {
          newScheduleStatus = "expired";
        } else if (singleStatus === "failed") {
          newScheduleStatus = "failed";
        }
      } else {
        // Mixed final statuses - determine based on priority
        if (candidateStatuses.some((s) => ["completed", "pass"].includes(s))) {
          newScheduleStatus = "completed";
        } else if (
          candidateStatuses.every((s) => ["cancelled", "expired"].includes(s))
        ) {
          if (candidateStatuses.every((s) => s === "cancelled")) {
            newScheduleStatus = "cancelled";
          } else if (candidateStatuses.every((s) => s === "expired")) {
            newScheduleStatus = "expired";
          } else {
            newScheduleStatus = "cancelled";
          }
        } else if (candidateStatuses.some((s) => s === "failed")) {
          newScheduleStatus = "failed";
        }
      }
    } else {
      // Some candidates still have pending statuses, keep as scheduled
      newScheduleStatus = "scheduled";
    }

    // Update schedule status if it changed
    if (newScheduleStatus !== scheduleAssessment.status) {
      scheduleAssessment.status = newScheduleStatus;
      await scheduleAssessment.save();
    }

    return scheduleAssessment;
  } catch (error) {
    console.error(
      `Error updating schedule assessment status for ${scheduleAssessmentId}:`,
      error
    );
    throw error;
  }
};

// API endpoint to update schedule assessment status
exports.updateScheduleStatus = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Update Schedule Assessment Status";

  try {
    const { scheduleAssessmentId } = req.params;

    if (!scheduleAssessmentId) {
      return res.status(400).json({
        success: false,
        message: "Schedule assessment ID is required",
      });
    }

    const updatedSchedule = await exports.updateScheduleAssessmentStatus(
      scheduleAssessmentId
    );

    if (!updatedSchedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule assessment not found",
      });
    }

    res.locals.logData = {
      tenantId: "",
      ownerId: "",
      processName: "Update Schedule Assessment Status",
      requestBody: req.body,
      status: "success",
      message: "Schedule assessment status updated successfully",
      responseBody: updatedSchedule,
    };

    return res.status(200).json({
      success: true,
      message: "Schedule assessment status updated successfully",
      data: updatedSchedule,
    });
  } catch (error) {
    console.error("Error updating schedule assessment status:", error);

    res.locals.logData = {
      tenantId: "",
      ownerId: "",
      processName: "Update Schedule Assessment Status",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    return res.status(500).json({
      success: false,
      message: "Failed to update schedule assessment status",
      error: error.message,
    });
  }
};

// Function to automatically check and update expired candidate assessments
exports.checkAndUpdateExpiredAssessments = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Check And Update Expired Assessments";

  try {
    const now = new Date();

    // Find all candidate assessments that have expired but status is not updated
    const expiredAssessments = await CandidateAssessment.find({
      expiryAt: { $lt: now },
      status: {
        $nin: [
          "completed",
          "cancelled",
          "expired",
          "failed",
          "pass",
          "extended",
        ],
      },
    }).populate("candidateId");

    const updatedAssessments = [];
    const failedUpdates = [];

    for (const assessment of expiredAssessments) {
      try {
        // Update status to expired
        const oldStatus = assessment.status;
        assessment.status = "expired";
        assessment.isActive = false;
        await assessment.save();

        // Create notification for expiry
        if (oldStatus !== "expired") {
          try {
            await createAssessmentStatusUpdateNotification(
              assessment,
              oldStatus,
              "expired"
            );
          } catch (notificationError) {
            console.error(
              "[ASSESSMENT] Error creating expiry notification:",
              notificationError
            );
          }

          // Update assessment usage when status changes to expired
          try {
            await handleAssessmentStatusChange(
              assessment._id,
              oldStatus,
              "expired"
            );
          } catch (usageError) {
            console.error(
              "[ASSESSMENT] Error updating assessment usage:",
              usageError
            );
            // Continue execution even if usage update fails
          }
        }

        updatedAssessments.push({
          id: assessment._id,
          candidateName: `${assessment.candidateId?.FirstName || ""} ${assessment.candidateId?.LastName || ""
            }`.trim(),
          email: assessment.candidateId?.Email || "N/A",
          expiredAt: assessment.expiryAt,
        });

        // Update schedule assessment status after candidate assessment update
        await exports.updateScheduleAssessmentStatus(
          assessment.scheduledAssessmentId
        );
      } catch (error) {
        failedUpdates.push({
          id: assessment._id,
          error: error.message,
        });
      }
    }

    // Update all schedule assessments to ensure consistency
    const scheduleAssessments = await ScheduleAssessment.find({}).populate({
      path: "candidates",
      populate: { path: "candidateId" },
    });

    const updatedSchedules = [];
    const failedScheduleUpdates = [];

    for (const schedule of scheduleAssessments) {
      try {
        const updatedSchedule = await exports.updateScheduleAssessmentStatus(
          schedule._id
        );
        if (updatedSchedule && updatedSchedule.status !== schedule.status) {
          updatedSchedules.push({
            id: schedule._id,
            order: schedule.order,
            oldStatus: schedule.status,
            newStatus: updatedSchedule.status,
            candidateCount: schedule.candidates?.length || 0,
          });
        }
      } catch (error) {
        failedScheduleUpdates.push({
          id: schedule._id,
          error: error.message,
        });
      }
    }

    const responseBody = {
      expiredAssessments: {
        updated: updatedAssessments.length,
        failed: failedUpdates.length,
        details: updatedAssessments,
        failures: failedUpdates,
      },
      scheduleAssessments: {
        updated: updatedSchedules.length,
        failed: failedScheduleUpdates.length,
        details: updatedSchedules,
        failures: failedScheduleUpdates,
      },
    };

    res.locals.logData = {
      tenantId: "",
      ownerId: "",
      processName: "Check And Update Expired Assessments",
      requestBody: req.body,
      status: "success",
      message: "Expiry check completed successfully",
      responseBody,
    };

    res.json({
      success: true,
      message: "Expiry check completed successfully",
      data: responseBody,
    });
  } catch (error) {
    console.error("Error checking expired assessments:", error);

    res.locals.logData = {
      tenantId: "",
      ownerId: "",
      processName: "Check And Update Expired Assessments",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    res.status(500).json({
      success: false,
      message: "Failed to check expired assessments",
      error: error.message,
    });
  }
};

// API endpoint to update all schedule assessment statuses
exports.updateAllScheduleStatuses = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Update All Schedule Statuses";

  try {
    const scheduleAssessments = await ScheduleAssessment.find({});
    const results = [];
    const errors = [];

    for (const schedule of scheduleAssessments) {
      try {
        const updatedSchedule = await exports.updateScheduleAssessmentStatus(
          schedule._id
        );
        if (updatedSchedule && updatedSchedule.status !== schedule.status) {
          results.push({
            scheduleAssessmentId: schedule._id,
            oldStatus: schedule.status,
            newStatus: updatedSchedule.status,
          });
        }
      } catch (error) {
        errors.push({
          scheduleAssessmentId: schedule._id,
          error: error.message,
        });
      }
    }

    res.locals.logData = {
      tenantId: "",
      ownerId: "",
      processName: "Update All Schedule Statuses",
      requestBody: req.body,
      status: "success",
      message: `Successfully updated ${results.length} schedule assessment(s)`,
      responseBody: { updated: results, errors },
    };

    return res.status(200).json({
      success: true,
      message: `Successfully updated ${results.length} schedule assessment(s)`,
      data: { updated: results, errors },
    });
  } catch (error) {
    console.error("Error updating all schedule assessment statuses:", error);

    res.locals.logData = {
      tenantId: "",
      ownerId: "",
      processName: "Update All Schedule Statuses",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    return res.status(500).json({
      success: false,
      message: "Failed to update schedule assessment statuses",
      error: error.message,
    });
  }
};

// Function to run the schedule assessment status update job
//this is using in assessment cron job
exports.runScheduleAssessmentStatusUpdateJob = async () => {
  try {
    const scheduleAssessments = await ScheduleAssessment.find({});
    const results = [];
    const errors = [];

    for (const schedule of scheduleAssessments) {
      try {
        const updatedSchedule = await exports.updateScheduleAssessmentStatus(
          schedule._id
        );
        if (updatedSchedule && updatedSchedule.status !== schedule.status) {
          results.push({
            scheduleAssessmentId: schedule._id,
            oldStatus: schedule.status,
            newStatus: updatedSchedule.status,
          });
        }
      } catch (error) {
        errors.push({
          scheduleAssessmentId: schedule._id,
          error: error.message,
        });
      }
    }

    if (results.length > 0) {
    }

    if (errors.length > 0) {
      console.error("Errors during update:", errors);
    }
  } catch (error) {
    // console.error('Error in automated schedule assessment status update job:', error);
  }
};

// Cron job to automatically update schedule assessment statuses every 5 minutes
// cron.schedule("*/5 * * * *", async () => {
//   runScheduleAssessmentStatusUpdateJob();
// });

// */5 * * * * means: "Run every 5 minutes"
// You can adjust this schedule as needed:
// */1 * * * * = every minute (for testing)
// 0 */1 * * * = every hour
// 0 0 * * * = once daily at midnight

// Run immediately on file load for initial check
// runScheduleAssessmentStatusUpdateJob();

// ------------------------------v1.0.0 >
