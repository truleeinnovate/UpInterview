//<----v1.0.0---Venkatesh-----get feedback by tenant ID

const FeedbackModel = require("../models/feedback.js");
const mongoose = require("mongoose"); // Import mongoose to use ObjectId
const { triggerWebhook, EVENT_TYPES } = require("../services/webhookService");

const InterviewQuestions = require("../models/Interview/selectedInterviewQuestion.js");
const { InterviewRounds } = require("../models/Interview/InterviewRounds.js");
const CandidatePosition = require("../models/CandidatePosition.js");
const { Contacts } = require("../models/Contacts.js");
const { Interview } = require("../models/Interview/Interview.js");
const { Resume } = require("../models/Resume.js");
const Tenant = require("../models/Tenant.js");

// Import validation functions
const {
  validateCreateFeedback,
  validateUpdateFeedback,
  validateFeedbackBusinessRules,
} = require("../validations/feedbackValidation");
const {
  MockInterviewRound,
} = require("../models/Mockinterview/mockinterviewRound.js");
const { MockInterview } = require("../models/Mockinterview/mockinterview.js");
const { processAutoSettlement } = require("../utils/interviewWalletUtil.js");
const { buildSmartRoundUpdate } = require("./interviewRoundsController.js");

// const mongoose = require("mongoose");
// const FeedbackModel = require("../models/InterviewFeedback");
// const InterviewRounds = require("../models/InterviewRounds");
// const InterviewQuestions = require("../models/InterviewQuestions");
// const Interview = require("../models/Interview");

// create feedback api
const createFeedback = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Create Feedback";

  try {
    // Validate input using Joi schema
    // const {
    //   isValid,
    //   errors,
    //   value: validatedData,
    // } = validateCreateFeedback(req.body);

    // if (!isValid) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Validation failed",
    //     errors,
    //   });
    // }

    // Apply additional business rule validations
    // const businessRuleErrors = validateFeedbackBusinessRules(validatedData);
    // if (businessRuleErrors) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Validation failed",
    //     errors: businessRuleErrors,
    //   });
    // }

    const {
      type, // "submit" | "draft"
      tenantId,
      ownerId,
      interviewRoundId,
      candidateId,
      positionId,
      interviewerId,
      technicalSkills,
      technicalCompetency,
      questionFeedback,
      questionsAsked,
      strengths,
      areasForImprovement,
      generalComments,
      additionalComments,
      overallImpression,

      isMockInterview,
      status,
      feedbackCode,
    } = req.body; //validatedData;

    // Extract tenantId and ownerId from auth context (priority) or body
    const authContext = res.locals.auth || {};
    // const tenantId = authContext.actingAsTenantId || bodyTenantId;
    // const ownerId = authContext.actingAsUserId || bodyOwnerId;

    // console.log("req.body qFeedback", req.body);

    // const filteredSkills = (skills || []).filter(s => s.skillName && s.skillName.trim() !== "");

    // Process questions: Transform Bank IDs/Objects to SelectedInterviewQuestion IDs
    const processedQuestionFeedback = [];

    // Resolve interviewId from round early
    let resolvedInterviewId = null;
    try {
      if (interviewRoundId) {
        const roundDoc =
          await InterviewRounds.findById(interviewRoundId).select(
            "interviewId",
          );
        resolvedInterviewId = roundDoc?.interviewId || null;
      }
    } catch (e) {
      console.warn(
        "Unable to resolve interviewId:",
        interviewRoundId,
        e?.message,
      );
    }

    if (questionFeedback && Array.isArray(questionFeedback)) {
      for (let i = 0; i < questionFeedback.length; i++) {
        const qFeedback = questionFeedback[i];
        const rawQuestion = qFeedback?.questionId;
        // console.log("rawQuestion", rawQuestion)

        let identifier = "";
        let bankDetails = null;

        if (typeof rawQuestion === "string") {
          identifier = rawQuestion;
        } else if (rawQuestion && typeof rawQuestion === "object") {
          identifier =
            rawQuestion.questionId || rawQuestion._id || rawQuestion.id;
          bankDetails = rawQuestion;
        }

        // console.log("bankDetails", bankDetails)

        if (!identifier) continue;

        // Verify if it's already a valid SelectedInterviewQuestion ID
        let selectedDoc = null;
        if (mongoose.Types.ObjectId.isValid(identifier)) {
          selectedDoc = await InterviewQuestions.findById(identifier);
        }

        if (!selectedDoc) {
          // Try to find by roundId + Bank ID
          // Ensure we only find shared questions OR questions owned by this interviewer
          const questionOwnerId =
            (interviewerId && interviewerId.toString()) ||
            (ownerId && ownerId.toString()) ||
            "";

          selectedDoc = await InterviewQuestions.findOne({
            roundId: interviewRoundId,
            questionId: identifier,
            $or: [
              { addedBy: { $ne: "interviewer" } },
              { ownerId: questionOwnerId },
            ],
          });

          if (!selectedDoc) {
            // Create new
            const snapshot = selectedDoc?.snapshot || bankDetails || {};
            const src = selectedDoc?.source || snapshot.source || "custom";
            const mand =
              selectedDoc?.mandatory || snapshot.mandatory || "false";

            selectedDoc = new InterviewQuestions({
              interviewId: resolvedInterviewId,
              roundId: interviewRoundId,
              order: i + 1,
              // mandatory: mand,
              tenantId: tenantId || "",
              ownerId: questionOwnerId,
              questionId: identifier,
              source: src,
              snapshot: snapshot,
              addedBy: "interviewer",
            });
            await selectedDoc.save();
          }
        }

        processedQuestionFeedback.push({
          questionId: selectedDoc._id, // Store _id of SelectedInterviewQuestion
          candidateAnswer: qFeedback.candidateAnswer || {
            answerType:
              (rawQuestion && rawQuestion.isAnswered) || "not answered",
            submittedAnswer: "",
          },
          interviewerFeedback: qFeedback.interviewerFeedback || {
            liked: (rawQuestion && rawQuestion.isLiked) || "none",
            note: (rawQuestion && rawQuestion.note) || "",
            dislikeReason: (rawQuestion && rawQuestion.whyDislike) || "",
          },
        });
      }
    }

    // Check if feedback already exists
    let existingFeedback = await FeedbackModel.findOne({
      interviewRoundId,
      candidateId,
      interviewerId,
    });

    if (existingFeedback) {
      if (type === "submit") {
        // Block duplicate submit
        return res.status(409).json({
          success: false,
          message:
            "Feedback already submitted for this candidate and round by this interviewer",
          feedbackId: existingFeedback._id,
        });
      }
    }

    // Find existing feedback if draft
    // let feedbackInstance;
    // if (type === "draft") {
    //   feedbackInstance = await FeedbackModel.findOne({
    //     interviewRoundId,
    //     candidateId,
    //     interviewerId,
    //   });

    //   if (feedbackInstance) {
    //     // Update draft
    //     feedbackInstance.skills = skills || feedbackInstance.skills;
    //     feedbackInstance.questionFeedback =
    //       processedQuestionFeedback || feedbackInstance.questionFeedback;
    //     feedbackInstance.generalComments =
    //       generalComments || feedbackInstance.generalComments;
    //     feedbackInstance.overallImpression =
    //       overallImpression || feedbackInstance.overallImpression;
    //     feedbackInstance.status = "draft";
    //   }
    // }

    // // Generate feedbackCode (only for new feedback)
    // let finalFeedbackCode = feedbackInstance?.feedbackCode;
    // if (!finalFeedbackCode && interviewRoundId && feedbackCode) {
    //   const existingCount = await FeedbackModel.countDocuments({
    //     interviewRoundId,
    //   });
    //   finalFeedbackCode =
    //     existingCount === 0
    //       ? `${feedbackCode}`
    //       : `${feedbackCode}-${existingCount + 1}`;
    // }

    // // Create new feedback (draft or submit)
    // if (!feedbackInstance) {
    //   feedbackInstance = new FeedbackModel({
    //     tenantId,
    //     ownerId,
    //     interviewRoundId,
    //     candidateId,
    //     positionId,
    //     interviewerId,
    //     skills,
    //     questionFeedback: processedQuestionFeedback,
    //     generalComments: generalComments || "",
    //     overallImpression: overallImpression || {},
    //     status: type === "submit" ? "submitted" : "draft",
    //     feedbackCode: finalFeedbackCode,
    //   });
    // }

    // Check if feedback already exists (draft or submitted)
    let feedbackInstance = await FeedbackModel.findOne({
      interviewRoundId,
      candidateId,
      interviewerId,
    });

    if (feedbackInstance) {
      if (type === "submit" && feedbackInstance.status === "submitted") {
        return res.status(409).json({
          success: false,
          message: "Feedback already submitted",
          feedbackId: existingFeedback._id,
        });
      }

      // Update existing draft
      feedbackInstance.tenantId = tenantId;
      feedbackInstance.ownerId = ownerId;
      feedbackInstance.positionId = positionId;
      if (technicalSkills !== undefined)
        feedbackInstance.technicalSkills = technicalSkills;
      if (technicalCompetency !== undefined)
        feedbackInstance.technicalCompetency = technicalCompetency;
      feedbackInstance.questionFeedback = processedQuestionFeedback;
      feedbackInstance.questionsAsked = processedQuestionFeedback;
      feedbackInstance.generalComments =
        generalComments || additionalComments || "";
      feedbackInstance.additionalComments =
        additionalComments || generalComments || "";
      if (strengths !== undefined) feedbackInstance.strengths = strengths;
      if (areasForImprovement !== undefined)
        feedbackInstance.areasForImprovement = areasForImprovement;
      feedbackInstance.overallImpression = overallImpression || {};
      feedbackInstance.status = type === "submit" ? "submitted" : "draft";
      feedbackInstance.isMockInterview = isMockInterview;
    } else {
      // Create New Feedback
      // Generate feedbackCode
      let finalFeedbackCode = feedbackCode; // Default to passed code

      if (interviewRoundId && feedbackCode) {
        // Count existing feedbacks for this round to append suffix
        const existingCount = await FeedbackModel.countDocuments({
          interviewRoundId,
        });
        // If it's the first one, maybe keep original or append -1?
        // Logic from before: existingCount === 0 ? code : code-count+1
        // Usually better to always append or always not.
        // Per commented code:
        finalFeedbackCode =
          existingCount === 0
            ? `${feedbackCode}`
            : `${feedbackCode}-${existingCount + 1}`;
      }

      feedbackInstance = new FeedbackModel({
        tenantId,
        ownerId,
        interviewRoundId,
        candidateId,
        positionId,
        interviewerId,
        technicalSkills,
        technicalCompetency,
        questionFeedback: processedQuestionFeedback,
        questionsAsked: processedQuestionFeedback,
        generalComments: generalComments || additionalComments || "",
        additionalComments: additionalComments || generalComments || "",
        strengths,
        areasForImprovement,
        overallImpression: overallImpression || {},
        status: type === "submit" ? "submitted" : "draft", // Fix logic to allow submitting new feedback directly
        feedbackCode: finalFeedbackCode,
        isMockInterview,
      });
    }

    await feedbackInstance.save();

    const finalStatus = feedbackInstance.status || feedbackInstance.status;

    //  Update interview round status
    if (finalStatus === "submitted") {
      //  Update interview round status
      let res = await updateInterviewRoundFeedbackStatus({
        interviewRoundId: feedbackInstance.interviewRoundId,
        isMock: feedbackInstance?.isMockInterview,
        actingAsUserId: authContext?.ownerId,
      });
      // console.log("finalStatus finalStatus", res)
    }

    // Trigger webhook for feedback submission only (not for drafts)
    // webhooks creation part of feed back this is used in account settings hrms sidebar tab in webhooks tab
    if (feedbackInstance.status === "submitted") {
      try {
        const webhookPayload = {
          feedbackId: feedbackInstance._id,
          feedbackCode: feedbackInstance.feedbackCode,
          tenantId: tenantId,
          ownerId: ownerId,
          interviewRoundId: interviewRoundId,
          candidateId: candidateId,
          positionId: positionId,
          interviewerId: interviewerId,
          status: feedbackInstance.status,
          submittedAt: feedbackInstance.createdAt,
          event: "feedback.created",
        };

        await triggerWebhook(
          EVENT_TYPES.FEEDBACK_STATUS_UPDATED,
          webhookPayload,
          tenantId,
        );
      } catch (webhookError) {
        console.error(
          "[FEEDBACK WEBHOOK] Error triggering feedback creation webhook:",
          webhookError,
        );
      }
    }

    // Final Response
    const responsePayload = {
      success: true,
      message:
        type === "submit"
          ? "Feedback submitted successfully"
          : "Draft saved successfully",
      data: {
        feedbackId: feedbackInstance._id,
        status: feedbackInstance.status,
        submittedAt: feedbackInstance.createdAt,
        interviewerId: interviewerId,
        totalQuestions: processedQuestionFeedback?.length || 0,
      },
    };

    res.locals.logData = {
      tenantId: feedbackInstance.tenantId?.toString() || tenantId || "",
      ownerId: feedbackInstance.ownerId?.toString() || ownerId || "",
      processName: "Create Feedback",
      requestBody: req.body,
      status: "success",
      message:
        type === "submit"
          ? "Feedback submitted successfully"
          : "Draft saved successfully",
      responseBody: feedbackInstance,
    };

    return res.status(201).json(responsePayload);
  } catch (error) {
    // console.error("Error creating/updating feedback:", error);

    res.locals.logData = {
      tenantId: req.body?.tenantId || "",
      ownerId: req.body?.ownerId || "",
      processName: "Create Feedback",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    return res.status(500).json({
      success: false,
      message: "Failed to process feedback",
      error: error.message,
    });
  }
};

