// v1.0.0  - mansoor - removed the sort by createdAt in the mock interview controller to save the mockinterview in the online
// v1.0.1 - Ashok - added the sort by _id in the createMockInterview controller
// v1.0.2 - Added backend validation for mock interview
// controllers/mockInterviewController.js
const mongoose = require("mongoose");
const { MockInterview } = require("../models/Mockinterview/mockinterview");
const {
  MockInterviewRound,
} = require("../models/Mockinterview/mockinterviewRound");
const { generateUniqueId } = require("../services/uniqueIdGeneratorService");
const {
  validateMockInterview,
  validateMockInterviewUpdate,
} = require("../validations/mockInterviewValidation");
const FeedbackModel = require("../models/feedback"); // Import FeedbackModel
const {
  // sendOutsourceInterviewRequestEmails,
  sendInterviewRoundCancellationEmails,
  sendInterviewerCancelledEmails,
} = require("./EmailsController/interviewEmailController.js");
const {
  WALLET_BUSINESS_TYPES,
  createWalletTransaction,
  applySelectionTimeWalletHoldForOutsourcedRound,
  processAutoSettlement,
  processWithdrawnRefund,
} = require("../utils/interviewWalletUtil");
const {
  handleInterviewerRequestFlow,
} = require("../utils/Interviews/handleInterviewerRequestFlow.js");
const {
  buildSmartRoundUpdate,
  getRoundScoreFromOutcome,
} = require("./interviewRoundsController.js");
const InterviewRequest = require("../models/InterviewRequest.js");
const { scheduleOrRescheduleNoShow } = require("../services/interviews/roundNoShowScheduler.js");
// Get single mock interview with rounds by id
// GET /mockinterview/:id
// exports.getMockInterviewDetails = async (req, res) => {
//   res.locals.loggedByController = true;
//   res.locals.processName = "Get Mock Interview Details";

//   const { id } = req.params;
//   const { actingAsUserId, actingAsTenantId } = res.locals.auth;

//   try {
//     // Validate auth context
//     if (!actingAsUserId || !actingAsTenantId) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized: Missing user or tenant context",
//       });
//     }

//     // Validate ID
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid mock interview ID",
//       });
//     }

//     // Fetch mock interview
//     const mockInterview = await MockInterview.findById(id)
//       .select("-__v") // optional: exclude version key
//       .lean();

//     if (!mockInterview) {
//       return res.status(404).json({
//         success: false,
//         message: "Mock interview not found",
//       });
//     }

//     // Fetch the single round with populated interviewers
//     const round = await MockInterviewRound.findOne({ mockInterviewId: id })
//       .populate({
//         path: "interviewers",
//         model: "Contacts",
//         select: "firstName lastName email Name", // include Name for consistency
//       })
//       .lean();

//     // 4️⃣ Fetch ONLY pending (inprogress) outsource requests
//     const pendingRequests = await InterviewRequest.find({
//       roundId: { $in: round._id },
//       status: "inprogress",
//     })
//       .populate({
//         path: "interviewerId",
//         select: "firstName lastName email",
//       })
//       .lean();

//     // Map: roundId → array of pending requests
//     const pendingRequestMap = {};
//     pendingRequests.forEach((req) => {
//       const roundKey = String(req.roundId);
//       if (!pendingRequestMap[roundKey]) {
//         pendingRequestMap[roundKey] = [];
//       }
//       pendingRequestMap[roundKey].push(req);
//     })
//     // Combine data
//     const data = {
//       ...mockInterview,
//       rounds: round ? [round] : [], // always return as array for consistency
//       pendingOutsourceRequests: pendingRequestMap[String(round._id)] || [],
//     };

//     return res.status(200).json({
//       success: true,
//       message: "Mock interview details fetched successfully",
//       data,
//     });
//   } catch (error) {
//     console.error("Error fetching mock interview details:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch mock interview details",
//       error: error.message,
//     });
//   }
// };

