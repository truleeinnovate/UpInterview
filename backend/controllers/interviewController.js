// v1.0.0  -  Ashraf  -  fixed name assessment to assessment template
// v1.0.2  -  Ashraf  -  added sending interview email
// v1.0.3  -  Ashok  -  Added new controller to get all interviews
// v1.0.4  -  Ranjith  -  fixed new update api in updateInterviewRound and interview seprated the patch and post call
// v1.0.5  -  Venkatesh - Fetch wallet transaction data in getAllInterviewRounds and return settlement status
//<-v1.0.6---Venkatesh---Fixed updateInterviewStatus function import

const mongoose = require("mongoose");
const { Interview } = require("../models/Interview/Interview.js");
const { InterviewRounds } = require("../models/Interview/InterviewRounds.js");
const { triggerWebhook, EVENT_TYPES } = require("../services/webhookService");
const InterviewTemplate = require("../models/InterviewTemplate.js");
const { Contacts } = require("../models/Contacts");
// v1.0.2 <-----------------------------------------
const { Candidate } = require("../models/candidate.js");
const interviewQuestions = require("../models/Interview/selectedInterviewQuestion.js");
const { Position } = require("../models/Position/position.js");
const Wallet = require("../models/WalletTopup");
const {
  generateUniqueId,
  generateApplicationNumber,
} = require("../services/uniqueIdGeneratorService");
const {
  WALLET_BUSINESS_TYPES,
  createWalletTransaction,
} = require("../utils/interviewWalletUtil");

// Import usage service for internal interview tracking
const {
  checkInternalInterviewUsageLimit,
  getInternalInterviewUsageStats,
} = require("../services/interviewUsageService");

// Import push notification functions
const {
  createInterviewCreatedNotification,
  createInterviewRoundScheduledNotification,
  createInterviewStatusUpdateNotification,
} = require("./PushNotificationControllers/pushNotificationInterviewController");
const {
  MockInterviewRound,
} = require("../models/Mockinterview/mockinterviewRound.js");
const {
  createCandidatePositionService,
} = require("./candidatePositionController.js");
// const { createInterviewRequest } = require("../utils/interviewRequest.js");
const InterviewRequest = require("../models/InterviewRequest.js");
const ScheduledAssessment = require("../models/Assessment/assessmentsSchema.js");
const {
  CandidateAssessment,
} = require("../models/Assessment/candidateAssessment.js");
const { Application } = require("../models/Application.js");
const { Resume } = require("../models/Resume.js");