//  update Feedback api
const updateFeedback = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Update Feedback";

  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Feedback ID is required",
      });
    }

    // Extract tenantId and ownerId from auth context (priority) or body
    const authContext = res.locals.auth || {};
    // Validate input using Joi schema
    // const {
    //   isValid,
    //   errors,
    //   value: validatedData,
    // } = validateUpdateFeedback(req.body);

    // if (!isValid) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Validation failed",
    //     errors,
    //   });
    // }

    // Apply additional business rule validations if updating to submit
    // if (
    //   validatedData.type === "submit" ||
    //   validatedData.status === "submitted"
    // ) {
    //   const businessRuleErrors = validateFeedbackBusinessRules(validatedData);
    //   if (businessRuleErrors) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Validation failed",
    //       errors: businessRuleErrors,
    //     });
    //   }
    // }

    const updateData = req.body; //validatedData;

    // console.log("Update Data Received:", updateData);

    // CHANGE 1: Get existing feedback first for comparison
    const existingFeedback = await FeedbackModel.findById(id);
    if (!existingFeedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    // CHANGE 2: Check if already submitted (can't edit)
    if (existingFeedback.status === "submitted") {
      return res.status(400).json({
        success: false,
        message: "Cannot update submitted feedback",
      });
    }

    // Preserve original questionFeedback from request for interviewer question processing
    const originalQuestionFeedback = Array.isArray(req.body?.questionFeedback)
      ? req.body.questionFeedback
      : [];

    // Preserve original questionFeedback from request for interviewer question processing
    // const originalQuestionFeedback = Array.isArray(req.body?.questionFeedback)
    //   ? req.body.questionFeedback
    //   : [];

    // // Normalize questionFeedback.questionId on updates (stringify IDs)
    // if (
    //   updateData.questionFeedback
    //   //  &&
    //   // Array.isArray(updateData.questionFeedback)
    // ) {
    //   updateData.questionFeedback = updateData.questionFeedback.map(
    //     (feedback) => {
    //       const raw = feedback?.questionId;
    //       let normalizedId = "";
    //       if (typeof raw === "string") normalizedId = raw;
    //       else if (raw && typeof raw === "object")
    //         normalizedId = raw.questionId || raw._id || raw.id || "";
    //       return {
    //         ...feedback,
    //         questionId: normalizedId,
    //       };
    //     },
    //   );
    // }

    // Find and update the feedback
    // let updatedFeedback = await FeedbackModel.findByIdAndUpdate(
    //   id,
    //   updateData,
    //   {
    //     new: true, // Return the updated document
    //     runValidators: true, // Run schema validators
    //   },
    // )
    //   .populate("candidateId", "FirstName LastName Email Phone")
    //   .populate("interviewerId", "FirstName LastName Email Phone")
    //   .populate("positionId", "title companyname")
    //   .lean();

    // CHANGE 3: Normalize AND check for changes
    let normalizedQuestionFeedback = null;
    let hasChanges = false;
    const updateObject = {};

    // Helper for deep comparison
    const isDeepEqual = (obj1, obj2) => {
      if (obj1 === obj2) return true;
      if (obj1 == null || obj2 == null) return false;
      return JSON.stringify(obj1) === JSON.stringify(obj2);
    };

    // Process questions: Transform Bank IDs/Objects to SelectedInterviewQuestion IDs
    if (
      updateData.questionFeedback &&
      Array.isArray(updateData.questionFeedback)
    ) {
      const processedQuestionFeedback = [];
      const interviewRoundId = existingFeedback.interviewRoundId;
      const tenantId = existingFeedback.tenantId;
      const ownerId = existingFeedback.ownerId;
      const interviewerId = existingFeedback.interviewerId;

      // Resolve interviewId from round
      let resolvedInterviewId = null;
      try {
        if (interviewRoundId) {
          const roundDoc =
            await InterviewRounds.findById(interviewRoundId).select(
              "interviewId",
            );
          resolvedInterviewId = roundDoc?.interviewId || null;
        }
      } catch (e) {
        // console.warn("Unable to resolve interviewId:", e?.message);
      }

      for (let i = 0; i < updateData.questionFeedback.length; i++) {
        const qFeedback = updateData.questionFeedback[i];
        const rawQuestion = qFeedback?.questionId;

        let identifier = "";
        let bankDetails = null;

        if (typeof rawQuestion === "string") {
          identifier = rawQuestion;
        } else if (rawQuestion && typeof rawQuestion === "object") {
          identifier =
            rawQuestion.questionId || rawQuestion._id || rawQuestion.id;
          bankDetails = rawQuestion;
        }

        if (!identifier) continue;

        let selectedDoc = null;
        if (mongoose.Types.ObjectId.isValid(identifier)) {
          selectedDoc = await InterviewQuestions.findById(identifier);
        }
        // console.log("bankDetails", bankDetails)

        if (!selectedDoc) {
          const questionOwnerId =
            (interviewerId && interviewerId.toString()) ||
            (ownerId && ownerId.toString()) ||
            "";

          selectedDoc = await InterviewQuestions.findOne({
            roundId: interviewRoundId,
            questionId: identifier,
          });
          // console.log("selectedDoc", selectedDoc)

          if (!selectedDoc) {
            // console.log("bankDetails selectedDoc", bankDetails)
            const snapshot = bankDetails?.snapshot || bankDetails || {};
            const src = bankDetails?.source || snapshot.source || "custom";
            const mand =
              bankDetails?.mandatory || snapshot.mandatory || "false";

            selectedDoc = new InterviewQuestions({
              interviewId: resolvedInterviewId,
              roundId: interviewRoundId,
              order: i + 1,
              // mandatory: mand,
              tenantId: tenantId || "",
              ownerId: questionOwnerId,
              questionId: identifier,
              source: src,
              snapshot: snapshot,
              addedBy: "interviewer",
            });
            await selectedDoc.save();
          }
        }

        // Push processed structure with valid _id
        processedQuestionFeedback.push({
          ...qFeedback,
          questionId: selectedDoc._id,
        });
      }

      normalizedQuestionFeedback = processedQuestionFeedback;

      // CHANGE 4: Check if questionFeedback actually changed
      // Simple length check + ID check or deep equal
      if (
        !isDeepEqual(
          existingFeedback.questionFeedback,
          normalizedQuestionFeedback,
        )
      ) {
        updateObject.questionFeedback = normalizedQuestionFeedback;
        updateObject.questionsAsked = normalizedQuestionFeedback;
        hasChanges = true;
        // console.log("Question feedback changed");
      }
    }

    if (
      updateData.generalComments !== undefined &&
      updateData.generalComments !== existingFeedback.generalComments
    ) {
      updateObject.generalComments = updateData.generalComments;
      hasChanges = true;
    }

    if (
      updateData.overallImpression &&
      !isDeepEqual(
        existingFeedback.overallImpression,
        updateData.overallImpression,
      )
    ) {
      updateObject.overallImpression = updateData.overallImpression;
      hasChanges = true;
    }

    if (
      updateData.technicalSkills !== undefined &&
      !isDeepEqual(existingFeedback.technicalSkills, updateData.technicalSkills)
    ) {
      updateObject.technicalSkills = updateData.technicalSkills;
      hasChanges = true;
    }

    if (
      updateData.technicalCompetency !== undefined &&
      !isDeepEqual(
        existingFeedback.technicalCompetency,
        updateData.technicalCompetency,
      )
    ) {
      updateObject.technicalCompetency = updateData.technicalCompetency;
      hasChanges = true;
    }

    if (
      updateData.strengths !== undefined &&
      !isDeepEqual(existingFeedback.strengths, updateData.strengths)
    ) {
      updateObject.strengths = updateData.strengths;
      hasChanges = true;
    }

    if (
      updateData.areasForImprovement !== undefined &&
      !isDeepEqual(
        existingFeedback.areasForImprovement,
        updateData.areasForImprovement,
      )
    ) {
      updateObject.areasForImprovement = updateData.areasForImprovement;
      hasChanges = true;
    }

    if (
      updateData.additionalComments !== undefined &&
      updateData.additionalComments !== existingFeedback.additionalComments
    ) {
      updateObject.additionalComments = updateData.additionalComments;
      // also sync to generalComments for legacy
      updateObject.generalComments = updateData.additionalComments;
      hasChanges = true;
    }

    if (updateData.status && updateData.status !== existingFeedback.status) {
      updateObject.status = updateData.status;
      hasChanges = true;
    }

    // CHANGE 6: Handle type field (for draft/submit)
    if (
      updateData.type === "submit" &&
      existingFeedback.status !== "submitted"
    ) {
      updateObject.status = "submitted";
      hasChanges = true;
    } else if (updateData.type === "draft") {
      updateObject.status = "draft";
      hasChanges = true;
    }

    // CHANGE: Ensure feedbackCode exists (if missing from creation)
    if (!existingFeedback.feedbackCode && updateData.feedbackCode) {
      const interviewRoundId = existingFeedback.interviewRoundId;
      const feedbackCode = updateData.feedbackCode;

      let finalFeedbackCode = feedbackCode;

      // Count existing feedbacks for this round to append suffix
      // Note: We need to be careful not to count *this* feedback if we were creating new,
      // but here we are updating. We want to find the next available slot if we stick to the pattern.
      // However, if we just want to patch the missing code, we can use the count logic.

      const existingCount = await FeedbackModel.countDocuments({
        interviewRoundId,
        _id: { $ne: existingFeedback._id }, // Exclude self
      });

      finalFeedbackCode =
        existingCount === 0
          ? `${feedbackCode}`
          : `${feedbackCode}-${existingCount + 1}`;

      updateObject.feedbackCode = finalFeedbackCode;
      hasChanges = true;
    }

    // CHANGE 7: If no changes, return early
    if (!hasChanges) {
      return res.status(200).json({
        success: true,
        message: "No changes detected - feedback already up to date",
        data: existingFeedback,
      });
    }

    // CHANGE 8: Add updated timestamp
    updateObject.updatedAt = Date.now();

    // CHANGE 9: Update normalized data for rest of function
    if (normalizedQuestionFeedback) {
      updateData.questionFeedback = normalizedQuestionFeedback;
    }

    // CHANGE 10: Update ONLY changed fields
    let updatedFeedback = await FeedbackModel.findByIdAndUpdate(
      id,
      { $set: updateObject }, // Only update changed fields
      {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators
      },
    )
      .populate("candidateId", "FirstName LastName Email Phone")
      .populate("interviewerId", "FirstName LastName Email Phone")
      .populate("positionId", "title companyname")
      .lean();

    // if (!updatedFeedback) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Feedback not found",
    //   });
    // }

    // Fetch Resume data for candidate (skills, experience, etc. moved from Candidate)
    if (updatedFeedback.candidateId?._id) {
      const activeResume = await Resume.findOne({
        candidateId: updatedFeedback.candidateId._id,
        isActive: true,
      })
        .select("skills CurrentExperience CurrentRole ImageData")
        .lean();

      if (activeResume) {
        updatedFeedback.candidateId = {
          ...updatedFeedback.candidateId,
          skills: activeResume.skills,
          CurrentExperience: activeResume.CurrentExperience,
          CurrentRole: activeResume.CurrentRole,
          ImageData: activeResume.ImageData,
        };
      }
    }

    const finalStatus = updateObject.status || existingFeedback.status;

    // console.log("finalStatus", finalStatus)

    if (finalStatus === "submitted") {
      //  Update interview round status
      let res = await updateInterviewRoundFeedbackStatus({
        interviewRoundId: updatedFeedback.interviewRoundId,
        isMock: updatedFeedback?.isMockInterview,
        actingAsUserId: authContext?.ownerId,
      });
      // console.log("finalStatus finalStatus", res)
    }

    // Trigger webhook for feedback status update if status changed to submitted
    if (updatedFeedback.status === "submitted") {
      //  Update interview round status
      // await updateInterviewRoundFeedbackStatus({
      //   interviewRoundId: updatedFeedback.interviewRoundId,
      //   isMock: updatedFeedback?.isMockInterview
      // });

      //if (updateData.status && updatedFeedback) {
      try {
        const webhookPayload = {
          feedbackId: updatedFeedback._id,
          feedbackCode: updatedFeedback.feedbackCode,
          tenantId: updatedFeedback.tenantId,
          ownerId: updatedFeedback.ownerId,
          interviewRoundId: updatedFeedback.interviewRoundId,
          candidateId: updatedFeedback.candidateId,
          positionId: updatedFeedback.positionId,
          interviewerId: updatedFeedback.interviewerId,
          status: updatedFeedback.status,
          updatedAt: updatedFeedback.updatedAt,
          event: "feedback.status.updated",
        };

        console.log(
          `[FEEDBACK WEBHOOK] Triggering status update webhook for feedback ${updatedFeedback._id} with status: ${updatedFeedback.status}`,
        );
        await triggerWebhook(
          EVENT_TYPES.FEEDBACK_STATUS_UPDATED,
          webhookPayload,
          updatedFeedback.tenantId,
        );
        console.log(
          `[FEEDBACK WEBHOOK] Status update webhook sent successfully for feedback ${updatedFeedback._id}`,
        );
      } catch (webhookError) {
        console.error(
          "[FEEDBACK WEBHOOK] Error triggering feedback status update webhook:",
          webhookError,
        );
        // Continue execution even if webhook fails
      }
    }

    res.locals.logData = {
      tenantId: updatedFeedback.tenantId?.toString() || "",
      ownerId: updatedFeedback.ownerId?.toString() || "",
      processName: "Update Feedback",
      requestBody: req.body,
      status: "success",
      message: "Feedback updated successfully",
      responseBody: updatedFeedback,
    };

    return res.status(200).json({
      success: true,
      message: "Feedback updated successfully",
      data: updatedFeedback,
    });
  } catch (error) {
    console.error("Error updating feedback:", error);

    res.locals.logData = {
      tenantId: req.body?.tenantId || "",
      ownerId: req.body?.ownerId || "",
      processName: "Update Feedback",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    return res.status(500).json({
      success: false,
      message: "Failed to update feedback",
      error: error.message,
    });
  }
};