exports.getMockInterviewDetails = async (req, res) => {
  try {
    const { mockInterviewId, mockInterviewRoundId } = req.query;

    console.log(
      "req.query mockInterviewId",
      mockInterviewId,
      mockInterviewRoundId,
    );

    // ❌ Both not allowed
    if (mockInterviewId && mockInterviewRoundId) {
      return res.status(400).json({
        message: "Send only mockInterviewId or mockInterviewRoundId, not both",
      });
    }

    let finalMockInterviewId;
    let isFromRound = false;

    /* ------------------------------------------------
       1️⃣ Resolve mockInterviewId
    ------------------------------------------------ */

    if (mockInterviewId) {
      if (!mongoose.Types.ObjectId.isValid(mockInterviewId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid mockInterviewId",
        });
      }
      finalMockInterviewId = mockInterviewId;
    } else if (mockInterviewRoundId) {
      if (!mongoose.Types.ObjectId.isValid(mockInterviewRoundId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid mockInterviewRoundId",
        });
      }

      const round = await MockInterviewRound.findById(mockInterviewRoundId)
        .select("mockInterviewId")
        .lean();

      if (!round) {
        return res.status(404).json({
          success: false,
          message: "Mock interview round not found",
        });
      }

      finalMockInterviewId = round.mockInterviewId;
      isFromRound = true; // 🔥 important flag
    } else {
      return res.status(400).json({
        message: "mockInterviewId or mockInterviewRoundId is required",
      });
    }

    /* ------------------------------------------------
       2️⃣ Fetch Mock Interview
    ------------------------------------------------ */

    const mockInterview = await MockInterview.findById(finalMockInterviewId)
      .select("-__v")
      .lean();

    if (!mockInterview) {
      return res.status(404).json({
        success: false,
        message: "Mock interview not found",
      });
    }

    /* ------------------------------------------------
       3️⃣ Fetch Rounds
    ------------------------------------------------ */

    const rounds = await MockInterviewRound.find({
      mockInterviewId: finalMockInterviewId,
    })
      .populate({
        path: "interviewers",
        model: "Contacts",
        select: "firstName lastName email Name profilePicture",
      })
      .lean();

    const filteredRounds = isFromRound
      ? rounds.filter((r) => String(r._id) === String(mockInterviewRoundId))
      : rounds;

    /* ------------------------------------------------
       4️⃣ Fetch Interview Requests (ONLY if NOT round-based)
    ------------------------------------------------ */

    let pendingRequestMap = {};

    if (!isFromRound) {
      const roundIds = filteredRounds.map((r) => r._id);

      const pendingRequests = await InterviewRequest.find({
        roundId: { $in: roundIds },
        status: "inprogress",
      })
        .populate({
          path: "interviewerId",
          select: "firstName lastName email",
        })
        .lean();

      pendingRequests.forEach((req) => {
        const key = String(req.roundId);
        if (!pendingRequestMap[key]) pendingRequestMap[key] = [];
        pendingRequestMap[key].push(req);
      });
    }

    /* ------------------------------------------------
       5️⃣ Build Final Rounds
    ------------------------------------------------ */

    const fullRounds = filteredRounds.map((round) => ({
      ...round,
      interviewers: round.interviewers || [],
      questions: [], // Mock has no questions
      pendingOutsourceRequests: isFromRound
        ? [] // ❌ explicitly empty
        : pendingRequestMap[String(round._id)] || [],
      scheduledAssessment: null,
    }));

    /* ------------------------------------------------
       6️⃣ Final Response
    ------------------------------------------------ */

    return res.json({
      success: true,
      data: {
        ...mockInterview,
        rounds: fullRounds,
      },
    });
  } catch (error) {
    console.error("Mock Interview Fetch Failed:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// exports.getMockInterviewDetails = async (req, res) => {
//   // const { id } = req.params;

//   const { mockInterviewId, mockInterviewRoundId } = req.query;

//   // ❌ Both not allowed (extra safety)
//   if (mockInterviewId && mockInterviewRoundId) {
//     return res.status(400).json({
//       message: "Send only mock InterviewId or mock Interview RoundId, not both",
//     });
//   }

//   let finalMockInterviewId;
//   let isFromRound = false;

//   try {
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid mock interview ID" });
//     }

//     // 1. Fetch main mock interview document
//     const mockInterview = await MockInterview.findById(id)
//       .select("-__v")
//       .lean();

//     if (!mockInterview) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Mock interview not found" });
//     }

//     // 2. Fetch the single round (if exists) with populated interviewers
//     const round = await MockInterviewRound.findOne({ mockInterviewId: id })
//       .populate({
//         path: "interviewers",
//         model: "Contacts",
//         select: "firstName lastName email Name profilePicture",
//       })
//       .lean();

//     // 3. Fetch pending outsource requests — only if round exists
//     let pendingOutsourceRequests = [];

//     if (round) {
//       pendingOutsourceRequests = await InterviewRequest.find({
//         roundId: round._id,
//         status: "inprogress",
//       })
//         .populate({
//           path: "interviewerId",
//           select: "firstName lastName email",
//         })
//         .lean();
//     }

//     // 4. Build enriched round (pending requests only here)
//     const enrichedRound = round
//       ? {
//           ...round,
//           interviewers: round.interviewers || [],
//           questions: [], // Mock has no questions
//           pendingOutsourceRequests, // ← only here, per round
//           scheduledAssessment: null, // Mock never has this
//         }
//       : null;

//     // 5. Final clean response — NO pending requests at root level
//     const responseData = {
//       ...mockInterview,
//       // Rounds array (empty or with 1 enriched round)
//       rounds: enrichedRound ? [enrichedRound] : [],
//     };

//     return res.json({
//       success: true,
//       data: responseData,
//     });
//   } catch (error) {
//     console.error("Error fetching mock interview details:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch mock interview details",
//       error: error.message,
//     });
//   }
// };

// Only creates the MockInterview (candidate details) - NO ROUNDS
exports.createMockInterview = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Create mock interview";
  console.log("req.body", req.body);

  try {
    const validation = validateMockInterview(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const {
      skills,
      ownerId: bodyOwnerId,
      tenantId: bodyTenantId,
      candidateName,
      higherQualification,
      currentExperience,
      currentRole,
      jobDescription,
      createdById,
      lastModifiedById,
    } = req.body;

    // Extract tenantId and ownerId from auth context (priority) or body
    const authContext = res.locals.auth || {};
    const tenantId = authContext.actingAsTenantId || bodyTenantId;
    const ownerId = authContext.actingAsUserId || bodyOwnerId;


    // Generate unique mockInterviewCode
    const mockInterviewCode = await generateUniqueId(
      "MINT",
      MockInterview,
      "mockInterviewCode",
    );

    // Create mock interview - ONLY candidate/core data
    const mockInterview = new MockInterview({
      skills: skills || [],
      currentRole,
      candidateName,
      higherQualification,
      currentExperience,
      jobDescription,
      ownerId,
      tenantId,
      mockInterviewCode,
      createdBy: createdById || ownerId,
      updatedBy: lastModifiedById || createdById || ownerId,
    });

    const newMockInterview = await mockInterview.save();

    // Feed & logs
    res.locals.feedData = {
      tenantId,
      feedType: "info",
      action: {
        name: "mock_interview_created",
        description: "Mock interview created successfully",
      },
      ownerId,
      parentId: newMockInterview._id,
      parentObject: "Mock interview",
      metadata: req.body,
      severity: "low",
      message: "Mock interview created successfully",
    };

    res.locals.logData = {
      tenantId,
      ownerId,
      processName: "Create mock interview",
      requestBody: req.body,
      message: "Mock interview created successfully",
      status: "success",
      responseBody: { mockInterview: newMockInterview },
    };

    return res.status(201).json({
      status: "success",
      message: "Mock interview created successfully",
      data: {
        mockInterview: newMockInterview,
      },
    });
  } catch (error) {
    console.error("Error creating mock interview:", error);

    res.locals.logData = {
      tenantId: req.body?.tenantId,
      ownerId: req.body?.ownerId,
      processName: "Create mock interview",
      requestBody: req.body,
      message: error.message || "Unknown error",
      status: "error",
    };

    return res.status(500).json({
      status: "error",
      message: "Failed to create mock interview. Please try again later.",
      data: { error: error.message },
    });
  }
};

// Only updates the MockInterview document - NO ROUND HANDLING
exports.updateMockInterview = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Update mock interview";

  console.log("req.body updateMockInterview", req.body);

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid mock ID" });
  }

  const mockId = new mongoose.Types.ObjectId(req.params.id);

  try {
    const validation = validateMockInterviewUpdate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const {
      skills,
      ownerId,
      tenantId,
      candidateName,
      higherQualification,
      currentExperience,
      currentRole,
      jobDescription,
      lastModifiedById,
    } = validation.validatedData;

    const existingMockInterview = await MockInterview.findById(mockId);
    if (!existingMockInterview) {
      return res.status(404).json({
        status: "error",
        message: "Mock interview not found",
      });
    }

    console.log("existingMockInterview", existingMockInterview);

    // LAZY FIX: If tenantId is missing on the record, set it from auth context
    const authContext = res.locals.auth || {};
    if (!existingMockInterview.tenantId && authContext.actingAsTenantId) {
      existingMockInterview.tenantId = authContext.actingAsTenantId;
      existingMockInterview.markModified("tenantId");
      console.log("Lazy-fixed missing tenantId for mock interview:", mockId);
    }

    // let changes = [];

    // // Update skills
    // if (skills && Array.isArray(skills)) {
    //   if (
    //     JSON.stringify(existingMockInterview.skills) !== JSON.stringify(skills)
    //   ) {
    //     changes.push({
    //       fieldName: "skills",
    //       oldValue: existingMockInterview.skills,
    //       newValue: skills,
    //     });

    //     existingMockInterview.skills = skills;

    //     // 🔴 REQUIRED for array / nested updates
    //     existingMockInterview.markModified("skills");
    //     // existingMockInterview.skills = skills;
    //   }
    // }

    // // Update basic fields
    // // const basicFields = {
    // //   candidateName,
    // //   higherQualification,
    // //   currentExperience,
    // //   currentRole,
    // //   jobDescription,
    // // };

    // // Update basic fields (use req.body as fallback)
    // const basicFields = {
    //   candidateName: candidateName ?? req.body.candidateName,
    //   higherQualification: higherQualification ?? req.body.higherQualification,
    //   currentExperience: currentExperience ?? req.body.currentExperience,
    //   currentRole: currentRole ?? req.body.currentRole,
    //   jobDescription: jobDescription ?? req.body.jobDescription,
    // };

    // Object.keys(basicFields).forEach((field) => {
    //   if (
    //     basicFields[field] !== undefined &&
    //     existingMockInterview[field] !== basicFields[field]
    //   ) {
    //     changes.push({
    //       fieldName: field,
    //       oldValue: existingMockInterview[field],
    //       newValue: basicFields[field],
    //     });

    //     // const oldVal = existingMockInterview[field];
    //     const newVal = basicFields[field];

    //     existingMockInterview.set(field, newVal);
    //     existingMockInterview.markModified(field); // 🔴 REQUIRED
    //     // existingMockInterview[field] = basicFields[field];
    //   }
    // });

    const updatePayload = {};
    const changes = [];

    /* ---------- SKILLS (ARRAY) ---------- */
    if (Array.isArray(skills)) {
      if (
        JSON.stringify(existingMockInterview.skills) !== JSON.stringify(skills)
      ) {
        updatePayload.skills = skills;
        changes.push({
          fieldName: "skills",
          oldValue: existingMockInterview.skills,
          newValue: skills,
        });
      }
    }

    /* ---------- BASIC FIELDS ---------- */
    const allowedFields = {
      candidateName,
      higherQualification,
      currentExperience,
      currentRole,
      jobDescription,
    };

    Object.entries(allowedFields).forEach(([field, newValue]) => {
      if (newValue !== undefined && existingMockInterview[field] !== newValue) {
        updatePayload[field] = newValue;
        changes.push({
          fieldName: field,
          oldValue: existingMockInterview[field],
          newValue,
        });
      }
    });

    if (changes.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No changes detected",
        data: { mockInterview: existingMockInterview },
      });
    }

    // Update metadata
    if (lastModifiedById) existingMockInterview.updatedBy = lastModifiedById;
    existingMockInterview.updatedAt = new Date();

    console.log("changes", changes);

    // Save only if there are changes
    if (changes.length > 0) {
      // const updatedMockInterview = await existingMockInterview.save();

      const updatedMockInterview = await MockInterview.findByIdAndUpdate(
        mockId,
        { $set: updatePayload },
        { new: true },
      );

      console.log("updatedMockInterview", updatedMockInterview);

      // Feed data
      res.locals.feedData = {
        tenantId: tenantId || existingMockInterview.tenantId,
        feedType: "update",
        action: {
          name: "mock_interview_updated",
          description: "Mock interview updated successfully",
        },
        ownerId: ownerId || existingMockInterview.ownerId,
        parentId: mockId,
        parentObject: "Mock interview",
        metadata: req.body,
        severity: "low",
        fieldMessage: changes.map(({ fieldName, oldValue, newValue }) => ({
          fieldName,
          message: `${fieldName} updated from '${oldValue}' to '${newValue}'`,
        })),
        history: changes,
      };

      res.locals.logData = {
        tenantId: tenantId || existingMockInterview.tenantId,
        ownerId: ownerId || existingMockInterview.ownerId,
        processName: "Update mock interview",
        requestBody: req.body,
        message: "Mock interview updated successfully",
        status: "success",
        responseBody: updatedMockInterview,
      };

      return res.status(200).json({
        status: "success",
        message: "Mock interview updated successfully",
        data: {
          mockInterview: updatedMockInterview,
          updateSummary: {
            totalChanges: changes.length,
          },
        },
      });
    } else {
      // No changes
      return res.status(200).json({
        status: "success",
        message: "No changes detected",
        data: {
          mockInterview: existingMockInterview,
        },
      });
    }
  } catch (error) {
    console.error("Error updating MockInterview:", error);

    res.locals.logData = {
      tenantId: req.body?.tenantId,
      ownerId: req.body?.ownerId,
      processName: "Update mock interview",
      requestBody: req.body,
      message: error.message || "Unknown error occurred",
      status: "error",
      responseError: error.stack || error.message,
    };

    return res.status(500).json({
      status: "error",
      message: "Failed to update mock interview. Please try again later.",
      data: { error: error.message },
    });
  }
};