//  post call for interview page
const createInterview = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Create Interview";

  try {
    const {
      candidateId,
      positionId,
      templateId,
      status,
      orgId,
      userId,
      // interviewId,
      updatingInterviewStatus,
      completionReason,
      currentReason, // Added currentReason
      externalId,
      allowParallelScheduling,
      isOrganization,
      applicationId, // <--- Added applicationId
    } = req.body;
    let candidate = null;

    // Skip candidate/position check if just updating status

    if (!candidateId) {
      return res.status(400).json({
        field: "candidateId",
        message: "Candidate is required",
      });
    }

    if (!positionId) {
      return res.status(400).json({
        field: "positionId",
        message: "Position is required",
      });
    }

    if (!updatingInterviewStatus) {
      candidate = await Candidate.findById(candidateId);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
    }

    const template = await InterviewTemplate.findById(templateId);

    let interview;
    let interviewData = {
      candidateId,
      positionId,
      templateId: template ? templateId : undefined,
      ownerId: userId,
      tenantId: orgId || undefined,
      completionReason,
      currentReason, // Added currentReason
      status,
      externalId,
      allowParallelScheduling: allowParallelScheduling || false,
      applicationId: applicationId || undefined, // <--- Save applicationId
    };

    // Generate interviewCode for new interview with tenant ID
    const interviewCode = await generateUniqueId(
      "INT",
      Interview,
      "interviewCode",
      orgId,
    );

    // Create interview
    interview = await Interview.create({
      ...interviewData,
      interviewCode,
    });

    // Create push notification for interview creation
    try {
      await createInterviewCreatedNotification(interview);
    } catch (notificationError) {
      console.error(
        "[INTERVIEW] Error creating notification:",
        notificationError,
      );
      // Continue execution even if notification fails
    }

    // Handle rounds and questions if not just updating status
    if (!updatingInterviewStatus) {
      const position = await Position.findById(positionId);
      let roundsToSave = [];

      if (position?.templateId?.toString() === templateId?.toString()) {
        roundsToSave = position.rounds || [];
      } else if (
        position?.templateId &&
        position?.templateId.toString() !== templateId?.toString()
      ) {
        roundsToSave = template?.rounds?.length > 0 ? template.rounds : [];
      } else if (
        !position?.templateId &&
        position?.rounds?.length > 0 &&
        templateId
      ) {
        roundsToSave = template?.rounds?.length > 0 ? template.rounds : [];
      } else if (!position?.templateId && position?.rounds?.length > 0) {
        roundsToSave = position.rounds;
      } else if (templateId) {
        roundsToSave = template?.rounds?.length > 0 ? template.rounds : [];
      }

      if (roundsToSave.length > 0) {
        // Process each round with proper field mapping
        for (let index = 0; index < roundsToSave.length; index++) {
          const round = roundsToSave[index];

          // Create round document with proper field mapping
          const roundDoc = new InterviewRounds({
            interviewId: interview._id,
            sequence: index + 1, // Use index-based sequence
            roundTitle: round.roundTitle || "",
            interviewMode: round.interviewMode || "",
            interviewType: round.interviewType || "", // This field was missing in your mapping
            interviewerType: round.interviewerType || "",
            selectedInterviewersType: round.selectedInterviewersType || "", // This field doesn't exist in schema
            duration: round.duration || "", // Map interviewDuration to duration
            instructions: round.instructions || "",
            dateTime: round.dateTime || "",
            interviewers: round.interviewers || [], // This should be ObjectId array
            status: "Draft",
            // meetLink: round.meetLink || [],
            meetingId: round.meetingId || "",
            assessmentId: round.assessmentId || null,
            // questions: [], // Initialize as empty array
            rejectionReason: round.rejectionReason || "",
            minimumInterviewers: round.minimumInterviewers || "", // This field doesn't exist in schema
            // interviewerGroupId: round.interviewerGroupId || null, // This field doesn't exist in schema
            InterviewerTags: round.InterviewerTags || [],
            TeamsIds: round.TeamsIds || [],
            ...round,
          });

          // Save the round document
          const savedRound = await roundDoc.save();

          // Create notification if round has scheduled date and interviewer
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

          // Handle questions if they exist and are valid
          if (
            round.questions &&
            Array.isArray(round.questions) &&
            round.questions.length > 0
          ) {
            try {
              // Validate questions structure
              const validQuestions = round.questions.every(
                (q) =>
                  q && (q.questionId || q._id) && (q.snapshot || q.question),
              );

              if (validQuestions) {
                // Transform questions to match expected format
                const transformedQuestions = round.questions.map((q) => ({
                  questionId: q.questionId || q._id,
                  snapshot: q.snapshot || q,
                }));

                await handleInterviewQuestions(
                  interview._id,
                  savedRound._id,
                  transformedQuestions,
                );
              } else {
                console.warn(
                  `Invalid questions structure for round ${savedRound._id}, skipping questions.`,
                );
              }
            } catch (questionError) {
              console.error(
                `Error saving questions for round ${savedRound._id}:`,
                questionError,
              );
            }
          }
        }
      }
    }

    // Create candidate position internally
    await createCandidatePositionService({
      candidateId,
      positionId,
      interviewId: interview._id,
      status: "applied",
    });

    // Create Application document - Only if explicitly requested by Organization
    if (isOrganization) {
      try {
        const position = await Position.findById(positionId).lean();

        // Check if application already exists - logic updated to prioritize applicationId
        let existingApp;
        if (applicationId) {
          existingApp = await Application.findById(applicationId);
        }

        if (!existingApp) {
          existingApp = await Application.findOne({
            candidateId,
            positionId,
            tenantId: orgId,
          });
        }

        if (!existingApp) {
          // Get candidate for application number generation
          const candidate = await Candidate.findById(candidateId).lean();

          // Generate applicationNumber using the new format: NAME-TECH-YEAR-0001
          const applicationNumber = await generateApplicationNumber(
            candidate,
            position,
            orgId,
          );

          // Validate companyId - only use if it's a valid ObjectId, not a string
          const companyId =
            position?.companyname &&
              mongoose.Types.ObjectId.isValid(position.companyname)
              ? position.companyname
              : null;

          const newApp = await Application.create({
            applicationNumber,
            candidateId,
            positionId,
            tenantId: orgId,
            companyId,
            interviewId: interview._id,
            status: "INTERVIEWING", // Directly set to INTERVIEWING as we are creating an interview
            currentStage: "Interview Created",
            ownerId: userId,
            createdBy: userId,
          });

          // <--- BACK-POPULATE applicationId to Interview
          await Interview.findByIdAndUpdate(interview._id, {
            applicationId: newApp._id,
          });

          console.log(
            "[INTERVIEW] Application created with number:",
            applicationNumber,
          );
        } else {
          // Update existing application with interview reference and status
          // Always update status to INTERVIEWING when a new interview is created
          await Application.findByIdAndUpdate(existingApp._id, {
            interviewId: interview._id,
            status: "INTERVIEWING",
            currentStage: "Interview Created",
          });

          // <--- BACK-POPULATE applicationId to Interview (even if existing)
          await Interview.findByIdAndUpdate(interview._id, {
            applicationId: existingApp._id,
          });

          console.log(
            "[INTERVIEW] Application already exists for candidate:",
            candidateId,
          );
        }
      } catch (appError) {
        console.error("[INTERVIEW] Error creating Application:", appError);
        // Continue execution even if Application creation fails
      }
    }

    res.locals.logData = {
      tenantId: interview.tenantId?.toString() || orgId || "",
      ownerId: interview.ownerId?.toString() || userId || "",
      processName: "Create Interview",
      requestBody: req.body,
      status: "success",
      message: "Interview created successfully",
      responseBody: interview,
    };

    res.status(201).json(interview);
  } catch (error) {
    console.error("Error creating interview:", error);

    // Do not log 4xx validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.locals.logData = {
      tenantId: req.body?.orgId || "",
      ownerId: req.body?.userId || "",
      processName: "Create Interview",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// PATCH call for interview page
const updateInterview = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Update Interview";

  try {
    const { id } = req.params;
    const {
      candidateId,
      positionId,
      templateId,
      status,
      orgId,
      userId,
      isOrganization,
      updatingInterviewStatus,
      completionReason,
      currentReason, // Added currentReason
      allowParallelScheduling,
    } = req.body;

    // Check if interview exists first
    const existingInterview = await Interview.findById(id);
    if (!existingInterview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Field-specific validation matching frontend
    if (!updatingInterviewStatus) {
      if (candidateId && !candidateId) {
        return res.status(400).json({
          field: "candidateId",
          message: "Candidate is required",
        });
      }

      if (positionId && !positionId) {
        return res.status(400).json({
          field: "positionId",
          message: "Position is required",
        });
      }

      // Validate candidate exists if provided
      if (candidateId) {
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
          return res.status(404).json({
            field: "candidateId",
            message: "Candidate not found",
          });
        }
      }
    }

    // Base update data - only include fields that are provided and different
    const interviewData = {};

    if (
      candidateId &&
      candidateId !== existingInterview.candidateId?.toString()
    ) {
      interviewData.candidateId = candidateId;
    }

    if (positionId && positionId !== existingInterview.positionId?.toString()) {
      interviewData.positionId = positionId;
    }

    if (templateId && templateId !== existingInterview.templateId?.toString()) {
      interviewData.templateId = templateId;
    }

    if (
      completionReason &&
      completionReason !== existingInterview.completionReason
    ) {
      interviewData.completionReason = completionReason;
    }

    if (status && status !== existingInterview.status) {
      interviewData.status = status;
    }

    if (
      allowParallelScheduling !== undefined &&
      allowParallelScheduling !== existingInterview.allowParallelScheduling
    ) {
      interviewData.allowParallelScheduling = allowParallelScheduling;
    }

    // Update currentReason if provided
    if (currentReason && currentReason !== existingInterview.currentReason) {
      interviewData.currentReason = currentReason;
    }

    // Check if there are any actual changes
    if (Object.keys(interviewData).length === 0) {
      res.locals.logData = {
        tenantId:
          existingInterview.tenantId?.toString() || req.body?.orgId || "",
        ownerId:
          existingInterview.ownerId?.toString() || req.body?.userId || "",
        processName: "Update Interview",
        requestBody: req.body,
        status: "success",
        message: "No changes made to interview",
        responseBody: existingInterview,
      };

      return res.status(200).json({
        status: "no_changes",
        message: "No changes made",
        interview: existingInterview,
      });
    }

    // Add metadata fields
    interviewData.updatedBy = userId;
    interviewData.updatedAt = new Date();

    // Update interview
    const interview = await Interview.findByIdAndUpdate(id, interviewData, {
      new: true,
    });

    // Create notification if status changed
    if (status && status !== existingInterview.status) {
      try {
        await createInterviewStatusUpdateNotification(
          interview,
          existingInterview.status,
          status,
        );
      } catch (notificationError) {
        console.error(
          "[INTERVIEW] Error creating status update notification:",
          notificationError,
        );
        // Continue execution even if notification fails
      }
    }

    // Handle rounds/questions only if not just updating status and template is provided/changed
    if (
      !updatingInterviewStatus &&
      templateId &&
      templateId !== existingInterview.templateId?.toString()
    ) {
      const template = await InterviewTemplate.findById(templateId);

      if (template?.rounds?.length > 0) {
        // Clear old rounds & questions
        await InterviewRounds.deleteMany({ interviewId: interview._id });
        await interviewQuestions.deleteMany({ interviewId: interview._id });

        // Create new rounds from template
        for (let index = 0; index < template.rounds.length; index++) {
          const round = template.rounds[index];

          const roundDoc = new InterviewRounds({
            interviewId: interview._id,
            sequence: index + 1,
            roundTitle: round.roundTitle || "",
            interviewMode: round.interviewMode || "",
            interviewType: round.interviewType || "",
            interviewerType: round.interviewerType || "",
            duration: round.duration || "",
            instructions: round.instructions || "",
            status: "Draft",
            InterviewerTags: round.InterviewerTags || [],
            TeamsIds: round.TeamsIds || [],
            round,
          });

          const savedRound = await roundDoc.save();

          // Handle questions if they exist
          if (round.questions?.length > 0) {
            const validQuestions = round.questions.filter(
              (q) => q && (q.questionId || q._id),
            );

            if (validQuestions.length > 0) {
              const transformedQuestions = validQuestions.map((q) => ({
                questionId: q.questionId || q._id,
                snapshot: q.snapshot || q,
              }));

              await handleInterviewQuestions(
                interview._id,
                savedRound._id,
                transformedQuestions,
              );
            }
          }
        }
      }
    }

    // Handle Application update if candidate or position changed
    // Only perform this if explicitly requested by Organization

    if ((interviewData.candidateId || interviewData.positionId) && isOrganization) {
      try {
        // Find the application currently linked to this interview
        let linkedApplication = await Application.findOne({ interviewId: existingInterview._id });

        // Fallback to searching by applicationId if stored on interview
        if (!linkedApplication && existingInterview.applicationId) {
          linkedApplication = await Application.findById(existingInterview.applicationId);
        }

        if (linkedApplication) {
          const updatePayload = {};

          if (interviewData.candidateId) {
            updatePayload.candidateId = interviewData.candidateId;
          }

          if (interviewData.positionId) {
            updatePayload.positionId = interviewData.positionId;

            // Update companyId if position changed
            const position = await Position.findById(interviewData.positionId).lean();
            if (position?.companyname && mongoose.Types.ObjectId.isValid(position.companyname)) {
              updatePayload.companyId = position.companyname;
            }
          }

          // Update the found application with new details
          await Application.findByIdAndUpdate(linkedApplication._id, updatePayload);
          console.log(`[INTERVIEW] Updated linked application ${linkedApplication._id} with new candidate/position`);
        } else {
          console.log("[INTERVIEW] No linked application found to update");
        }
      } catch (appError) {
        console.error("[INTERVIEW] Error handling application update:", appError);
      }
    }

    res.locals.logData = {
      tenantId: interview.tenantId?.toString() || req.body?.orgId || "",
      ownerId: interview.ownerId?.toString() || req.body?.userId || "",
      processName: "Update Interview",
      requestBody: req.body,
      status: "success",
      message: "Interview updated successfully",
      responseBody: interview,
    };

    return res.status(200).json({
      status: "updated_successfully",
      message: "interview updated successfully",
      interview: interview,
    });

    // res.json(interview);
  } catch (error) {
    console.error("Error updating interview:", error);

    // Do not log 4xx validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.locals.logData = {
      tenantId: req.body?.orgId || "",
      ownerId: req.body?.userId || "",
      processName: "Update Interview",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};


// Helper function to trigger webhook for interview round status updates

// v1.0.2 <-----------------------------------------

const getDateRanges = () => {
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  return { startOfCurrentMonth, startOfLastMonth, endOfLastMonth };
};

// GET cALL for Dashboard statistics code
const getDashboardStats = async (req, res) => {
  try {
    const { isOrganization, tenantId, ownerId, period = "monthly" } = req.query;

    if (!tenantId && !ownerId) {
      return res.status(400).json({ error: "tenantId or ownerId is required" });
    }

    const now = new Date();
    const { startOfCurrentMonth, startOfLastMonth, endOfLastMonth } =
      getDateRanges(now);

    const query =
      isOrganization === "true"
        ? { tenantId: new mongoose.Types.ObjectId(tenantId) }
        : { ownerId: new mongoose.Types.ObjectId(ownerId) };

    const totalInterviews = await Interview.countDocuments(query);

    const interviewsThisMonth = await Interview.countDocuments({
      ...query,
      createdAt: { $gte: startOfCurrentMonth },
    });

    const interviewsLastMonth = await Interview.countDocuments({
      ...query,
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });

    let interviewChange = "0%";
    let trendSymbol = "";
    if (interviewsLastMonth > 0) {
      const percentageChange =
        ((interviewsThisMonth - interviewsLastMonth) / interviewsLastMonth) *
        100;
      interviewChange =
        percentageChange >= 0
          ? `+${percentageChange.toFixed(1)}%`
          : `${percentageChange.toFixed(1)}%`;
      trendSymbol = percentageChange < 0 ? "↓" : "↑";
    } else if (interviewsThisMonth > 0) {
      interviewChange = "+100%";
      trendSymbol = "↑";
    }

    const selectedThisMonth = await Interview.countDocuments({
      ...query,
      status: "selected",
      createdAt: { $gte: startOfCurrentMonth },
    });

    const selectedLastMonth = await Interview.countDocuments({
      ...query,
      status: "selected",
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });

    const successRateThisMonth =
      interviewsThisMonth > 0
        ? ((selectedThisMonth / interviewsThisMonth) * 100).toFixed(1)
        : 0;
    let successRateChange = "0%";
    if (selectedLastMonth > 0 && interviewsLastMonth > 0) {
      const lastMonthSuccessRate =
        (selectedLastMonth / interviewsLastMonth) * 100;
      const percentageChange = successRateThisMonth - lastMonthSuccessRate;
      successRateChange =
        percentageChange >= 0
          ? `+${percentageChange.toFixed(1)}%`
          : `${percentageChange.toFixed(1)}%`;
    } else if (selectedThisMonth > 0) {
      successRateChange = "+100%";
    }

    let chartData = [];
    if (period === "weekly") {
      const weeks = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - i * 7,
        );
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const count = await Interview.countDocuments({
          ...query,
          createdAt: { $gte: weekStart, $lte: weekEnd },
        });
        weeks.push({
          name: `Week ${4 - i}`,
          interviews: count,
        });
      }
      chartData = weeks;
    } else if (period === "yearly") {
      const months = [];
      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(
          monthStart.getFullYear(),
          monthStart.getMonth() + 1,
          0,
        );
        const count = await Interview.countDocuments({
          ...query,
          createdAt: { $gte: monthStart, $lte: monthEnd },
        });
        months.push({
          name: monthStart.toLocaleString("default", {
            month: "short",
            year: "2-digit",
          }),
          interviews: count,
        });
      }
      chartData = months;
    } else {
      const days = [];
      for (let i = 29; i >= 0; i--) {
        const dayStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - i,
        );
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
        const count = await Interview.countDocuments({
          ...query,
          createdAt: { $gte: dayStart, $lte: dayEnd },
        });
        days.push({
          name: dayStart.toLocaleString("default", {
            day: "numeric",
            month: "short",
          }),
          interviews: count,
        });
      }
      chartData = days;
    }

    res.json({
      totalInterviews,
      interviewChange: `${interviewChange} ${trendSymbol}`,
      successRate: `${successRateThisMonth}%`,
      successRateChange,
      chartData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete interview and related rounds
const deleteInterview = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Delete Interview";

  const { id } = req.params;

  try {
    // ✅ Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid interview ID format",
      });
    }

    // ✅ Check if interview exists
    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({
        status: "error",
        message: "Interview not found",
      });
    }

    // ✅ Check if status is "Draft"
    if (interview.status !== "Draft") {
      return res.status(400).json({
        status: "error",
        message: `Interview cannot be deleted because its current status is "${interview.status}".`,
      });
    }

    // ✅ Delete related interview rounds first
    const deletedRounds = await InterviewRounds.deleteMany({ interviewId: id });

    // ✅ Delete the interview itself
    const deletedInterview = await Interview.findByIdAndDelete(id);

    if (!deletedInterview) {
      return res.status(404).json({
        status: "error",
        message: "Interview not found or already deleted",
      });
    }

    // ✅ Success response
    res.status(200).json({
      status: "success",
      message: "Interview and its related rounds deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting interview:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error while deleting interview",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

//  Delete interview Round
const deleteRound = async (req, res) => {
  try {
    const { id } = req.params;
    await InterviewRounds.findByIdAndDelete(id);
    res.json({ message: "Round deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// SUPER ADMIN added by Ashok ----------------------------------------------------------->
const getInterviews = async (req, res) => {
  try {
    const now = new Date();

    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const totalInterviews = await Interview.countDocuments();

    const interviewsThisMonth = await Interview.countDocuments({
      createdAt: { $gte: startOfCurrentMonth, $lt: startOfNextMonth },
    });

    const interviewsLastMonth = await Interview.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth },
    });

    let trend = "neutral";
    let trendValue = "0%";

    if (interviewsLastMonth > 0) {
      const change =
        ((interviewsThisMonth - interviewsLastMonth) / interviewsLastMonth) *
        100;
      trend = change > 0 ? "up" : change < 0 ? "down" : "neutral";
      trendValue = `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
    } else if (interviewsThisMonth > 0) {
      trend = "up";
      trendValue = "+100%";
    }

    res.json({
      metric: {
        title: "Total Interviews",
        value: totalInterviews.toLocaleString(),
        description: "Across all tenants",
        trend,
        trendValue,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// v1.0.0 <---------------------SUPER ADMIN-----------------------------------------

const getAllInterviews = async (req, res) => {
  try {
    // fetch all interviews
    const interviews = await Interview.find();

    // enrich each interview with candidate + position data
    const enrichedInterviews = await Promise.all(
      interviews.map(async (interview) => {
        let candidate = null;
        let position = null;

        // fetch candidate
        if (interview.candidateId) {
          try {
            candidate = await Candidate.findById(interview.candidateId);
          } catch (err) {
            console.error("Error fetching candidate:", err);
          }
        }

        // fetch position
        if (interview.positionId) {
          try {
            position = await Position.findById(interview.positionId);
          } catch (err) {
            console.error("Error fetching position:", err);
          }
        }

        return {
          ...interview.toObject(),
          candidate: candidate ? candidate.toObject() : null,
          position: position ? position.toObject() : null,
        };
      }),
    );

    // reverse like frontend (latest first)
    res.status(200).json(enrichedInterviews.reverse());
  } catch (error) {
    console.error("Error fetching interviews:", error);
    res.status(500).json({ error: "Server error" });
  }
};
// v1.0.0 <-------------------------SUPER ADMIN------------------------------------->

// -------------------------------------------------------------------------------------->

// GET internal interview usage before scheduling
const checkInternalInterviewUsage = async (req, res) => {
  try {
    const { tenantId, ownerId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ message: "TenantId is required" });
    }

    const usageCheck = await checkInternalInterviewUsageLimit(
      tenantId,
      ownerId,
    );
    const usageStats = await getInternalInterviewUsageStats(tenantId, ownerId);

    return res.status(200).json({
      canSchedule: usageCheck.canSchedule,
      message: usageCheck.message,
      usage: usageStats || {
        utilized: usageCheck.utilized || 0,
        entitled: usageCheck.entitled || 0,
        remaining: usageCheck.remaining || 0,
        percentage: 0,
      },
    });
  } catch (error) {
    console.error("Error checking internal interview usage:", error);
    return res.status(500).json({
      message: "Error checking usage limits",
      error: error.message,
    });
  }
};

//<-v1.0.6---Venkatesh---Fixed updateInterviewStatus controller to use direct Interview model update
// <---v1.0.6-----

// PATCH Interview Status Update
const updateInterviewStatusController = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Update Interview Status";

  try {
    const { interviewId, status } = req.params;
    const { reason } = req.body;

    // Validate status
    if (!["Completed", "Cancelled", "Rejected", "Selected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Must be one of: Completed, Cancelled, Rejected, Selected",
      });
    }

    // Find and update the interview
    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // Update the status
    interview.status = status;

    // If there's a reason, update it
    if (reason) {
      interview.completionReason = reason;
    }

    // Save the updated interview
    const updatedInterview = await interview.save();

    res.locals.logData = {
      tenantId: updatedInterview.tenantId?.toString() || "",
      ownerId: updatedInterview.ownerId?.toString() || "",
      processName: "Update Interview Status",
      requestBody: {
        params: req.params,
        body: req.body,
      },
      status: "success",
      message: "Interview status updated successfully",
      responseBody: updatedInterview,
    };

    res.status(200).json({
      success: true,
      data: updatedInterview,
    });
  } catch (error) {
    console.error("Error updating interview status:", error);

    res.locals.logData = {
      tenantId: "",
      ownerId: req.params?.interviewId || "",
      processName: "Update Interview Status",
      requestBody: {
        params: req.params,
        body: req.body,
      },
      status: "error",
      message: error.message,
    };

    res.status(500).json({
      success: false,
      message: "Error updating interview status",
      error: error.message,
    });
  }
};
// -----v1.0.6---->

// Get all interview rounds for super admin
const getAllInterviewRounds = async (req, res) => {
  try {
    const { type } = req.query || {};
    const isMock = type === "mock";
    const hasPaginationParams =
      "page" in req.query ||
      "limit" in req.query ||
      "search" in req.query ||
      "status" in req.query ||
      "organizationType" in req.query;

    // Parse pagination and filters
    const page = Math.max(parseInt(req.query.page, 10) || 0, 0);
    const limitRaw = parseInt(req.query.limit, 10);
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 100) : 10;
    const search = (req.query.search || "").trim();
    const statusParam = (req.query.status || "").trim();
    const orgTypeParam = (req.query.organizationType || "")
      .trim()
      .toLowerCase();
    const statusValues = statusParam
      ? statusParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
      : [];

    // Base pipeline shared for both regular and mock
    const interviewerTypeMatch = isMock ? "external" : "External";
    const mainLookup = isMock
      ? {
        from: "mockinterviews",
        localField: "mockInterviewId",
        foreignField: "_id",
        as: "mainInterview",
      }
      : {
        from: "interviews",
        localField: "interviewId",
        foreignField: "_id",
        as: "mainInterview",
      };
    const mainCodeField = isMock ? "mockInterviewCode" : "interviewCode";

    const collectionModel = isMock ? MockInterviewRound : InterviewRounds;

    const pipeline = [
      { $match: { interviewerType: interviewerTypeMatch } },
      // Populate interviewers from contacts
      {
        $lookup: {
          from: "contacts",
          localField: "interviewers",
          foreignField: "_id",
          as: "interviewerDocs",
        },
      },
      // Lookup main interview/mock interview
      { $lookup: mainLookup },
      { $unwind: { path: "$mainInterview", preserveNullAndEmptyArrays: true } },
      // Normalize tenantId for mock (string -> ObjectId) before tenant lookup
      ...(isMock
        ? [
          {
            $addFields: {
              mainTenantIdNormalized: {
                $cond: [
                  {
                    $and: [
                      { $ne: ["$mainInterview.tenantId", null] },
                      { $eq: [{ $strLenCP: "$mainInterview.tenantId" }, 24] },
                    ],
                  },
                  { $toObjectId: "$mainInterview.tenantId" },
                  null,
                ],
              },
            },
          },
        ]
        : []),
      // Lookup tenant for organization info
      {
        $lookup: {
          from: "tenants",
          localField: isMock
            ? "mainTenantIdNormalized"
            : "mainInterview.tenantId",
          foreignField: "_id",
          as: "tenant",
        },
      },
      { $unwind: { path: "$tenant", preserveNullAndEmptyArrays: true } },
      // Compute interviewerNames and interviewCode + org info
      {
        $addFields: {
          interviewerNamesArray: {
            $map: {
              input: { $ifNull: ["$interviewerDocs", []] },
              as: "i",
              in: {
                $trim: {
                  input: {
                    $concat: [
                      { $ifNull: ["$$i.firstName", ""] },
                      " ",
                      { $ifNull: ["$$i.lastName", ""] },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          interviewerNames: {
            $cond: [
              { $gt: [{ $size: "$interviewerNamesArray" }, 0] },
              {
                $reduce: {
                  input: "$interviewerNamesArray",
                  initialValue: "",
                  in: {
                    $concat: [
                      {
                        $cond: [
                          { $eq: ["$$value", ""] },
                          "",
                          { $concat: ["$$value", ", "] },
                        ],
                      },
                      "$$this",
                    ],
                  },
                },
              },
              "No interviewers assigned",
            ],
          },
          interviewCode: {
            $cond: [
              { $ifNull: ["$mainInterview", false] },
              {
                $concat: [
                  { $ifNull: [`$mainInterview.${mainCodeField}`, "N/A"] },
                  "-",
                  { $toString: { $ifNull: ["$sequence", 1] } },
                ],
              },
              "N/A",
            ],
          },
          organizationType: { $ifNull: ["$tenant.type", "individual"] },
          organization: {
            $cond: [
              { $eq: ["$tenant.type", "organization"] },
              { $ifNull: ["$tenant.company", "Organization"] },
              "Individual",
            ],
          },
          dataType: isMock ? "mock" : "interview",
          createdOn: "$createdAt",
        },
      },
    ];

    // Apply filters in pipeline when requested
    if (statusValues.length > 0) {
      pipeline.push({ $match: { status: { $in: statusValues } } });
    }
    if (orgTypeParam) {
      pipeline.push({ $match: { organizationType: orgTypeParam } });
    }
    if (search) {
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(sanitizedSearch, "i");

      pipeline.push({
        $match: {
          $or: [
            { interviewCode: { $regex: regex } },
            { interviewerNames: { $regex: regex } },
            { organization: { $regex: regex } },
            { roundTitle: { $regex: regex } },
            { interviewMode: { $regex: regex } },
            { interviewType: { $regex: regex } },
            { status: { $regex: regex } },
          ],
        },
      });
    }

    // Sort newest first
    pipeline.push({ $sort: { _id: -1 } });

    // Final projection
    const projectStage = {
      $project: {
        _id: 1,
        interviewCode: 1,
        interviewId: "$mainInterview._id",
        // Expose candidate and position IDs for frontend detail fetches
        candidateId: "$mainInterview.candidateId",
        positionId: "$mainInterview.positionId",
        sequence: 1,
        roundTitle: 1,
        interviewMode: 1,
        interviewType: 1,
        interviewerType: 1,
        duration: 1,
        instructions: 1,
        dateTime: 1,
        interviewerViewType: 1,
        // interviewerGroupId: 1,
        interviewers: "$interviewerDocs",
        interviewerNames: 1,
        status: 1,
        currentAction: 1,
        previousAction: 1,
        currentActionReason: 1,
        previousActionReason: 1,
        supportTickets: 1,
        meetingId: 1,
        meetPlatform: 1,
        assessmentId: 1,
        scheduleAssessmentId: 1,
        rejectionReason: 1,
        holdTransactionId: 1,
        settlementStatus: 1,
        settlementDate: 1,
        organizationType: 1,
        organization: 1,
        createdOn: 1,
        updatedAt: "$updatedAt",
        interviewStatus: "$mainInterview.status",
        dataType: 1,
        history: 1,
      },
    };

    if (!hasPaginationParams) {
      const fullPipeline = [...pipeline, projectStage];
      const data = await collectionModel.aggregate(fullPipeline);
      return res.status(200).json({ success: true, data, total: data.length });
    }

    // Paginated mode using $facet
    const facetPipeline = [
      {
        $facet: {
          data: [projectStage, { $skip: page * limit }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await collectionModel.aggregate([
      ...pipeline,
      ...facetPipeline,
    ]);
    const agg = result?.[0] || { data: [], totalCount: [] };
    const data = agg.data || [];
    const totalItems = agg.totalCount?.[0]?.count || 0;

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit) || 0,
        totalItems,
        hasNext: (page + 1) * limit < totalItems,
        hasPrev: page > 0,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching interview rounds:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch interview rounds",
      error: error.message,
    });
  }
};

// Get wallet transaction data for a specific interview round
// const getInterviewRoundTransaction = async (req, res) => {
//   try {
//     const { id: roundId } = req.params;

//     if (!roundId) {
//       return res.status(400).json({
//         success: false,
//         message: "Round ID is required",
//       });
//     }

//     // Determine if this is a mock interview round
//     let round = await InterviewRounds.findById(roundId);
//     let isMock = false;

//     if (!round) {
//       // Try to find as mock interview round
//       round = await MockInterviewRound.findById(roundId);
//       isMock = true;
//     }

//     if (!round) {
//       return res.status(404).json({
//         success: false,
//         message: "Interview round not found",
//       });
//     }

//     // Fetch wallet transaction data based on roundId (preferred) or legacy holdTransactionId
//     let holdTransactionData = null;
//     let resolvedHoldTransactionId = null;
//     let roundTransactions = [];

//     try {
//       const roundIdStr = round._id.toString();

//       // Preferred: find wallet and all transactions using metadata.roundId
//       const walletByMetadata = await Wallet.findOne({
//         "transactions.metadata.roundId": roundIdStr,
//       });

//       if (walletByMetadata && Array.isArray(walletByMetadata.transactions)) {
//         // All transactions for this round (hold + debit after settlement, etc.)
//         roundTransactions = walletByMetadata.transactions.filter(
//           (t) => t && t.metadata && String(t.metadata.roundId) === roundIdStr
//         );

//         if (roundTransactions.length > 0) {
//           // Prefer the original hold transaction if it still exists
//           const preferredHold = roundTransactions.find(
//             (t) => String(t.type).toLowerCase() === "hold"
//           );

//           const primaryTx =
//             preferredHold || roundTransactions[roundTransactions.length - 1];

//           if (primaryTx) {
//             holdTransactionData = primaryTx;
//             resolvedHoldTransactionId = primaryTx._id
//               ? primaryTx._id.toString()
//               : null;
//           }
//         }
//       }

//       // Legacy fallback: use round.holdTransactionId if metadata lookup failed
//       if (!holdTransactionData && round.holdTransactionId) {
//         const walletById = await Wallet.findOne({
//           "transactions._id": round.holdTransactionId,
//         });

//         if (walletById && Array.isArray(walletById.transactions)) {
//           const legacyTx = walletById.transactions.find(
//             (t) => t._id && t._id.toString() === round.holdTransactionId
//           );

//           if (legacyTx) {
//             holdTransactionData = legacyTx;
//             resolvedHoldTransactionId = legacyTx._id
//               ? legacyTx._id.toString()
//               : round.holdTransactionId;
//             // For legacy data, expose this single transaction in the array as well
//             roundTransactions = [legacyTx];
//           }
//         }
//       }
//     } catch (error) {
//       console.error(
//         `Error fetching transaction for round ${round._id}:`,
//         error
//       );
//     }

//     res.status(200).json({
//       success: true,
//       data: {
//         roundId: round._id,
//         holdTransactionId: resolvedHoldTransactionId,
//         holdTransactionData: holdTransactionData,
//         transactions: roundTransactions,
//         settlementStatus: round.settlementStatus || "pending",
//         settlementDate: round.settlementDate || null,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching interview round transaction:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch transaction data",
//       error: error.message,
//     });
//   }
// };

const getInterviewRoundTransaction = async (req, res) => {
  try {
    const { id: roundId } = req.params;

    if (!roundId) {
      return res.status(400).json({
        success: false,
        message: "Round ID is required",
      });
    }

    // Determine if mock or normal
    let round = await InterviewRounds.findById(roundId);
    let isMock = false;

    if (!round) {
      round = await MockInterviewRound.findById(roundId);
      isMock = true;
    }

    if (!round) {
      return res.status(404).json({
        success: false,
        message: "Interview round not found",
      });
    }

    const roundIdStr = round._id.toString();

    // Find wallet with transactions for this round
    const wallet = await Wallet.findOne({
      "transactions.metadata.roundId": roundIdStr,
    });

    let roundTransactions = [];
    let activeHoldTransactionId = null;
    let activeHoldTransactionData = null;
    let settlementStatus = "pending";
    let settlementDate = null;

    if (wallet && Array.isArray(wallet.transactions)) {
      roundTransactions = wallet.transactions
        .filter((t) => t.metadata && t.metadata.roundId === roundIdStr)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Ascending chronological

      // Active hold: latest hold not completed
      const activeHold = [...roundTransactions]
        .reverse()
        .find((t) => t.type === "hold" && t.status !== "completed");

      if (activeHold) {
        activeHoldTransactionId = activeHold._id.toString();
        activeHoldTransactionData = activeHold;
      }

      // Check if settled: look for a debit with settlementStatus completed
      const settlementTx = roundTransactions.find(
        (t) =>
          t.type === "debited" &&
          t.metadata &&
          t.metadata.settlementStatus === "completed",
      );

      if (settlementTx) {
        settlementStatus = "completed";
        settlementDate =
          settlementTx.metadata.settledAt || settlementTx.createdAt;
      }
    }

    // Legacy fallback if needed (but prefer metadata)
    // ... (add if you have legacy data)

    res.status(200).json({
      success: true,
      data: {
        roundId: round._id,
        holdTransactionId: activeHoldTransactionId, // For backward compat, active one
        holdTransactionData: activeHoldTransactionData,
        transactions: roundTransactions, // All history
        settlementStatus,
        settlementDate,
      },
    });
  } catch (error) {
    console.error("Error fetching interview round transaction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transaction data",
      error: error.message,
    });
  }
};

const getInterviewDataforOrg = async (req, res) => {
  try {
    // const { interviewId } = req.params;

    const { interviewId, roundId } = req.query;

    // console.log("Received interviewId:", interviewId);
    // console.log("Received roundId:", roundId  );
    console.log("response rounds", interviewId, roundId)
    // ❌ Both not allowed (extra safety)
    if (interviewId && roundId) {
      return res.status(400).json({
        message: "Send only interviewId or roundId, not both",
      });
    }

    let finalInterviewId;

    // 1️⃣ Resolve interviewId
    if (interviewId) {
      finalInterviewId = interviewId;
    } else if (roundId) {
      const round = await InterviewRounds.findById(roundId)
        .select("interviewId")
        .lean();

      if (!round) {
        return res.status(404).json({ message: "Round not found" });
      }

      finalInterviewId = round.interviewId;
    } else {
      return res.status(400).json({
        message: "interviewId or roundId is required",
      });
    }

    // 1️⃣ Fetch interview
    let interview = await Interview.findById(finalInterviewId)
      .populate({
        path: "candidateId",
        select: "FirstName LastName Email",
      })
      .populate({
        path: "positionId",
        select: "title companyname Location skills minexperience maxexperience",
        populate: {
          path: "companyname",
          select: "name",
        },
      })
      .populate("templateId")
      .populate("applicationId") // <--- Added this
      .lean();

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Fetch Resume data for candidate (skills, experience, etc. moved from Candidate)
    if (interview.candidateId?._id) {
      const activeResume = await Resume.findOne({
        candidateId: interview.candidateId._id,
        isActive: true,
      })
        .select("CurrentRole skills CurrentExperience ImageData")
        .lean();

      if (activeResume) {
        interview.candidateId = {
          ...interview.candidateId,
          CurrentRole: activeResume.CurrentRole,
          skills: activeResume.skills,
          CurrentExperience: activeResume.CurrentExperience,
          ImageData: activeResume.ImageData,
        };
      }
    }

    // 2️⃣ Fetch rounds with accepted interviewers populated
    const rounds = await InterviewRounds.find({ interviewId: finalInterviewId })
      .populate({
        path: "interviewers",
        select: "firstName lastName email",
      })
      .lean();
    console.log("response rounds", rounds)
    // const roundIds = rounds.map((r) => r._id);

    // added for feedback form fetch specific round
    const filteredRounds = roundId
      ? rounds.filter((r) => String(r._id) === String(roundId))
      : rounds;

    const roundIds = filteredRounds.map((r) => r._id);

    // 3️⃣ Fetch questions
    const questions = await interviewQuestions
      .find({ roundId: { $in: roundIds } })
      .select("roundId questionId snapshot")
      .lean();

    const questionMap = {};
    questions.forEach((q) => {
      const key = String(q.roundId);
      if (!questionMap[key]) questionMap[key] = [];
      questionMap[key].push(q);
    });

    // 4️⃣ Fetch ONLY pending (inprogress) outsource requests
    const pendingRequests = await InterviewRequest.find({
      roundId: { $in: roundIds },
      status: "inprogress",
    })
      .populate({
        path: "interviewerId",
        select: "firstName lastName email",
      })
      .lean();

    // Map: roundId → array of pending requests
    const pendingRequestMap = {};
    pendingRequests.forEach((req) => {
      const roundKey = String(req.roundId);
      if (!pendingRequestMap[roundKey]) {
        pendingRequestMap[roundKey] = [];
      }
      pendingRequestMap[roundKey].push(req);
    });

    // ============================================================
    // 5️⃣ ASSESSMENT PART (IMPORTANT)
    // ============================================================

    // Collect scheduleAssessmentIds ONLY for Assessment rounds
    const assessmentScheduleIds = rounds
      .filter((r) => r.roundTitle === "Assessment" && r.scheduleAssessmentId)
      .map((r) => r.scheduleAssessmentId);

    let scheduledAssessmentMap = {};

    if (assessmentScheduleIds.length > 0) {
      // 5.1 Fetch Scheduled Assessments
      const scheduledAssessments = await ScheduledAssessment.find({
        _id: { $in: assessmentScheduleIds },
        isActive: true,
      })
        .select("scheduledAssessmentCode expiryAt status order createdAt")
        .lean();

      // 5.2 Fetch Candidate Assessments
      let candidateAssessments = await CandidateAssessment.find({
        scheduledAssessmentId: { $in: assessmentScheduleIds },
      })
        .populate({
          path: "candidateId",
          select: "FirstName LastName Email Phone",
        })
        .select(
          "scheduledAssessmentId candidateId status progress remainingTime totalScore expiryAt createdAt updatedAt",
        )
        .lean();

      // 5.2.1 Fetch Resume data for all candidates
      const candIds = candidateAssessments
        .filter((ca) => ca.candidateId?._id)
        .map((ca) => ca.candidateId._id);

      if (candIds.length > 0) {
        const resumes = await Resume.find({
          candidateId: { $in: candIds },
          isActive: true,
        })
          .select("candidateId CurrentRole skills CurrentExperience ImageData")
          .lean();

        const resumeMap = {};
        resumes.forEach((r) => {
          resumeMap[String(r.candidateId)] = r;
        });

        // Merge Resume data into candidateId
        candidateAssessments = candidateAssessments.map((ca) => {
          if (ca.candidateId?._id) {
            const resume = resumeMap[String(ca.candidateId._id)];
            if (resume) {
              ca.candidateId = {
                ...ca.candidateId,
                CurrentRole: resume.CurrentRole,
                skills: resume.skills,
                CurrentExperience: resume.CurrentExperience,
                ImageData: resume.ImageData,
              };
            }
          }
          return ca;
        });
      }

      // 5.3 Group candidates by scheduledAssessmentId
      const candidateMap = {};
      candidateAssessments.forEach((ca) => {
        const key = String(ca.scheduledAssessmentId);
        if (!candidateMap[key]) candidateMap[key] = [];
        candidateMap[key].push(ca);
      });

      // 5.4 Attach candidates to ScheduledAssessment
      scheduledAssessments.forEach((sa) => {
        scheduledAssessmentMap[String(sa._id)] = {
          ...sa,
          candidates: candidateMap[String(sa._id)] || [],
        };
      });
    }



    // ============================================================
    // 6️⃣ Build final rounds
    // ============================================================
    const fullRounds = filteredRounds.map((round) => {
      const isAssessment = round.roundTitle === "Assessment";

      return {
        ...round,
        interviewers: round.interviewers || [],
        questions: questionMap[String(round._id)] || [],
        pendingOutsourceRequests: pendingRequestMap[String(round._id)] || [],

        // 🔥 ONLY for Assessment rounds
        scheduledAssessment: isAssessment
          ? scheduledAssessmentMap[String(round.scheduleAssessmentId)] || null
          : undefined,
      };
    });

    interview.rounds = fullRounds;

    return res.json({
      success: true,
      data: interview,
    });
  } catch (err) {
    console.error("Interview Fetch Failed:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// Export all controller functions
module.exports = {
  createInterview,
  getAllInterviews,
  getAllInterviewRounds, // Added new function
  getInterviewRoundTransaction, // Added transaction fetch function
  updateInterview,
  // saveInterviewRound,
  // updateInterviewRound,
  getDashboardStats,
  deleteRound,
  getInterviews,
  checkInternalInterviewUsage,
  updateInterviewStatus: updateInterviewStatusController,
  deleteInterview,
  getInterviewDataforOrg,
};