const getfeedbackById = async (req, res) => {
  try {
    const { id } = req.params;
    // First get feedback without populating interviewRoundId
    let feedback = await FeedbackModel.findById(id)
      .populate("candidateId", "FirstName LastName Email Phone")
      .populate("positionId", "title companyname jobDescription")
      .populate("interviewerId", "firstName lastName")
      .populate("ownerId", "firstName lastName email")
      .lean();

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    // Conditionally populate interviewRoundId based on isMockInterview
    if (feedback.interviewRoundId) {
      const RoundModel = feedback.isMockInterview
        ? MockInterviewRound
        : InterviewRounds;
      const roundData = await RoundModel.findById(feedback.interviewRoundId)
        .select("roundTitle interviewMode interviewType")
        .lean();
      feedback.interviewRoundId = roundData || feedback.interviewRoundId;
    }

    return res.status(200).json({
      success: true,
      message: "Feedback retrieved successfully",
      data: feedback,
    });
  } catch (error) {
    console.error("Error getting feedback by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while getting feedback",
      error: error.message,
    });
  }
};

const getAllFeedback = async (req, res) => {
  try {
    // Get all feedback without populating interviewRoundId
    let feedbackList = await FeedbackModel.find()
      .populate("candidateId", "FirstName LastName Email Phone")
      .populate("positionId", "title companyname jobDescription")
      .populate("interviewerId", "firstName lastName")
      .populate("ownerId", "firstName lastName email")
      .lean();

    if (!feedbackList || feedbackList.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    // Conditionally populate interviewRoundId for each feedback based on isMockInterview
    const populatedFeedback = await Promise.all(
      feedbackList.map(async (feedback) => {
        if (feedback.interviewRoundId) {
          const RoundModel = feedback.isMockInterview
            ? MockInterviewRound
            : InterviewRounds;
          const roundData = await RoundModel.findById(feedback.interviewRoundId)
            .select("roundTitle interviewMode interviewType")
            .lean();
          feedback.interviewRoundId = roundData || feedback.interviewRoundId;
        }
        return feedback;
      }),
    );

    return res.status(200).json({
      success: true,
      message: "Feedback retrieved successfully",
      data: populatedFeedback,
    });
  } catch (error) {
    console.error("Error getting all feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while getting feedback",
      error: error.message,
    });
  }
};

//----v1.0.0--->