// Create Round (Page 2 - first time)

// POST /mockinterview/:mockInterviewId/round
exports.createMockInterviewRound = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Create Mock Interview Round";

  const { mockInterviewId } = req.params;
  console.log("mockInterviewId", mockInterviewId);
  if (!mongoose.Types.ObjectId.isValid(mockInterviewId)) {
    return res.status(400).json({ message: "Invalid mock interview ID" });
  }

  try {
    const { round } = req.body;
    console.log("round", round);
    if (!round) {
      return res.status(400).json({ message: "Round data is required" });
    }

    // Fetch mock interview
    const mockInterview = await MockInterview.findById(mockInterviewId).lean();
    if (!mockInterview) {
      return res.status(404).json({ message: "Mock interview not found" });
    }

    // Enforce single round
    const existingRound = await MockInterviewRound.findOne({ mockInterviewId });
    if (existingRound) {
      return res.status(400).json({
        message:
          "A round already exists for this mock interview. Use PATCH to update.",
      });
    }

    // Process interviewers (contact → _id)
    if (round.interviewers) {
      round.interviewers = await processInterviewers(round.interviewers);
    }

    // Always external
    round.interviewerType = "External";

    // Determine status
    const hasSelectedInterviewers =
      Array.isArray(round.selectedInterviewers) &&
      round.selectedInterviewers.length > 0;
    const hasDateTime = !!round.dateTime;

    let finalStatus = "Draft";
    let generateMeetingLink = false;

    if (hasSelectedInterviewers && hasDateTime) {
      finalStatus = "RequestSent";
      generateMeetingLink = true;

    }

    // Create round
    const newRound = new MockInterviewRound({
      mockInterviewId,
      sequence: 1,
      interviewerType: "External",
      status: finalStatus,
      ...round,
    });

    const savedRound = await newRound.save();

    // =================== WALLET HOLD FOR OUTSOURCED (SELECTION TIME) ===================
    if (hasSelectedInterviewers && hasDateTime) {
      const walletHoldResponse =
        await applySelectionTimeWalletHoldForOutsourcedRound({
          req,
          res,
          interview: mockInterview, // reuse same helper (treat mock as interview)
          round: req.body.round,
          savedRound,
        });

      if (walletHoldResponse) {
        return walletHoldResponse; // error already sent
      }
    }

    // =================== CREATE OUTSOURCE REQUESTS & SEND EMAILS ===================
    if (hasSelectedInterviewers && hasDateTime) {
      // ================= CREATE INTERVIEW REQUEST for external (BACKEND ONLY) =================
      await handleInterviewerRequestFlow({
        interviewId: mockInterviewId,
        round: savedRound,
        expiryDateTime: round.expiryDateTime,
        selectedInterviewers: req.body.round?.selectedInterviewers,
        isMockInterview: true,
      });
    }

    // =================== HISTORY UPDATE (CREATE) ===================
    const historyUpdate = await buildSmartRoundUpdate({
      body: {
        ...savedRound,
        selectedInterviewers: req.body.round?.selectedInterviewers,
      },
      actingAsUserId: mockInterview.ownerId,
      isCreate: true,
    });

    if (historyUpdate) {
      await MockInterviewRound.findByIdAndUpdate(
        savedRound._id,
        historyUpdate,
        {
          new: true,
        },
      );
    }

    // =================== MEETING LINK (if virtual) ===================
    // Frontend will handle this after response (same as interview)
    // Or do it here if you want

    res.locals.logData = {
      tenantId: mockInterview.tenantId?.toString(),
      ownerId: mockInterview.ownerId?.toString(),
      processName: "Create Mock Interview Round",
      requestBody: req.body,
      status: "success",
      message: "Mock interview round created successfully",
      responseBody: { savedRound },
    };

    return res.status(201).json({
      status: "success",
      message: "Mock interview round created successfully",
      data: { round: savedRound },
      generateMeetingLink,
    });
  } catch (error) {
    console.error("Error creating mock interview round:", error);
    res.locals.logData = {
      processName: "Create Mock Interview Round",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };
    return res
      .status(500)
      .json({ message: "Failed to create round", error: error.message });
  }
};

// PATCH /mockinterview/:mockInterviewId/round/:roundId
exports.updateMockInterviewRound = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Update Mock Interview Round";

  const { mockInterviewId, roundId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(roundId)) {
    return res.status(400).json({ message: "Invalid round ID" });
  }

  try {
    const updateType = req.body.updateType;
    const round = req.body.round || req.body;
    console.log("round", round);
    console.log("updateType", updateType);
    if (!round) {
      return res.status(400).json({ message: "Round data is required" });
    }

    const existingRound = await MockInterviewRound.findById(roundId);
    if (
      !existingRound ||
      existingRound.mockInterviewId.toString() !== mockInterviewId
    ) {
      return res.status(404).json({ message: "Round not found" });
    }

    const mockInterview = await MockInterview.findById(mockInterviewId).lean();
    if (!mockInterview) {
      return res.status(404).json({ message: "Mock interview not found" });
    }

    // ── SPECIAL CASE: Only updating meeting link (called after creation) ──
    if (updateType === "MEETING_LINK_ONLY") {
      const updateOps = { $set: {} };

      // Use round (what frontend sends)
      if (round.meetingId) {
        updateOps.$set.meetingId = round.meetingId;
      }
      if (round.meetPlatform) {
        updateOps.$set.meetPlatform = round.meetPlatform;
      }

      const updatedRound = await MockInterviewRound.findByIdAndUpdate(
        roundId,
        updateOps,
        { new: true, runValidators: true },
      );

      return res.status(200).json({
        success: true,
        message: "Meeting link updated successfully",
        data: { round: updatedRound },
      });
    }

    // Process interviewers
    if (round.interviewers) {
      round.interviewers = await processInterviewers(round.interviewers);
    }

    const hasSelectedInterviewers =
      Array.isArray(round.selectedInterviewers) &&
      round.selectedInterviewers.length > 0;

    const hasAccepted = await InterviewRequest.exists({
      roundId: existingRound._id,
      status: "accepted",
    });

    let updatePayload = { $set: {}, $push: { history: [] } };
    let shouldcreateRequestFlow = false;
    let generateMeetingLink = false;

    // Always external
    if (round.interviewerType) updatePayload.$set.interviewerType = "External";

    // ==================================================================
    // OUTSOURCE LOGIC (EXACT SAME AS INTERVIEW)
    // ==================================================================

    // 1. Draft → RequestSent
    if (
      (existingRound.status === "Draft" ||
        existingRound.status === "Cancelled") &&
      hasSelectedInterviewers
    ) {
      updatePayload.$set.status = "RequestSent";
      shouldcreateRequestFlow = true;
      generateMeetingLink = true;

      const walletHoldResponse =
        await applySelectionTimeWalletHoldForOutsourcedRound({
          req,
          res,
          interview: mockInterview,
          round: req.body.round,
          savedRound: existingRound,
        });
      if (walletHoldResponse) return walletHoldResponse;
    }

    // 2. RequestSent → Draft (clear interviewers before acceptance)
    else if (
      existingRound.status === "RequestSent" &&
      updateType === "CLEAR_INTERVIEWERS"
    ) {
      if (hasAccepted) {
        return res.status(400).json({
          message: "Cannot cancel: An interviewer has already accepted.",
        });
      }

      await InterviewRequest.updateMany(
        { roundId: existingRound._id, status: "inprogress" },
        { status: "withdrawn", respondedAt: new Date() },
      );

      try {
        await processWithdrawnRefund({ roundId: existingRound._id.toString() });
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

    // 3. Scheduled/Rescheduled → Draft (cancel after acceptance)
    else if (
      ["Scheduled", "Rescheduled"].includes(existingRound.status) &&
      updateType === "CLEAR_INTERVIEWERS"
    ) {
      if (hasAccepted) {
        await processAutoSettlement({
          roundId: existingRound._id.toString(),
          action: "Cancelled",
        });

        await InterviewRequest.updateMany(
          { roundId: existingRound._id, status: "accepted" },
          { status: "cancelled", respondedAt: new Date() },
        );

        // Send cancellation email
        const acceptedReq = await InterviewRequest.findOne({
          roundId: existingRound._id,
          status: "accepted",
        });

        if (acceptedReq) {
          await sendInterviewerCancelledEmails({
            body: {
              interviewId: mockInterviewId,
              roundId: existingRound._id,
              cancelledInterviewerId: acceptedReq.interviewerId,
              type: "mockinterview",
              interviewerType: "External",
            },
          });
        }
      }

      updatePayload.$set.status = "Draft";
      updatePayload.$set.interviewers = [];
    }

    // Rescheduling (dateTime changed)
    else if (
      ["Scheduled", "Rescheduled"].includes(existingRound.status) &&
      updateType === "CLEAR_INTERVIEWERS"
      //  &&
      // changes.dateTimeChanged &&
      // round.dateTime
    ) {
      if (existingRound.status === "InProgress") {
        return res
          .status(400)
          .json({ message: "Cannot reschedule in-progress round" });
      }

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
              interviewId: mockInterviewId,
              roundId: roundId,
              cancelledInterviewerId: cancelledInterviewerId,
              type: "mockinterview",
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

    // === DATE/TIME CHANGE (always save if sent) ===
    if (req.body.round?.dateTime) {
      updatePayload.$set.dateTime = req.body.round.dateTime;
    }

    // === INSTRUCTIONS CHANGE ===
    if (req.body.round?.instructions !== undefined) {
      updatePayload.$set.instructions = req.body.round.instructions;
    }

    // Apply basic fields
    // if (round.dateTime) updatePayload.$set.dateTime = round.dateTime;
    // if (round.instructions !== undefined)
    //   updatePayload.$set.instructions = round.instructions;
    // if (round.interviewers)
    //   updatePayload.$set.interviewers = round.interviewers;

    const changes = await detectRoundChanges({
      existingRound,
      incomingRound: round,
      //  {
      // ...round,
      // status: updatePayload.$set.status,
      // selectedInterviewers: round.selectedInterviewers || [],
      // },
      selectedInterviewers: round.selectedInterviewers || [],
    });

    if (!changes.anyChange && updateType !== "CLEAR_INTERVIEWERS") {
      return res
        .status(200)
        .json({ message: "No changes detected", status: "noop" });
    }

    console.log("updatePayload", updatePayload);
    console.log("changes", changes);

    // History via smart update
    const smartUpdate = await buildSmartRoundUpdate({
      existingRound,
      body: {
        selectedInterviewers: req.body.round?.selectedInterviewers || [],
        dateTime: updatePayload.$set.dateTime,
        interviewerType:
          req.body.round?.interviewerType || existingRound.interviewerType,
        status: updatePayload.$set.status,
      },
      actingAsUserId: mockInterview?.ownerId,
      changes,
    });

    // === MERGE HISTORY ===
    let finalUpdate = updatePayload;

    console.log("smartUpdate history", smartUpdate?.history);

    if (smartUpdate?.$push?.history?.length > 0) {
      finalUpdate = {
        $set: updatePayload.$set,
        $push: {
          history: [
            ...updatePayload.$push.history,
            ...smartUpdate.$push.history,
          ],
        },
      };
    }

    // const finalUpdate = smartUpdate
    //   ? {
    //       $set: { ...updatePayload.$set, ...smartUpdate.$set },
    //       // $push: {
    //       //   history: [
    //       //     ...updatePayload.$push.history,
    //       //     ...smartUpdate.$push.history,
    //       //   ],
    //       // },
    //     }
    //   : updatePayload;

    console.log("finalUpdate", finalUpdate);

    const updatedRound = await MockInterviewRound.findByIdAndUpdate(
      roundId,
      finalUpdate,
      {
        new: true,
        runValidators: true,
      },
    );

    // Create new requests if needed
    if (shouldcreateRequestFlow && hasSelectedInterviewers) {
      await handleInterviewerRequestFlow({
        interviewId: mockInterviewId,
        round: updatedRound,
        expiryDateTime: req.body.round?.expiryDateTime,//passing directly expiryDateTime from req.body
        selectedInterviewers: req.body.round?.selectedInterviewers,
        isMockInterview: true,
      });
    }

    res.locals.logData = {
      tenantId: mockInterview.tenantId?.toString(),
      ownerId: mockInterview.ownerId?.toString(),
      processName: "Update Mock Interview Round",
      status: "success",
      message: "Mock interview round updated successfully",
    };

    return res.status(200).json({
      status: "success",
      message: "Mock interview round updated successfully",
      data: { round: updatedRound },
      generateMeetingLink,
    });
  } catch (error) {
    console.error("Error updating mock round:", error);
    return res
      .status(500)
      .json({ message: "Failed to update round", error: error.message });
  }
};

// DELETE mock interview by ID
exports.deleteMockInterview = async (req, res) => {
  try {
    const { mockInterviewId, roundId } = req.params;

    // Check if mock interview exists
    const interview = await MockInterview.findById(mockInterviewId);
    if (!interview) {
      return res
        .status(404)
        .json({ success: false, message: "Mock interview not found" });
    }

    // Check if round exists
    const round = await MockInterviewRound.findById(roundId);
    if (!round) {
      return res
        .status(404)
        .json({ success: false, message: "Mock interview round not found" });
    }

    // Update status to cancelled
    round.status = "Cancelled";
    await round.save();

    return res.status(200).json({
      success: true,
      message: "Round cancelled successfully",
      round,
    });
  } catch (error) {
    console.error("Cancel round error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while cancelling round",
    });
  }
};

exports.validateMockInterview = async (req, res) => {
  try {
    const { page } = req.params; // For page-wise validation
    const isPage1Only = page === "page1";

    // Validate the data
    const validation = validateMockInterview(req.body, isPage1Only);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Validation successful",
      data: validation.value,
    });
  } catch (error) {
    console.error("Error validating mock interview:", error);
    return res.status(500).json({
      success: false,
      message: "Validation error",
      errors: { general: error.message },
    });
  }
};