const getFeedbackByRoundId = async (req, res) => {
  try {
    const { roundId } = req.params;
    const { interviewerId, interviewType } = req.query;
    const isMockInterview = interviewType === "mockinterview";
    console.log("req.query", req.query);

    console.log("roundId", roundId);

    console.log("interviewerIdroundId", interviewerId);
    console.log("interviewType", interviewType);

    // Validate roundId
    if (!mongoose.Types.ObjectId.isValid(roundId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid round ID" });
    }

    // if (interviewerId && !mongoose.Types.ObjectId.isValid(interviewerId)) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "Invalid interviewer ID" });
    // }

    const RoundModel = isMockInterview ? MockInterviewRound : InterviewRounds;

    // Fetch InterviewRound
    const interviewRound = await RoundModel.findById(roundId).populate(
      "interviewers",
      "FirstName LastName Email Phone",
    );

    // console.log("interviewRound interviewRound", interviewRound);

    // const interviewRound = await InterviewRounds.findById(roundId).populate(
    //   "interviewers",
    //   "FirstName LastName Email Phone",
    // );

    if (!interviewRound) {
      return res
        .status(404)
        .json({ success: false, message: "Interview round not found" });
    }

    // const interviewSection = await Interview.findOne({
    //   _id: interviewRound.interviewId,
    // });

    let interviewSection = null;

    if (isMockInterview) {
      interviewSection = await MockInterview.findById(
        interviewRound.mockInterviewId,
      ).lean();
    } else {
      interviewSection = await Interview.findById(interviewRound.interviewId)
        .populate("candidateId", "FirstName LastName Email Phone")
        .populate(
          "positionId",
          "title companyname jobDescription minexperience maxexperience Location minSalary maxSalary",
        )
        .lean();
    }
    // Fetch CandidatePosition
    // let candidatePosition = await CandidatePosition.findOne({
    //   interviewId: interviewRound.interviewId,
    // })
    //   .populate("candidateId", "FirstName LastName Email Phone")
    //   .populate(
    //     "positionId",
    //     "title companyname jobDescription minexperience maxexperience Location minSalary maxSalary"
    //   )
    //   .lean();

    // Fetch Feedback
    const feedbackQuery = { interviewRoundId: roundId };
    if (interviewerId) {
      feedbackQuery.interviewerId = interviewerId;
    }

    // console.log("feedbackQuery interviewerId", feedbackQuery);

    let feedbacks = await FeedbackModel.find(feedbackQuery)
      .populate("candidateId", "FirstName LastName Email Phone ownerId")
      .populate(
        "positionId",
        "title companyname jobDescription minexperience maxexperience Location minSalary maxSalary",
      )
      .populate("interviewerId", "FirstName LastName Email Phone")
      .populate("ownerId", "firstName lastName email")
      .lean();

    console.log("feedbacks feedbacks", feedbacks);

    // Fetch Resume data for candidate (skills, experience, etc. moved from Candidate)
    const candidateIds = [];
    if (interviewSection?.candidateId?._id) {
      candidateIds.push(interviewSection?.candidateId._id);
    }
    feedbacks.forEach((fb) => {
      if (
        fb.candidateId?._id &&
        !candidateIds.some((id) => String(id) === String(fb.candidateId._id))
      ) {
        candidateIds.push(fb.candidateId._id);
      }
    });

    if (candidateIds.length > 0) {
      const resumes = await Resume.find({
        candidateId: { $in: candidateIds },
        isActive: true,
      })
        .select("candidateId skills CurrentExperience CurrentRole ImageData")
        .lean();

      const resumeMap = {};
      resumes.forEach((r) => {
        resumeMap[String(r.candidateId)] = r;
      });

      // Merge Resume data into candidatePosition.candidateId
      if (interviewSection?.candidateId?._id) {
        const resume = resumeMap[String(interviewSection.candidateId._id)];
        if (resume) {
          interviewSection.candidateId = {
            ...interviewSection.candidateId,
            skills: resume.skills,
            CurrentExperience: resume.CurrentExperience,
            CurrentRole: resume.CurrentRole,
            ImageData: resume.ImageData,
          };
        }
      }

      // Merge Resume data into feedbacks
      feedbacks = feedbacks.map((fb) => {
        if (fb.candidateId?._id) {
          const resume = resumeMap[String(fb.candidateId._id)];
          if (resume) {
            fb.candidateId = {
              ...fb.candidateId,
              skills: resume.skills,
              CurrentExperience: resume.CurrentExperience,
              CurrentRole: resume.CurrentRole,
              ImageData: resume.ImageData,
            };
          }
        }
        return fb;
      });
    }

    // Fetch all Interview Questions for the round
    // Filter questions: Include shared questions (not added by "interviewer")
    // AND questions added by THIS interviewer (if interviewerId is present)
    const questionQuery = { roundId: roundId };

    // if (interviewerId) {
    //   questionQuery.$or = [
    //     { addedBy: { $ne: "interviewer" } },
    //     { addedBy: "interviewer", ownerId: interviewerId },
    //   ];
    // }

    let interviewQuestionsList;
    if (interviewerId) {
      // Only include:
      // - Preselected questions
      // - Interviewer questions added by THIS interviewer
      interviewQuestionsList = await InterviewQuestions.find({
        roundId,
        $or: [
          { addedBy: { $ne: "interviewer" } },
          { addedBy: "interviewer", ownerId: interviewerId },
        ],
      }).lean();
    } else {
      // If no interviewerId → return all round questions
      interviewQuestionsList = await InterviewQuestions.find({
        roundId,
      }).lean();
    }

    // const interviewQuestionsList = await InterviewQuestions.find(questionQuery);

    // Build question map for easy lookup
    const questionMap = interviewQuestionsList.reduce((acc, q) => {
      console.log("q questionMap", q);
      acc[q?._id?.toString()] = q; //?.toObject();
      //  typeof q?.toObject === "function" ? q.toObject() : q;
      return acc;
    }, {});
    console.log("questionMap", questionMap);

    // Merge all questions into each feedback
    // const feedbacksMerged = feedbacks.map((fb) => {
    //   const fbAnswersMap = {};

    //   (fb.questionFeedback || []).forEach((qf) => {
    //     if (
    //       qf.questionId &&
    //       typeof qf.questionId === "object" &&
    //       qf.questionId._id
    //     ) {
    //       fbAnswersMap[qf.questionId._id.toString()] = qf;
    //     } else if (qf.questionId) {
    //       fbAnswersMap[qf.questionId.toString()] = qf;
    //     }
    //   });

    //   const mergedQuestions = Object.values(questionMap).map((q) => {
    //     // Fix: Use q._id (SelectedInterviewQuestion ID) to lookup answer,
    //     // because questionFeedback.questionId stores the SelectedInterviewQuestion ID.
    //     // Fallback to q.questionId (Bank ID) for legacy data compatibility
    //     const ans = fbAnswersMap[q._id.toString()] || fbAnswersMap[q.questionId.toString()];
    //     // const ans = fbAnswersMap[q.questionId.toString()];
    //     console.log("ansq", q);

    //     console.log("ans ans ans", ans)

    //     return {
    //       _id: q._id,
    //       questionText: q.questionText,
    //       addedBy: q.addedBy,
    //       questionId: q.questionId,
    //       candidateAnswer: ans?.candidateAnswer || null,
    //       interviewerFeedback: ans?.interviewerFeedback || null,
    //       snapshot: q?.snapshot,
    //     };
    //   });

    //   return {
    //     ...fb,
    //     questionFeedback: mergedQuestions,
    //   };
    // });

    // ==============================
    // ✅ CHANGED: Proper Question ↔ Answer Mapping
    // ==============================

    // const feedbacksMerged = feedbacks.map((fb) => {
    //   const answerMap = {};

    //   // Create answer lookup map
    //   (fb.questionFeedback || []).forEach((qf) => {
    //     if (qf.questionId) {
    //       answerMap[qf.questionId.toString()] = qf;
    //     }
    //   });

    //   // Merge all round questions with answers
    //   const mergedQuestions = interviewQuestionsList.map((q) => {
    //     const answer = answerMap[q._id.toString()];

    //     return {
    //       _id: q._id,
    //       questionText:
    //         q.snapshot?.questionText ||
    //         q.snapshot?.question ||
    //         "",
    //       addedBy: q.addedBy,
    //       source: q.source,
    //       questionBankId: q.questionId,
    //       order: q.order,

    //       candidateAnswer: answer?.candidateAnswer || null,
    //       interviewerFeedback: answer?.interviewerFeedback || null,
    //     };
    //   });

    //   return {
    //     ...fb,
    //     questionFeedback: mergedQuestions,
    //   };
    // });
    // ==============================
    // ✅ MODIFIED: Separate questions for interviewer-added vs preselected with proper answer mapping
    // ==============================

    // First, create a map of feedback answers for quick lookup
    const feedbacksMerged = feedbacks.map((fb) => {
      const answerMap = {};

      // Create answer lookup map
      (fb?.questionFeedback || []).forEach((qf) => {
        if (qf.questionId) {
          answerMap[qf.questionId.toString()] = qf;
        }
      });

      console.log("answerMap", answerMap);

      // Separate questions by type for this specific feedback
      const preselectedWithAnswers = interviewQuestionsList
        .filter((q) => q.addedBy !== "interviewer" || !q.addedBy)
        .map((q) => {
          console.log("preselectedWithAnswers", q);
          const answer = answerMap[q._id.toString()];
          return {
            ...q,
            // _id: q.questionId,
            // questionText: q.snapshot?.questionText || q.snapshot?.question || "",
            // addedBy: q.addedBy,
            // source: q.source,
            // questionBankId: q.questionId,
            // order: q.order,
            candidateAnswer: answer?.candidateAnswer || null,
            interviewerFeedback: answer?.interviewerFeedback || null,
          };
        });

      let interviewerWithAnswers = interviewQuestionsList
        .filter((q) => q.addedBy === "interviewer")

        .map((q) => {
          console.log("interviewerWithAnswers", q);
          const answer = answerMap[q._id.toString()];
          return {
            ...q,
            // _id: q._id,
            // snapshot: q.snapshot || q.snapshot || "",
            // addedBy: q.addedBy,
            // source: q.source,
            // questionBankId: q.questionId,
            // order: q.order,
            candidateAnswer: answer?.candidateAnswer || null,
            interviewerFeedback: answer?.interviewerFeedback || null,
          };
        });

      // Filter interviewer questions by owner if interviewerId is provided
      if (interviewerId) {
        interviewerWithAnswers = interviewerWithAnswers.filter(
          (q) => q.ownerId?.toString() === interviewerId?.toString(),
        );
      }

      return {
        ...fb,
        questionFeedback: {
          preselected: preselectedWithAnswers,
          interviewerAdded: interviewerWithAnswers,
        },
      };
    });

    // Separate questions for the interviewQuestions section in response
    // let preselectedQuestions = interviewQuestionsList
    //   .filter((q) => q.addedBy !== "interviewer" || !q.addedBy)
    //   .map((q) => ({
    //     _id: q._id,
    //     questionText: q.snapshot?.questionText || q.snapshot?.question || "",
    //     addedBy: q.addedBy,
    //     source: q.source,
    //     questionBankId: q.questionId,
    //     order: q.order,
    //   }));

    // let interviewerAddedQuestions = interviewQuestionsList
    //   .filter((q) => q.addedBy === "interviewer")
    //   .map((q) => ({
    //     _id: q._id,
    //     questionText: q.snapshot?.questionText || q.snapshot?.question || "",
    //     addedBy: q.addedBy,
    //     source: q.source,
    //     questionBankId: q.questionId,
    //     order: q.order,
    //     ownerId: q.ownerId,
    //   }));

    // if (interviewerId) {
    //   interviewerAddedQuestions = interviewerAddedQuestions.filter(
    //     (q) => q.ownerId?.toString() === interviewerId?.toString()
    //   );
    // }

    // Separate questions for interviewer-added vs preselected
    let preselectedQuestions = interviewQuestionsList
      .filter((q) => q.addedBy !== "interviewer" || !q.addedBy)
      .map((q) => q); // .toObject()

    console.log("preselectedQuestions", preselectedQuestions);
    console.log("interviewerId", interviewQuestionsList);

    let interviewerAddedQuestions = interviewQuestionsList
      .filter((q) => q.addedBy === "interviewer")
      .map((q) => q); // .toObject()

    // console.log("interviewerAddedQuestions", interviewerAddedQuestions)

    if (interviewerId) {
      interviewerAddedQuestions = interviewerAddedQuestions.filter(
        (q) => q.ownerId?.toString() === interviewerId?.toString(),
      );
    }

    // console.log("interviewerAddedQuestions", interviewerAddedQuestions);

    // Build position data
    let positionData = null;
    if (!isMockInterview) {
      if (interviewSection?.positionId) {
        positionData = interviewSection.positionId;
      } else if (feedbacks.length > 0 && feedbacks[0].positionId) {
        positionData = feedbacks[0].positionId;
      }
    }

    // Final response
    const responseData = {
      interviewRound: {
        _id: interviewRound._id,
        interviewId: interviewRound.interviewId,
        sequence: interviewRound.sequence,
        interviewCode: interviewSection?.interviewCode,
        tenantId: interviewSection?.tenantId,
        ownerId: interviewSection?.ownerId,
        roundTitle: interviewRound?.roundTitle,
        interviewMode: interviewRound?.interviewMode,
        interviewType: interviewRound?.interviewType,
        interviewerType: interviewRound?.interviewerType,
        duration: interviewRound?.duration,
        instructions: interviewRound?.instructions,
        dateTime: interviewRound?.dateTime,
        status: interviewRound?.status,
        meetingId: interviewRound?.meetingId,
        // meetLink: interviewRound.meetLink,
        meetPlatform: interviewRound?.meetPlatform,
        // assessmentId: interviewRound?.assessmentId,
        questions: interviewRound?.questions,
        rejectionReason: interviewRound?.rejectionReason,
        interviewers: interviewRound?.interviewers || [],
        candidateJoined: interviewRound?.candidateJoined || false,
        interviewerJoined: interviewRound?.interviewerJoined || false,
      },
      candidate: interviewSection?.candidateId || null,
      position: positionData,
      interviewers: interviewRound.interviewers || [],
      feedbacks: feedbacksMerged || [], //feedbacksMerged || [],
      interviewQuestions: {
        preselectedQuestions,
        interviewerAddedQuestions,
      },
    };
    // console.log("responseData", responseData)

    res.status(200).json({
      success: true,
      message: "Feedback retrieved successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// to get contact type of org or individual and datetime feedback by contactId and roundId
const getFeedbackByContactIdRoundId = async (req, res) => {
  try {
    const { contactId, roundId, interviewType } = req.query;

    // console.log("req.query getFeedbackByContactIdRoundId", req.query);
    if (!contactId || !roundId || !interviewType) {
      return res.status(400).json({
        error: "contactId and roundId and interviewType are required",
      });
    }

    // 1. Get the contact
    const contact = await Contacts.findById(contactId);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    const { ownerId, tenantId } = contact;

    // 2. Get tenant by tenantId
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    // Optional: verify that tenant.ownerId matches contact.ownerId
    // if (tenant.ownerId.toString() !== ownerId.toString()) {
    //   return res.status(403).json({ error: "Owner mismatch between contact and tenant" });
    // }

    // 3. Get round mock interview and interview round
    let round = null;
    if (interviewType === "mockinterview") {
      round = await MockInterviewRound.findById(roundId);
    } else {
      round = await InterviewRounds.findById(roundId);
    }

    // 3. Get round dateTime

    if (!round) {
      return res.status(404).json({ error: "Interview round not found" });
    }

    // 4. Return result
    return res.json({
      ownerId,
      tenant: {
        id: tenant._id,
        name: tenant.company,
        type: tenant.type,
      },
      round: {
        id: round._id,
        dateTime: round.dateTime,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

//  Fixed backend route - add this to your routes file
// Get Candidate, Position & InterviewRound Details by RoundId
const getCandidateByRoundId = async (req, res) => {
  try {
    const roundId = req.query.roundId;

    if (!roundId) {
      return res.status(400).json({
        success: false,
        message: "Round ID is required",
      });
    }

    // Fetch Round + Interview + Candidate + Position + Interviewers
    const round = await InterviewRounds.findById(roundId)
      .populate({
        path: "interviewId",
        populate: [
          { path: "candidateId", model: "Candidate" },
          { path: "positionId", model: "Position" },
          { path: "templateId", model: "InterviewTemplate" }, // Optional: interview template details
        ],
      })
      .populate({
        path: "interviewers",
        model: "Contacts",
      })
      .populate({
        path: "assessmentId",
        model: "assessment",
      });

    if (!round) {
      return res.status(404).json({
        success: false,
        message: "Round not found",
      });
    }

    let candidate = round.interviewId?.candidateId;
    const position = round.interviewId?.positionId;

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found for this round",
      });
    }

    // Fetch Resume data for candidate (skills, experience, etc. moved from Candidate)
    if (candidate._id) {
      const activeResume = await Resume.findOne({
        candidateId: candidate._id,
        isActive: true,
      })
        .select("skills CurrentExperience CurrentRole ImageData")
        .lean();

      if (activeResume) {
        // Convert Mongoose document to plain object if needed
        const candidateObj = candidate.toObject
          ? candidate.toObject()
          : candidate;
        candidate = {
          ...candidateObj,
          skills: activeResume.skills,
          CurrentExperience: activeResume.CurrentExperience,
          CurrentRole: activeResume.CurrentRole,
          ImageData: activeResume.ImageData,
        };
      }
    }

    // Full Response with all details
    return res.status(200).json({
      success: true,
      candidate,
      position,
      round, // this includes full InterviewRounds schema details
    });
  } catch (error) {
    console.error("Error in getCandidateByRoundId:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching candidate/round details",
      error: error.message,
    });
  }
};

// getting all feedbacks  by roundid for scheduler only

// In your getFeedbackRoundId controller
const getFeedbackRoundId = async (req, res) => {
  try {
    const { roundId } = req.params;

    // Cast properly
    const objectRoundId = new mongoose.Types.ObjectId(roundId);

    // 1. Find round
    const round = await InterviewRounds.findById(objectRoundId)
      .populate("interviewId")
      .populate("interviewers");

    if (!round) {
      return res.status(404).json({ message: "Round not found" });
    }

    // Trigger webhook for feedback status update if status changed to submitted
    // webhooks updation part of feed back this is used in account settings hrms sidebar tab in webhooks tab
    if (updatedFeedback.status === "submitted") {
      //if (updateData.status && updatedFeedback) {
      try {
        const webhookPayload = {
          feedbackId: updatedFeedback._id,
          feedbackCode: updatedFeedback.feedbackCode,
          tenantId: updatedFeedback.tenantId,
          ownerId: updatedFeedback.ownerId,
          interviewRoundId: updatedFeedback.interviewRoundId,
          candidateId: updatedFeedback.candidateId,
          positionId: updatedFeedback.positionId,
          interviewerId: updatedFeedback.interviewerId,
          status: updatedFeedback.status,
          updatedAt: updatedFeedback.updatedAt,
          event: "feedback.status.updated",
        };

        console.log(
          `[FEEDBACK WEBHOOK] Triggering status update webhook for feedback ${updatedFeedback._id} with status: ${updatedFeedback.status}`,
        );
        await triggerWebhook(
          EVENT_TYPES.FEEDBACK_STATUS_UPDATED,
          webhookPayload,
          updatedFeedback.tenantId,
        );
        console.log(
          `[FEEDBACK WEBHOOK] Status update webhook sent successfully for feedback ${updatedFeedback._id}`,
        );
      } catch (webhookError) {
        console.error(
          "[FEEDBACK WEBHOOK] Error triggering feedback status update webhook:",
          webhookError,
        );
      }
    }

    // 3. Get Feedbacks (important: cast roundId to ObjectId)
    const feedbacks = await FeedbackModel.find({
      interviewRoundId: objectRoundId,
    })
      .populate("interviewerId") // gives contact details
      .populate("candidateId")
      .populate("positionId");

    // 4. Prepare response
    const response = {
      success: true,
      message: feedbacks.length
        ? "Feedback found"
        : "No feedback submitted yet",
      interviewRound: round,
      candidate: interview.candidateId,
      position: interview.positionId,
      interviewers: round.interviewers || [],
      feedbacks,
      interviewQuestions: {
        preselectedQuestions: round.preselectedQuestions || [],
        interviewerAddedQuestions: round.interviewerAddedQuestions || [],
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching round details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Validation endpoint for feedback
const validateFeedback = async (req, res) => {
  try {
    const { type } = req.body;
    // console.log("req.body validateFeedback", req.body);

    // Determine which validation to use based on operation type
    const isUpdate = req.params.operation === "update";

    // Validate input using appropriate schema
    const {
      isValid,
      errors,
      value: validatedData,
    } = isUpdate
        ? validateUpdateFeedback(req.body)
        : validateCreateFeedback(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // Apply additional business rule validations for submit type
    if (type === "submit" || validatedData.status === "submitted") {
      const businessRuleErrors = validateFeedbackBusinessRules(validatedData);
      if (businessRuleErrors) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: businessRuleErrors,
        });
      }
    }

    // Return success if all validations pass
    return res.status(200).json({
      success: true,
      message: "Validation successful",
      data: validatedData,
    });
  } catch (error) {
    console.error("Error validating feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to validate feedback",
      error: error.message,
    });
  }
};

// helper function to get feedback by contactId and roundId

const updateInterviewRoundFeedbackStatus = async ({
  interviewRoundId,
  isMock,
  actingAsUserId,
}) => {
  if (!interviewRoundId) return;

  const RoundModel = isMock ? MockInterviewRound : InterviewRounds;

  // 1. Get interview round
  const round = await RoundModel.findById(interviewRoundId).lean();
  if (!round) return "Round not found";

  const interviewerIds = round.interviewers || [];
  if (interviewerIds.length === 0) return "No interviewers found";

  // 2. Count submitted feedbacks
  const submittedCount = await FeedbackModel.countDocuments({
    interviewRoundId,
    interviewerId: { $in: interviewerIds },
    status: "submitted",
  });

  // 3. Update round status
  const newStatus =
    submittedCount === interviewerIds.length
      ? "FeedbackSubmitted"
      : "FeedbackPending";

  // const RoundModel = isMock
  //   ? MockInterviewRound
  //   : InterviewRounds;
  // const roundRes = await RoundModel.findById(interviewRoundId)
  //   .select("roundTitle interviewMode interviewType")
  //   .lean();

  let smartUpdate = null;

  const smartBody = {
    status: newStatus,
    interviewerType: round.interviewerType,
    selectedInterviewers: round.interviewers,
    currentActionReason: newStatus,
    // comments: comment || null,
    // rescheduleReason: reasonCode || null,
  };

  smartUpdate = await buildSmartRoundUpdate({
    existingRound: round,
    body: {
      ...smartBody,
      status: newStatus, // Override status to FeedbackPending if feedback is still in draft
    },
    actingAsUserId,
    statusChanged: true,
  });

  // console.log("smartUpdate", smartUpdate);

  let finalUpdate = smartUpdate;

  // console.log("finalUpdate", finalUpdate);

  // if (Object.keys(extraUpdate.$set).length > 0) {
  //   finalUpdate = mergeUpdates(
  //     smartUpdate || { $set: {}, $push: { history: [] } },
  //     extraUpdate
  //   );
  // }

  // if (Object.keys(extraUpdate.$set).length > 0) {
  //   finalUpdate = mergeUpdates(
  //     smartUpdate || { $set: {}, $push: { history: [] } },
  //     extraUpdate,
  //   );
  // // }

  let roundRes = await RoundModel.findByIdAndUpdate(
    interviewRoundId,
    finalUpdate,
    {
      new: true,
      runValidators: true,
    },
  );

  // console.log("roundRes roundRes", roundRes);

  if (roundRes?.status === "FeedbackSubmitted") {
    if (roundRes?.interviewerType === "External") {
      try {
        const settlementResult = await processAutoSettlement({
          roundId: roundRes._id.toString(),
          action: "Completed",
          //reasonCode: reasonCode || comment || null,
        });
        console.log(
          "[updateInterviewRoundStatus] Auto-settlement completed for round:",
          roundRes._id,
          "Result:",
          settlementResult, // Log the result
        );

        // Return the settlement result along with the round update
        return {
          round: roundRes,
          settlement: settlementResult,
        };
      } catch (settlementError) {
        console.error(
          "[updateInterviewRoundStatus] Auto-settlement error:",
          settlementError,
        );
        // Continue with status update even if settlement fails
        return {
          round: roundRes,
          settlement: null,
          error: settlementError.message,
        };
        // Continue with status update even if settlement fails
      }
      // }
    }
  }
  // Return just the round update if no settlement was processed
  return { round: roundRes };
};

const normalizeQuestionId = (raw) => {
  if (!raw) return null;

  if (typeof raw === "string" && mongoose.Types.ObjectId.isValid(raw)) {
    return raw;
  }

  if (typeof raw === "object") {
    const id = raw.questionId || raw._id || raw.id || raw.snapshot?.questionId;

    if (mongoose.Types.ObjectId.isValid(id)) {
      return id;
    }
  }

  return null;
};

// const getPendingFeedbacks = async (req, res) => {
//   try {
//     const { contactId } = req.query;
//      console.log("contactId", contactId)

//     if (!contactId) {
//       return res.status(400).json({
//         success: false,
//         message: "Contact ID is required",
//       });
//     }

//     const objectIdContact = new mongoose.Types.ObjectId(contactId);

//     // 1. Define statuses that qualify for needing feedback
//     const activeInterviewStatuses = [
//       "Evaluated",
//       "FeedbackPending",
//       "InProgress",
//       "Completed", // Added Completed as feedback is often pending after completion
//     ];

//     // 2. Fetch Rounds
//     const [standardRounds, mockRounds] = await Promise.all([
//       InterviewRounds.find({
//         interviewers: { $in: [objectIdContact] },
//         status: { $in: activeInterviewStatuses },
//       })
//         .populate({
//           path: "interviewId",
//           populate: [
//             { path: "candidateId", select: "FirstName LastName Email" },
//             { path: "positionId", select: "title companyname" },
//           ],
//         })
//         .lean(),

//       MockInterviewRound.find({
//         interviewers: { $in: [objectIdContact] },
//         status: { $in: activeInterviewStatuses },
//       })
//         .populate({
//           path: "mockInterviewId",
//           select: "title candidateName interviewCode",
//         })
//         .lean(),
//     ]);

//     const allRounds = [
//       ...standardRounds.map((r) => ({ ...r, isMock: false })),
//       ...mockRounds.map((r) => ({ ...r, isMock: true })),
//     ];

//     if (allRounds.length === 0) {
//       return res.status(200).json({ success: true, count: 0, data: [] });
//     }

//     // 3. Optimized Feedback Check: Get all submitted feedbacks for these rounds in ONE query
//     const roundIds = allRounds.map((r) => r._id);
//     const submittedFeedbacks = await FeedbackModel.find({
//       interviewRoundId: { $in: roundIds },
//       interviewerId: objectIdContact,
//       status: "submitted",
//     })
//       .select("interviewRoundId")
//       .lean();

//     // Create a Set of IDs that ALREADY have feedback
//     const feedbackExistsSet = new Set(
//       submittedFeedbacks.map((f) => f.interviewRoundId.toString()),
//     );

//     // 4. Filter rounds that DON'T have feedback yet
//     const pendingResults = allRounds
//       .filter((round) => !feedbackExistsSet.has(round._id.toString()))
//       .map((round) => ({
//         roundId: round._id,
//         roundTitle: round.roundTitle,
//         dateTime: round.dateTime,
//         status: round.status,
//         isMock: round.isMock,
//         candidateName: round.isMock
//           ? round.mockInterviewId?.candidateName
//           : `${round.interviewId?.candidateId?.FirstName || ""} ${round.interviewId?.candidateId?.LastName || ""}`.trim(),
//         positionTitle: round.isMock
//           ? "Mock Interview"
//           : round.interviewId?.positionId?.title,
//         companyName: round.isMock
//           ? "N/A"
//           : round.interviewId?.positionId?.companyname || "N/A",
//         interviewCode: round.isMock
//           ? round.mockInterviewId?.interviewCode
//           : round.interviewId?.interviewCode,
//       }));

//     return res.status(200).json({
//       success: true,
//       count: pendingResults.length,
//       data: pendingResults,
//     });
//   } catch (error) {
//     console.error("Error fetching pending feedbacks:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// const getPendingFeedbacks = async (req, res) => {
//   try {
//     const { contactId } = req.query;
//     console.log("contactId", contactId);

//     if (!contactId) {
//       return res.status(400).json({
//         success: false,
//         message: "Contact ID is required",
//       });
//     }

//     const objectIdContact = new mongoose.Types.ObjectId(contactId);

//     // 1. Define statuses that qualify for needing feedback
//     const activeInterviewStatuses = [
//       "Evaluated",
//       "FeedbackPending",
//       "InProgress",
//       "Completed",
//     ];

//     // 2. Fetch Standard Interview Rounds with complete population
//     const standardRounds = await InterviewRounds.find({
//       interviewers: { $in: [objectIdContact] },
//       status: { $in: activeInterviewStatuses },
//     })
//       .populate({
//         path: "interviewId",
//         select: "candidateId positionId interviewCode status",
//         populate: [
//           {
//             path: "candidateId",
//             select: "FirstName LastName Email phone candidateCode",
//             model: "Candidate"
//           },
//           {
//             path: "positionId",
//             select: "title companyname positionCode minExperience maxExperience",
//             model: "Position",
//             populate: {
//               path: "companyname",
//               select: "companyName companyCode",
//               model: "TenantCompany"
//             }
//           },
//         ],
//       })
//       .populate({
//         path: "interviewers",
//         select: "FirstName LastName Email",
//         model: "Contacts"
//       })
//       .lean();

//     // 3. Fetch Mock Interview Rounds with complete population
//     const mockRounds = await MockInterviewRound.find({
//       interviewers: { $in: [objectIdContact] },
//       status: { $in: activeInterviewStatuses },
//     })
//       .populate({
//         path: "mockInterviewId",
//         select: "mockInterviewCode candidateName skills jobDescription currentRole currentExperience higherQualification resume createdBy",
//         model: "MockInterview",
//         populate: {
//           path: "createdBy",
//           select: "name email",
//           model: "Users"
//         }
//       })
//       .populate({
//         path: "interviewers",
//         select: "FirstName LastName Email",
//         model: "Contacts"
//       })
//       .lean();

//     // 4. Combine rounds with proper type identification
//     const allRounds = [
//       ...standardRounds.map(round => ({
//         ...round,
//         isMock: false,
//         roundType: 'standard'
//       })),
//       ...mockRounds.map(round => ({
//         ...round,
//         isMock: true,
//         roundType: 'mock'
//       }))
//     ];

//     if (allRounds.length === 0) {
//       return res.status(200).json({
//         success: true,
//         count: 0,
//         data: [],
//         message: "No pending feedbacks found"
//       });
//     }

//     // 5. Optimized Feedback Check: Get all submitted feedbacks for these rounds
//     const roundIds = allRounds.map(r => r._id);
//     const submittedFeedbacks = await FeedbackModel.find({
//       interviewRoundId: { $in: roundIds },
//       interviewerId: objectIdContact,
//       status: "submitted",
//     })
//       .select("interviewRoundId submittedAt feedback")
//       .lean();

//     // Create a Set of IDs that ALREADY have feedback
//     const feedbackExistsSet = new Set(
//       submittedFeedbacks.map(f => f.interviewRoundId.toString())
//     );

//     // Get feedback counts for debugging/logging
//     const feedbackCounts = {
//       total: submittedFeedbacks.length,
//       unique: feedbackExistsSet.size
//     };

//     // 6. Filter rounds that DON'T have feedback yet and map with complete data
//     const pendingResults = allRounds
//       .filter(round => !feedbackExistsSet.has(round._id.toString()))
//       .map(round => {
//         // Base round info
//         const baseInfo = {
//           roundId: round._id,
//           roundTitle: round.roundTitle || 'Untitled Round',
//           dateTime: round.dateTime,
//           status: round.status,
//           isMock: round.isMock,
//           roundType: round.roundType,
//           meetingId: round.meetingId,
//           meetPlatform: round.meetPlatform,
//           duration: round.duration,
//           interviewMode: round.interviewMode,
//           interviewType: round.interviewType,
//           interviewerType: round.interviewerType,
//           instructions: round.instructions,
//           noShowJobId: round.noShowJobId,
//           createdAt: round.createdAt,
//           updatedAt: round.updatedAt
//         };

//         // Handle Standard Interview Rounds
//         if (!round.isMock && round.interviewId) {
//           const interview = round.interviewId;
//           const candidate = interview.candidateId || {};
//           const position = interview.positionId || {};
//           const company = position.companyname || {};

//           return {
//             ...baseInfo,
//             interviewCode: interview.interviewCode,
//             interviewStatus: interview.status,
//             candidate: {
//               id: candidate._id,
//               firstName: candidate.FirstName || '',
//               lastName: candidate.LastName || '',
//               fullName: `${candidate.FirstName || ''} ${candidate.LastName || ''}`.trim(),
//               email: candidate.Email || '',
//               phone: candidate.phone || '',
//               candidateCode: candidate.candidateCode
//             },
//             position: {
//               id: position._id,
//               title: position.title || 'Position Not Specified',
//               positionCode: position.positionCode,
//               minExperience: position.minExperience,
//               maxExperience: position.maxExperience,
//               company: {
//                 id: company._id,
//                 name: company.companyName || position.companyname || 'Company Not Specified',
//                 companyCode: company.companyCode
//               }
//             }
//           };
//         }

//         // Handle Mock Interview Rounds
//         if (round.isMock && round.mockInterviewId) {
//           const mock = round.mockInterviewId;
//           const createdBy = mock.createdBy || {};

//           return {
//             ...baseInfo,
//             interviewCode: mock.mockInterviewCode,
//             mockDetails: {
//               id: mock._id,
//               candidateName: mock.candidateName || 'Candidate Not Specified',
//               skills: mock.skills || [],
//               jobDescription: mock.jobDescription || '',
//               currentRole: mock.currentRole || '',
//               currentExperience: mock.currentExperience || '',
//               higherQualification: mock.higherQualification || '',
//               resume: mock.resume || null,
//               createdBy: {
//                 id: createdBy._id,
//                 name: createdBy.name || 'Unknown',
//                 email: createdBy.email
//               }
//             }
//           };
//         }

//         // Fallback for incomplete data
//         return {
//           ...baseInfo,
//           interviewCode: round.interviewCode || round.mockInterviewId?.mockInterviewCode,
//           candidate: round.isMock ?
//             { fullName: round.mockInterviewId?.candidateName || 'Candidate Info Missing' } :
//             { fullName: 'Candidate Info Missing' },
//           position: round.isMock ?
//             { title: 'Mock Interview' } :
//             { title: 'Position Info Missing' }
//         };
//       });

//     // 7. Enrich with interviewer details if needed
//     const enrichedResults = pendingResults.map(result => {
//       const originalRound = allRounds.find(r => r._id.toString() === result.roundId.toString());

//       if (originalRound && originalRound.interviewers) {
//         result.interviewers = originalRound.interviewers.map(interviewer => ({
//           id: interviewer._id,
//           name: `${interviewer.FirstName || ''} ${interviewer.LastName || ''}`.trim(),
//           email: interviewer.Email
//         }));
//       }

//       // Add round history if available and relevant
//       if (originalRound && originalRound.history && originalRound.history.length > 0) {
//         result.roundHistory = originalRound.history.map(h => ({
//           action: h.action,
//           reasonCode: h.reasonCode,
//           comment: h.comment,
//           scheduledAt: h.scheduledAt,
//           createdAt: h.createdAt
//         }));
//       }

//       return result;
//     });

//     // 8. Sort by date (most recent first)
//     enrichedResults.sort((a, b) => {
//       const dateA = a.dateTime ? new Date(a.dateTime) : new Date(0);
//       const dateB = b.dateTime ? new Date(b.dateTime) : new Date(0);
//       return dateB - dateA;
//     });

//     return res.status(200).json({
//       success: true,
//       count: enrichedResults.length,
//       totalRoundsFound: allRounds.length,
//       feedbackCounts,
//       data: enrichedResults,
//       summary: {
//         standardRounds: standardRounds.length,
//         mockRounds: mockRounds.length,
//         pendingFeedbacks: enrichedResults.length
//       }
//     });

//   } catch (error) {
//     console.error("Error fetching pending feedbacks:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error while fetching pending feedbacks",
//       error: error.message,
//       stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     });
//   }
// };


const getPendingFeedbacks = async (req, res) => {
  try {
    const { contactId } = req.query;
    console.log("contactId", contactId);

    if (!contactId) {
      return res.status(400).json({
        success: false,
        message: "Contact ID is required",
      });
    }

    const objectIdContact = new mongoose.Types.ObjectId(contactId);

    // 1. Define statuses that qualify for needing feedback
    const activeInterviewStatuses = [
      "Evaluated",
      "FeedbackPending",
      "InProgress",
      "Completed",
    ];

    // 2. Fetch Standard Interview Rounds with complete population
    const standardRounds = await InterviewRounds.find({
      interviewers: { $in: [objectIdContact] },
      status: { $in: activeInterviewStatuses },
    })
      .populate({
        path: "interviewId",
        select: "candidateId positionId interviewCode status",
        populate: [
          {
            path: "candidateId",
            select: "FirstName LastName Email phone candidateCode",
            model: "Candidate"
          },
          {
            path: "positionId",
            select: "title companyname positionCode minExperience maxExperience",
            model: "Position",
            populate: {
              path: "companyname",
              select: "companyName companyCode",
              model: "TenantCompany"
            }
          },
        ],
      })
      .populate({
        path: "interviewers",
        select: "FirstName LastName Email",
        model: "Contacts"
      })
      .lean();

    // 3. Fetch Mock Interview Rounds with complete population
    const mockRounds = await MockInterviewRound.find({
      interviewers: { $in: [objectIdContact] },
      status: { $in: activeInterviewStatuses },
    })
      .populate({
        path: "mockInterviewId",
        select: "mockInterviewCode candidateName skills jobDescription currentRole currentExperience higherQualification resume createdBy",
        model: "MockInterview",
        populate: {
          path: "createdBy",
          select: "name email",
          model: "Users"
        }
      })
      .populate({
        path: "interviewers",
        select: "FirstName LastName Email",
        model: "Contacts"
      })
      .lean();

    // ADD THIS DEBUG LOG
    console.log("mockRounds raw data:", JSON.stringify(mockRounds.map(r => ({
      roundId: r._id,
      mockInterviewId: r.mockInterviewId?._id,
      mockData: r.mockInterviewId ? {
        candidateName: r.mockInterviewId.candidateName,
        skills: r.mockInterviewId.skills,
        mockInterviewCode: r.mockInterviewId.mockInterviewCode
      } : 'No mockInterviewId'
    })), null, 2));

    // console.log("mockRounds", JSON.stringify(mockRounds, null, 2));

    // console.log("mockRounds", mockRounds)

    // 4. Combine rounds with proper type identification
    const allRounds = [
      ...standardRounds.map(round => ({
        ...round,
        isMock: false,
        roundType: 'standard'
      })),
      ...mockRounds.map(round => ({
        ...round,
        isMock: true,
        roundType: 'mock'
      }))
    ];

    if (allRounds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: "No pending feedbacks found"
      });
    }

    // 5. Optimized Feedback Check: Get all submitted feedbacks for these rounds
    const roundIds = allRounds.map(r => r._id);
    const submittedFeedbacks = await FeedbackModel.find({
      interviewRoundId: { $in: roundIds },
      interviewerId: objectIdContact,
      status: "submitted",
    })
      .select("interviewRoundId submittedAt feedback")
      .lean();

    // Create a Set of IDs that ALREADY have feedback
    const feedbackExistsSet = new Set(
      submittedFeedbacks.map(f => f.interviewRoundId.toString())
    );

    // Get feedback counts for debugging/logging
    const feedbackCounts = {
      total: submittedFeedbacks.length,
      unique: feedbackExistsSet.size
    };

    // 6. Filter rounds that DON'T have feedback yet and map with complete data
    const pendingResults = allRounds
      .filter(round => !feedbackExistsSet.has(round._id.toString()))
      .map(round => {
        // Base round info
        const baseInfo = {
          roundId: round._id,
          roundTitle: round.roundTitle || 'Untitled Round',
          dateTime: round.dateTime,
          status: round.status,
          isMock: round.isMock,
          roundType: round.roundType,
          meetingId: round.meetingId,
          meetPlatform: round.meetPlatform,
          duration: round.duration,
          interviewMode: round.interviewMode,
          interviewType: round.interviewType,
          interviewerType: round.interviewerType,
          instructions: round.instructions,
          noShowJobId: round.noShowJobId,
          createdAt: round.createdAt,
          updatedAt: round.updatedAt
        };

        // Handle Standard Interview Rounds
        if (!round.isMock && round.interviewId) {
          const interview = round.interviewId;
          baseInfo.sequence = round.sequence;
          const candidate = interview.candidateId || {};
          const position = interview.positionId || {};
          const company = position.companyname || {};

          return {
            ...baseInfo,

            interviewCode: interview.interviewCode,
            interviewStatus: interview.status,
            candidate: {
              id: candidate._id,
              firstName: candidate.FirstName || '',
              lastName: candidate.LastName || '',
              fullName: `${candidate.FirstName || ''} ${candidate.LastName || ''}`.trim(),
              email: candidate.Email || '',
              phone: candidate.phone || '',
              candidateCode: candidate.candidateCode
            },
            position: {
              id: position._id,
              title: position.title || 'Position Not Specified',
              positionCode: position.positionCode,
              minExperience: position.minExperience,
              maxExperience: position.maxExperience,
              company: {
                id: company._id,
                name: company.companyName || position.companyname || 'Company Not Specified',
                companyCode: company.companyCode
              }
            }
          };
        }

        // Handle Mock Interview Rounds - FIXED: Properly structure mock data
        if (round.isMock && round.mockInterviewId) {
          const mock = round.mockInterviewId;
          const createdBy = mock.createdBy || {};

          return {
            ...baseInfo,
            interviewCode: mock.mockInterviewCode,
            // For mock interviews, we create a candidate-like object from mock data
            candidate: {
              id: mock._id,
              firstName: '',
              lastName: '',
              fullName: mock.candidateName || 'Candidate Not Specified',
              email: '',
              phone: '',
              candidateCode: mock.mockInterviewCode,
              // Additional mock-specific fields
              mockDetails: {
                skills: mock.skills || [],
                jobDescription: mock.jobDescription || '',
                currentRole: mock.currentRole || '',
                currentExperience: mock.currentExperience || '',
                higherQualification: mock.higherQualification || '',
                resume: mock.resume || null
              }
            },
            // For mock interviews, we create a position-like object
            position: {
              id: mock._id,
              title: 'Mock Interview',
              positionCode: mock.mockInterviewCode,
              description: mock.jobDescription || '',
              // Mock interviews don't have company, so we set it as N/A
              company: {
                id: null,
                name: 'Mock Interview',
                companyCode: 'MOCK'
              }
            },
            // Also include full mock details separately for backward compatibility
            mockDetails: {
              id: mock._id,
              candidateName: mock.candidateName || 'Candidate Not Specified',
              skills: mock.skills || [],
              jobDescription: mock.jobDescription || '',
              currentRole: mock.currentRole || '',
              currentExperience: mock.currentExperience || '',
              higherQualification: mock.higherQualification || '',
              resume: mock.resume || null,
              createdBy: {
                id: createdBy._id,
                name: createdBy.name || 'Unknown',
                email: createdBy.email
              }
            }
          };
        }

        // Fallback for incomplete data
        return {
          ...baseInfo,
          interviewCode: round.interviewCode || round.mockInterviewId?.mockInterviewCode,
          candidate: {
            fullName: round.isMock ?
              (round.mockInterviewId?.candidateName || 'Candidate Info Missing') :
              'Candidate Info Missing'
          },
          position: {
            title: round.isMock ? 'Mock Interview' : 'Position Info Missing'
          }
        };
      });

    // 7. Enrich with interviewer details if needed
    const enrichedResults = pendingResults.map(result => {
      const originalRound = allRounds.find(r => r._id.toString() === result.roundId.toString());

      if (originalRound && originalRound.interviewers) {
        result.interviewers = originalRound.interviewers.map(interviewer => ({
          id: interviewer._id,
          name: `${interviewer.FirstName || ''} ${interviewer.LastName || ''}`.trim(),
          email: interviewer.Email
        }));
      }

      // Add round history if available and relevant
      if (originalRound && originalRound.history && originalRound.history.length > 0) {
        result.roundHistory = originalRound.history.map(h => ({
          action: h.action,
          reasonCode: h.reasonCode,
          comment: h.comment,
          scheduledAt: h.scheduledAt,
          createdAt: h.createdAt
        }));
      }

      return result;
    });

    // 8. Sort by date (most recent first)
    enrichedResults.sort((a, b) => {
      const dateA = a.dateTime ? new Date(a.dateTime) : new Date(0);
      const dateB = b.dateTime ? new Date(b.dateTime) : new Date(0);
      return dateB - dateA;
    });

    return res.status(200).json({
      success: true,
      count: enrichedResults.length,
      totalRoundsFound: allRounds.length,
      feedbackCounts,
      data: enrichedResults,
      summary: {
        standardRounds: standardRounds.length,
        mockRounds: mockRounds.length,
        pendingFeedbacks: enrichedResults.length
      }
    });

  } catch (error) {
    console.error("Error fetching pending feedbacks:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching pending feedbacks",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  createFeedback,
  // getFeedbackByTenantId,
  // getFeedbackByInterviewerId,
  getfeedbackById,
  getFeedbackByRoundId,
  getAllFeedback,
  updateFeedback,
  validateFeedback,
  getFeedbackByContactIdRoundId,
  getCandidateByRoundId,
  getFeedbackRoundId, // getting all feedbacks  by roundid for scheduler only
  getPendingFeedbacks,
};

// const getFeedbackByRoundId = async (req, res) => {
//   try {
//     const { roundId } = req.params;
//     const { interviewerId } = req.query;

//     // 1️⃣ Validate roundId
//     if (!mongoose.Types.ObjectId.isValid(roundId)) {
//       return res.status(400).json({ success: false, message: "Invalid round ID" });
//     }

//     // 1️⃣.5 Validate interviewerId if provided
//     if (interviewerId && !mongoose.Types.ObjectId.isValid(interviewerId)) {
//       return res.status(400).json({ success: false, message: "Invalid interviewer ID" });
//     }

//     // 2️⃣ Find InterviewRound
//     const interviewRound = await InterviewRounds.findById(roundId)
//       .populate("interviewers", "FirstName LastName Email Phone");

//     if (!interviewRound) {
//       return res.status(404).json({ success: false, message: "Interview round not found" });
//     }

//     const interviewSection = await Interview.findOne({ _id: interviewRound.interviewId });

//     // 3️⃣ Find CandidatePosition using interviewId
//     const candidatePosition = await CandidatePosition.findOne({
//       interviewId: interviewRound.interviewId,
//     })
//     .populate('candidateId', 'FirstName LastName Email Phone skills CurrentExperience ownerId')
//     .populate("positionId", "title companyname jobDescription minexperience maxexperience Location minSalary maxSalary");

//     // 4️⃣ Fetch Feedback linked with this round
//     const feedbackQuery = { interviewRoundId: roundId };
//     if (interviewerId) {
//       feedbackQuery.interviewerId = interviewerId;
//     }

//     const feedbacks = await FeedbackModel.find(feedbackQuery)
//       .populate("candidateId", "FirstName LastName Email Phone ownerId")
//       .populate("positionId", "title companyname jobDescription minexperience maxexperience Location minSalary maxSalary")
//       .populate("interviewerId", "FirstName LastName Email Phone")
//       .populate("ownerId", "firstName lastName email");

//     // 5️⃣ Fetch Interview Questions for this round
//     const interviewQuestionsList = await InterviewQuestions.find({ roundId: roundId });

//     // 🔍 DEBUG: Log each question details
//     interviewQuestionsList.forEach((q, i) => {
//     });

//     // 🆕 IMPROVED: Build comprehensive feedback map by questionId with interviewer details
//     const feedbackMap = {};

//     feedbacks.forEach(feedback => {
//       const interviewerIdStr = feedback.interviewerId?._id?.toString();
//       if (!interviewerIdStr) return;

//       (feedback.questionFeedback || []).forEach(qf => {
//         if (qf.questionId) {
//           const questionIdStr = qf.questionId.toString();

//           // Create nested structure: questionId -> array of feedback from different interviewers
//           if (!feedbackMap[questionIdStr]) {
//             feedbackMap[questionIdStr] = [];
//           }

//           feedbackMap[questionIdStr].push({
//             feedbackId: feedback._id,
//             candidateAnswer: qf.candidateAnswer || null,
//             interviewerFeedback: qf.interviewerFeedback || null,
//             interviewerId: interviewerIdStr,
//             interviewer: {
//               _id: feedback.interviewerId._id,
//               FirstName: feedback.interviewerId.FirstName,
//               LastName: feedback.interviewerId.LastName,
//               Email: feedback.interviewerId.Email,
//               Phone: feedback.interviewerId.Phone
//             },
//             // Include overall feedback details for context
//             skills: feedback.skills || [],
//             generalComments: feedback.generalComments || null,
//             overallImpression: feedback.overallImpression || null,
//             status: feedback.status,
//             createdAt: feedback.createdAt,
//             updatedAt: feedback.updatedAt
//           });
//         }
//       });
//     });

//     // 🆕 IMPROVED: Process questions and separate by type with proper feedback structure
//     let preselectedQuestions = [];
//     let interviewerAddedQuestions = [];

//     interviewQuestionsList.forEach(q => {
//       const questionIdStr = q.questionId?.toString();
//       let questionFeedbacks = [];

//       // Get feedback for this question
//       if (questionIdStr && feedbackMap[questionIdStr]) {
//         if (interviewerId) {
//           // Filter feedback by specific interviewer
//           questionFeedbacks = feedbackMap[questionIdStr].filter(fb => fb.interviewerId === interviewerId);
//         } else {
//           // Get all feedback for this question
//           questionFeedbacks = feedbackMap[questionIdStr];
//         }
//       }

//       const questionWithFeedback = {
//         _id: q._id,
//         questionId: q.questionId,
//         interviewId: q.interviewId,
//         roundId: q.roundId,
//         order: q.order,
//         customizations: q.customizations,
//         mandatory: q.mandatory,
//         tenantId: q.tenantId,
//         ownerId: q.ownerId,
//         source: q.source,
//         snapshot: q.snapshot,
//         addedBy: q.addedBy,
//         createdAt: q.createdAt,
//         updatedAt: q.updatedAt,
//         // 🆕 IMPROVED: Properly structured feedback array
//         feedbacks: questionFeedbacks.length > 0 ? questionFeedbacks : [],
//         feedbackCount: questionFeedbacks.length,
//         hasResponse: questionFeedbacks.some(fb => fb.candidateAnswer?.submittedAnswer || fb.interviewerFeedback?.note)
//       };

//       // 🆕 IMPROVED: Separate questions based on addedBy field
//       if (q.addedBy === "interviewer") {
//         // This is an interviewer-added question
//         if (interviewerId) {
//           // If filtering by specific interviewer, only include their questions
//           if (q.ownerId?.toString() === interviewerId) {
//             interviewerAddedQuestions.push(questionWithFeedback);
//           }
//         } else {
//           // Include all interviewer-added questions
//           interviewerAddedQuestions.push(questionWithFeedback);
//         }
//       } else {
//         // This is a preselected question (addedBy is null, undefined, or not "interviewer")
//         preselectedQuestions.push(questionWithFeedback);
//       }
//     });

//     // 6️⃣ Get position data
//     let positionData = null;
//     if (candidatePosition?.positionId) {
//       positionData = {
//         _id: candidatePosition.positionId._id,
//         title: candidatePosition.positionId.title,
//         companyname: candidatePosition.positionId.companyname,
//         jobDescription: candidatePosition.positionId.jobDescription,
//         minexperience: candidatePosition.positionId.minexperience,
//         maxexperience: candidatePosition.positionId.maxexperience,
//         Location: candidatePosition.positionId.Location,
//         minSalary: candidatePosition.positionId.minSalary,
//         maxSalary: candidatePosition.positionId.maxSalary,
//         NoofPositions: candidatePosition.positionId.NoofPositions,
//         skills: candidatePosition.positionId.skills,
//         additionalNotes: candidatePosition.positionId.additionalNotes
//       };
//     } else if (feedbacks.length > 0 && feedbacks[0].positionId) {
//       positionData = {
//         _id: feedbacks[0].positionId._id,
//         title: feedbacks[0].positionId.title,
//         companyname: feedbacks[0].positionId.companyname,
//         jobDescription: feedbacks[0].positionId.jobDescription,
//         minexperience: feedbacks[0].positionId.minexperience,
//         maxexperience: feedbacks[0].positionId.maxexperience,
//         Location: feedbacks[0].positionId.Location,
//         minSalary: feedbacks[0].positionId.minSalary,
//         maxSalary: feedbacks[0].positionId.maxSalary,
//         NoofPositions: feedbacks[0].positionId.NoofPositions,
//         skills: feedbacks[0].positionId.skills,
//         additionalNotes: feedbacks[0].positionId.additionalNotes
//       };
//     }

//     // 🆕 IMPROVED: Calculate feedback statistics
//     const totalQuestions = preselectedQuestions.length + interviewerAddedQuestions.length;
//     const questionsWithFeedback = [...preselectedQuestions, ...interviewerAddedQuestions]
//       .filter(q => q.feedbacks.length > 0).length;
//     const questionsWithResponses = [...preselectedQuestions, ...interviewerAddedQuestions]
//       .filter(q => q.hasResponse).length;

//     // 7️⃣ Build Response
//     const responseData = {
//       interviewRound: {
//         _id: interviewRound._id,
//         interviewId: interviewRound.interviewId,
//         sequence: interviewRound.sequence,
//         interviewCode: interviewSection?.interviewCode,
//         roundTitle: interviewRound.roundTitle,
//         interviewMode: interviewRound.interviewMode,
//         interviewType: interviewRound.interviewType,
//         interviewerType: interviewRound.interviewerType,
//         duration: interviewRound.duration,
//         instructions: interviewRound.instructions,
//         dateTime: interviewRound.dateTime,
//         status: interviewRound.status,
//         meetingId: interviewRound.meetingId,
//         meetLink: interviewRound.meetLink,
//         assessmentId: interviewRound.assessmentId,
//         questions: interviewRound.questions,
//         rejectionReason: interviewRound.rejectionReason,
//         interviewers: interviewRound.interviewers || []
//       },
//       candidate: candidatePosition?.candidateId || null,
//       position: positionData,
//       interviewers: interviewRound.interviewers || [],

//       // 🆕 IMPROVED: Comprehensive feedback structure
//       interviewQuestions: {
//         preselectedQuestions: preselectedQuestions,
//         interviewerAddedQuestions: interviewerAddedQuestions,
//         statistics: {
//           totalQuestions: totalQuestions,
//           questionsWithFeedback: questionsWithFeedback,
//           questionsWithResponses: questionsWithResponses,
//           feedbackCompletionPercentage: totalQuestions > 0 ? Math.round((questionsWithFeedback / totalQuestions) * 100) : 0,
//           responseCompletionPercentage: totalQuestions > 0 ? Math.round((questionsWithResponses / totalQuestions) * 100) : 0
//         }
//       },

//       // 🆕 Keep original feedbacks for backward compatibility
//       feedbacks: feedbacks || [],

//       // 🆕 IMPROVED: Additional metadata
//       metadata: {
//         totalFeedbackRecords: feedbacks.length,
//         uniqueInterviewers: [...new Set(feedbacks.map(f => f.interviewerId?._id?.toString()))].filter(Boolean).length,
//         filteredByInterviewer: !!interviewerId,
//         requestedInterviewerId: interviewerId || null
//       }
//     };

//     // 🆕 DEBUG: Log questions with feedback details
//     preselectedQuestions.forEach((q, i) => {
//     });

//     interviewerAddedQuestions.forEach((q, i) => {
//     });

//     res.status(200).json({
//       success: true,
//       message: "Feedback retrieved successfully",
//       data: responseData,
//     });

//   } catch (error) {
//     console.error("🔥 Error fetching feedback:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message
//     });
//   }
// };