exports.updateInterviewRoundStatus = async (req, res) => {
  try {
    const { mockInterviewId, roundId } = req.params;
    console.log("req.params mockInterviewId", req.params);
    // Check if mock interview exists
    const interview = await MockInterview.findById(mockInterviewId);
    if (!interview) {
      return res
        .status(404)
        .json({ success: false, message: "Mock interview not found" });
    }

    // Check if round exists
    const round = await MockInterviewRound.findById(roundId);
    if (!round) {
      return res
        .status(404)
        .json({ success: false, message: "Mock interview round not found" });
    }

    // const { roundId } = req.params;
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

    console.log("req.body", req.body);

    // console.log("req.body", req.body);

    if (!roundId || (!action && !isParticipantUpdate)) {
      return res.status(400).json({
        success: false,
        message: "roundId and action are required",
      });
    }

    const existingRound = await MockInterviewRound.findById(roundId)
      .populate("mockInterviewId", "title candidateName")
      .populate("interviewers", "firstName lastName email");

    if (!existingRound) {
      return res
        .status(404)
        .json({ success: false, message: "Round not found" });
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
      };

      newStatus = actionToStatusMap[action];
      if (!newStatus) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid action" });
      }
    }

    // ===== SAFE PARTICIPANT UPSERT (NO DUPLICATES, NO FAIL) =====
    if (isParticipantUpdate) {
      const { role, userId, joined } = req.body;
      newStatus = action;

      const status = joined ? "Joined" : "Not_Joined";
      const joinedAt = joined ? new Date() : null;

      const match =
        role === "Candidate" ? { role: "Candidate" } : { role, userId };

      // Update existing participant if exists
      let updatedRound = await MockInterviewRound.findOneAndUpdate(
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

        updatedRound = await MockInterviewRound.findByIdAndUpdate(
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

    // Interviewer IDs from round
    const interviewerIds = (existingRound?.interviewers || []).map((id) => id);


    const draftCount = await FeedbackModel.countDocuments({
      interviewRoundId: existingRound?._id,
      interviewerId: { $in: interviewerIds },
      status: "draft",
    });

    const allInterviewersDraft = draftCount === interviewerIds.length;

    console.log("interviewerIds", allInterviewersDraft);

    let smartUpdate = null;

    //  when candidate and interviewer both are present in the round then create history
    if (req.body?.History_Type === "Histoy_Handling") {
      // Special handling: only create history if conditions are met
      const participants = existingRound?.participants || [];
      // const isHistoryHandled = participants.some(
      //   (p) => p.role.toLowerCase() === "interviewer" && p.role === "Candidate",
      // );


      const hasInterviewer = participants.some(
        (p) => p.role === "Interviewer"
      );

      const hasCandidate = participants.some(
        (p) => p.role === "Candidate"
      );

      const isHistoryHandled = hasInterviewer && hasCandidate;


      // && action === "InProgress"
      if (isHistoryHandled) {
        // ONE-TIME SPECIAL HISTORY CREATION

        // ONE-TIME SPECIAL HISTORY CREATION
        let actionStatus = "InProgress"
        const smartBody = {
          status: actionStatus,
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
        currentActionReason: reasonCode || null,
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
      } else {

        smartUpdate = await buildSmartRoundUpdate({
          existingRound,
          body: smartBody,
          actingAsUserId,
          statusChanged: true,
        });
      }
    }

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
            reasonCode: cancellationReason || reasonCode || null,
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
    // if (action === "Evaluated") {
    //   if (roundOutcome) {
    //     extraUpdate.$set.roundOutcome = roundOutcome;
    //     extraUpdate.$set.roundScore = getRoundScoreFromOutcome(roundOutcome);
    //   }
    //   if (reason) {
    //     extraUpdate.$set.currentActionReason = reason;
    //   }
    //   if (comment) {
    //     extraUpdate.$set.comments = comment;
    //   }
    // }

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

    console.log("smartUpdate", smartUpdate);

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
    const updatedRound = await MockInterviewRound.findByIdAndUpdate(
      roundId,
      finalUpdate,
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("mockInterviewId", "title candidateName")
      .populate("interviewers", "firstName lastName email");

    // Send cancellation email
    if (shouldSendCancellationEmail) {
      await sendInterviewRoundCancellationEmails(
        {
          body: {
            interviewId: updatedRound.mockInterviewId,
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

// function buildSmartRoundUpdate({
//   existingRound,
//   body,
//   actingAsUserId,
//   changes,
//   isCreate = false,
//   statusChanged = false,
// }) {
//   const update = { $set: {}, $push: { history: [] } };

//   const isInternal = body.interviewerType === "Internal";
//   const isExternal = !isInternal;

//   console.log("body", body);
//   console.log("changes", changes);
//   console.log("isExternal", isExternal);

//   const now = new Date();

//   /* ---------------- Helpers ---------------- */

//   const resolveComment = (reasonCode, comment) =>
//     reasonCode === "Other" ? comment || null : null;

//   const extractInterviewers = () =>
//     Array.isArray(body.selectedInterviewers)
//       ? body.selectedInterviewers.map((i) => i.contact?._id || i._id)
//       : [];

//   const addHistory = ({
//     action,
//     scheduledAt,
//     reasonCode = null,
//     comment = null,
//   }) => {
//     update.$push.history.push({
//       action,
//       scheduledAt,
//       reasonCode,
//       comment: resolveComment(reasonCode, comment),
//       interviewers: body.status === "Draft" ? [] : extractInterviewers(),
//       participants: [],
//       createdBy: actingAsUserId,
//       createdAt: now,
//     });
//   };

//   /* ================= CREATE ================= */

//   //  intial create round history
//   if (isCreate) {
//     update.$set.status = body.status;
//     update.$set.currentAction = body.status;
//     update.$set.previousAction = null;
//     update.$set.currentActionReason = body.currentActionReason || null;

//     if (body.dateTime) {
//       addHistory({
//         action: body.status,
//         scheduledAt: body.dateTime,
//         reasonCode: body.currentActionReason,
//         comment: body.comments,
//       });
//     }

//     return update;
//   }

//   // status api history create
//   if (statusChanged) {
//     update.$set.previousAction = existingRound.currentAction || null;
//     update.$set.currentAction = body.status;
//     update.$set.status = body.status;
//     update.$set.currentActionReason =
//       body.currentActionReason ||
//       body.rescheduleReason ||
//       body.cancellationReason ||
//       null;

//     // /* ---------- adding histotry status changing ---------- */

//     addHistory({
//       action: body.status, //existingRound.status,
//       scheduledAt: existingRound.dateTime,
//       reasonCode: body.currentActionReason,
//       comment: body.comments,
//     });

//     return update;
//   }

//   if (!changes?.anyChange) return null;

//   /* ============= GENERIC FIELD UPDATE ============= */

//   Object.keys(body).forEach((key) => {
//     if (key !== "status" && body[key] !== undefined) {
//       update.$set[key] = body[key];
//     }
//   });

//   /* ============= RESCHEDULE WITHOUT STATUS CHANGE ============= */

//   if (
//     (changes.dateTimeChanged &&
//       ["Scheduled", "Rescheduled", "RequestSent", "Draft"].includes(
//         existingRound.status
//       )) ||
//     (changes.statusChanged && body.status)
//   ) {
//     update.$set.previousAction = existingRound.currentAction || null;
//     update.$set.currentAction = body.status; // || existingRound.status;
//     update.$set.currentActionReason = body.rescheduleReason || "time_changed";

//     addHistory({
//       action: body.status, //existingRound.status,
//       scheduledAt: body.dateTime,
//       reasonCode: update.$set.currentActionReason,
//       comment: body.comments,
//     });
//   }

//   /* ============= CLEANUP ============= */

//   if (!update.$push.history.length) delete update.$push;
//   if (!Object.keys(update.$set).length) delete update.$set;
//   if (!update.$push && !update.$set) return null;

//   return update;
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
    // questionsChanged: false,
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
