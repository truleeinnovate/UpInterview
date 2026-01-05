//<----v1.0.0---Venkatesh-----get feedback by tenant ID

const FeedbackModel = require("../models/feedback.js");
const mongoose = require("mongoose"); // Import mongoose to use ObjectId
const { triggerWebhook, EVENT_TYPES } = require("../services/webhookService");

const InterviewQuestions = require("../models/Interview/selectedInterviewQuestion.js");
const { InterviewRounds } = require("../models/Interview/InterviewRounds.js");
const CandidatePosition = require("../models/CandidatePosition.js");
const { Contacts } = require("../models/Contacts.js");
const { Interview } = require("../models/Interview/Interview.js");
const Tenant = require("../models/Tenant.js");

// Import validation functions
const {
  validateCreateFeedback,
  validateUpdateFeedback,
  validateFeedbackBusinessRules,
} = require("../validations/feedbackValidation");

// const mongoose = require("mongoose");
// const FeedbackModel = require("../models/InterviewFeedback");
// const InterviewRounds = require("../models/InterviewRounds");
// const InterviewQuestions = require("../models/InterviewQuestions");
// const Interview = require("../models/Interview");

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
      skills,
      questionFeedback,
      generalComments,
      overallImpression,
      status,
      feedbackCode,
    } = req.body; //validatedData;

    // Process questions
    const processedQuestionFeedback = (questionFeedback || []).map(
      (qFeedback) => {
        const rawQuestion = qFeedback?.questionId;
        let onlyQuestionId = "";

        if (typeof rawQuestion === "string") onlyQuestionId = rawQuestion;
        else if (rawQuestion && typeof rawQuestion === "object")
          onlyQuestionId = rawQuestion.questionId;

        return {
          questionId: onlyQuestionId,
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
        };
      }
    );

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
    let feedbackInstance;
    if (type === "draft") {
      feedbackInstance = await FeedbackModel.findOne({
        interviewRoundId,
        candidateId,
        interviewerId,
      });

      if (feedbackInstance) {
        // Update draft
        feedbackInstance.skills = skills || feedbackInstance.skills;
        feedbackInstance.questionFeedback =
          processedQuestionFeedback || feedbackInstance.questionFeedback;
        feedbackInstance.generalComments =
          generalComments || feedbackInstance.generalComments;
        feedbackInstance.overallImpression =
          overallImpression || feedbackInstance.overallImpression;
        feedbackInstance.status = "draft";
      }
    }

    // Generate feedbackCode (only for new feedback)
    let finalFeedbackCode = feedbackInstance?.feedbackCode;
    if (!finalFeedbackCode && interviewRoundId && feedbackCode) {
      const existingCount = await FeedbackModel.countDocuments({
        interviewRoundId,
      });
      finalFeedbackCode =
        existingCount === 0
          ? `${feedbackCode}`
          : `${feedbackCode}-${existingCount + 1}`;
    }

    // Create new feedback (draft or submit)
    if (!feedbackInstance) {
      feedbackInstance = new FeedbackModel({
        tenantId,
        ownerId,
        interviewRoundId,
        candidateId,
        positionId,
        interviewerId,
        skills,
        questionFeedback: processedQuestionFeedback,
        generalComments: generalComments || "",
        overallImpression: overallImpression || {},
        status: type === "submit" ? "submitted" : "draft",
        feedbackCode: finalFeedbackCode,
      });
    }

    await feedbackInstance.save();

    // Trigger webhook for feedback submission only (not for drafts)
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

        console.log(
          `[FEEDBACK WEBHOOK] Triggering creation webhook for feedback ${feedbackInstance._id} with status: ${feedbackInstance.status}`
        );
        await triggerWebhook(
          EVENT_TYPES.FEEDBACK_STATUS_UPDATED,
          webhookPayload,
          tenantId
        );
        console.log(
          `[FEEDBACK WEBHOOK] Creation webhook sent successfully for feedback ${feedbackInstance._id}`
        );
      } catch (webhookError) {
        console.error(
          "[FEEDBACK WEBHOOK] Error triggering feedback creation webhook:",
          webhookError
        );
        // Continue execution even if webhook fails
      }
    }

    // Resolve interviewId from round
    let resolvedInterviewId = null;
    try {
      if (interviewRoundId) {
        const roundDoc = await InterviewRounds.findById(
          interviewRoundId
        ).select("interviewId");
        resolvedInterviewId = roundDoc?.interviewId || null;
      }
    } catch (e) {
      console.warn(
        "Unable to resolve interviewId:",
        interviewRoundId,
        e?.message
      );
    }

    // Handle InterviewQuestions logic
    if (processedQuestionFeedback && processedQuestionFeedback.length > 0) {
      for (let i = 0; i < processedQuestionFeedback.length; i++) {
        const qFeedback = processedQuestionFeedback[i];
        const original = questionFeedback[i]?.questionId;

        if (original && typeof original === "object") {
          const actual = original.snapshot || original;
          const normalizedQuestionId = qFeedback.questionId;
          const src = original.source || actual.source || "custom";
          const mand = original.mandatory || actual.mandatory || "false";

          // For interviewer-added questions, ownerId should align with interviewerId
          // so that getFeedbackByRoundId (which filters by interviewerId) returns them.
          const questionOwnerId =
            (interviewerId && interviewerId.toString()) ||
            (ownerId && ownerId.toString()) ||
            "";

          // Avoid duplicates in draft updates
          const exists = await InterviewQuestions.findOne({
            roundId: interviewRoundId,
            ownerId: questionOwnerId,
            questionId: normalizedQuestionId,
            addedBy: "interviewer",
          }).lean();

          if (!exists) {
            const doc = new InterviewQuestions({
              interviewId: resolvedInterviewId,
              roundId: interviewRoundId,
              order: i + 1,
              mandatory: mand,
              tenantId: tenantId || "",
              ownerId: questionOwnerId,
              questionId: normalizedQuestionId,
              source: src,
              snapshot: actual || {},
              addedBy: "interviewer",
            });
            await doc.save();
          }
        }
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
    console.error("Error creating/updating feedback:", error);

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

const getfeedbackById = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await FeedbackModel.findById(id)
      .populate("candidateId", "FirstName LastName Email Phone")
      .populate("positionId", "title companyname jobDescription")
      .populate("interviewRoundId", "roundTitle interviewMode interviewType")
      .populate("interviewerId", "firstName lastName")
      .populate("ownerId", "firstName lastName email");
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
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
    const feedback = await FeedbackModel.find()
      .populate("candidateId", "FirstName LastName Email Phone")
      .populate("positionId", "title companyname jobDescription")
      .populate("interviewRoundId", "roundTitle interviewMode interviewType")
      .populate("interviewerId", "firstName lastName")
      .populate("ownerId", "firstName lastName email");
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
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

//----v1.0.0--->

const getFeedbackByRoundId = async (req, res) => {
  try {
    const { roundId } = req.params;
    const { interviewerId } = req.query;

    // Validate roundId
    if (!mongoose.Types.ObjectId.isValid(roundId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid round ID" });
    }
    if (interviewerId && !mongoose.Types.ObjectId.isValid(interviewerId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid interviewer ID" });
    }

    // Fetch InterviewRound
    const interviewRound = await InterviewRounds.findById(roundId).populate(
      "interviewers",
      "FirstName LastName Email Phone"
    );

    if (!interviewRound) {
      return res
        .status(404)
        .json({ success: false, message: "Interview round not found" });
    }

    const interviewSection = await Interview.findOne({
      _id: interviewRound.interviewId,
    });

    // Fetch CandidatePosition
    const candidatePosition = await CandidatePosition.findOne({
      interviewId: interviewRound.interviewId,
    })
      .populate(
        "candidateId",
        "FirstName LastName Email Phone skills CurrentExperience"
      )
      .populate(
        "positionId",
        "title companyname jobDescription minexperience maxexperience Location minSalary maxSalary"
      );

    // Fetch Feedback
    const feedbackQuery = { interviewRoundId: roundId };
    if (interviewerId) {
      feedbackQuery.interviewerId = interviewerId;
    }

    const feedbacks = await FeedbackModel.find(feedbackQuery)
      .populate("candidateId", "FirstName LastName Email Phone ownerId")
      .populate(
        "positionId",
        "title companyname jobDescription minexperience maxexperience Location minSalary maxSalary"
      )
      .populate("interviewerId", "FirstName LastName Email Phone")
      .populate("ownerId", "firstName lastName email");
    // .populate({
    //   path: "questionFeedback.questionId",
    //   model: "InterviewQuestions"
    // });

    // Fetch all Interview Questions for the round
    const interviewQuestionsList = await InterviewQuestions.find({
      roundId: roundId,
    });

    // Build question map for easy lookup
    const questionMap = interviewQuestionsList.reduce((acc, q) => {
      acc[q._id.toString()] = q.toObject();
      return acc;
    }, {});

    // Merge all questions into each feedback
    const feedbacksMerged = feedbacks.map((fb) => {
      const fbAnswersMap = {};

      (fb.questionFeedback || []).forEach((qf) => {
        if (
          qf.questionId &&
          typeof qf.questionId === "object" &&
          qf.questionId._id
        ) {
          fbAnswersMap[qf.questionId._id.toString()] = qf;
        } else if (qf.questionId) {
          fbAnswersMap[qf.questionId.toString()] = qf;
        }
      });

      const mergedQuestions = Object.values(questionMap).map((q) => {
        const ans = fbAnswersMap[q.questionId.toString()];
        return {
          _id: q._id,
          questionText: q.questionText,
          addedBy: q.addedBy,
          questionId: q.questionId,
          candidateAnswer: ans?.candidateAnswer || null,
          interviewerFeedback: ans?.interviewerFeedback || null,
          snapshot: q.snapshot,
        };
      });

      return {
        ...fb.toObject(),
        questionFeedback: mergedQuestions,
      };
    });

    // Separate questions for interviewer-added vs preselected
    let preselectedQuestions = interviewQuestionsList
      .filter((q) => q.addedBy !== "interviewer" || !q.addedBy)
      .map((q) => q.toObject());

    let interviewerAddedQuestions = interviewQuestionsList
      .filter((q) => q.addedBy === "interviewer")
      .map((q) => q.toObject());

    if (interviewerId) {
      interviewerAddedQuestions = interviewerAddedQuestions.filter(
        (q) => q.ownerId?.toString() === interviewerId
      );
    }

    // Build position data
    let positionData = null;
    if (candidatePosition?.positionId) {
      positionData = candidatePosition.positionId.toObject();
    } else if (feedbacks.length > 0 && feedbacks[0].positionId) {
      positionData = feedbacks[0].positionId.toObject();
    }

    // Final response
    const responseData = {
      interviewRound: {
        _id: interviewRound._id,
        interviewId: interviewRound.interviewId,
        sequence: interviewRound.sequence,
        interviewCode: interviewSection?.interviewCode,
        tenantId: interviewSection.tenantId,
        ownerId: interviewSection.ownerId,
        roundTitle: interviewRound.roundTitle,
        interviewMode: interviewRound.interviewMode,
        interviewType: interviewRound.interviewType,
        interviewerType: interviewRound.interviewerType,
        duration: interviewRound.duration,
        instructions: interviewRound.instructions,
        dateTime: interviewRound.dateTime,
        status: interviewRound.status,
        meetingId: interviewRound.meetingId,
        // meetLink: interviewRound.meetLink,
        meetPlatform: interviewRound.meetPlatform,
        assessmentId: interviewRound.assessmentId,
        questions: interviewRound.questions,
        rejectionReason: interviewRound.rejectionReason,
        interviewers: interviewRound.interviewers || [],
      },
      candidate: candidatePosition?.candidateId || null,
      position: positionData,
      interviewers: interviewRound.interviewers || [],
      feedbacks: feedbacksMerged || [],
      interviewQuestions: {
        preselectedQuestions,
        interviewerAddedQuestions,
      },
    };

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
    const { contactId, roundId } = req.query;

    if (!contactId || !roundId) {
      return res
        .status(400)
        .json({ error: "contactId and roundId are required" });
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

    // 3. Get round dateTime
    const round = await InterviewRounds.findById(roundId);
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

    const candidate = round.interviewId?.candidateId;
    const position = round.interviewId?.positionId;

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found for this round",
      });
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

    // 2. Get Interview, Candidate, Position details
    const interview = await Interview.findById(round.interviewId)
      .populate("candidateId")
      .populate("positionId");

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
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

    console.log("Update Data Received:", updateData);

    // Preserve original questionFeedback from request for interviewer question processing
    const originalQuestionFeedback = Array.isArray(req.body?.questionFeedback)
      ? req.body.questionFeedback
      : [];

    // Normalize questionFeedback.questionId on updates (stringify IDs)
    if (
      updateData.questionFeedback &&
      Array.isArray(updateData.questionFeedback)
    ) {
      updateData.questionFeedback = updateData.questionFeedback.map(
        (feedback) => {
          const raw = feedback?.questionId;
          let normalizedId = "";
          if (typeof raw === "string") normalizedId = raw;
          else if (raw && typeof raw === "object")
            normalizedId = raw.questionId || raw._id || raw.id || "";
          return {
            ...feedback,
            questionId: normalizedId,
          };
        }
      );
    }

    // Find and update the feedback
    const updatedFeedback = await FeedbackModel.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators
      }
    )
      .populate(
        "candidateId",
        "FirstName LastName Email Phone skills CurrentExperience"
      )
      .populate("interviewerId", "FirstName LastName Email Phone")
      .populate("positionId", "title companyname");

    if (!updatedFeedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    // When updating, also ensure newly added interviewer questions are persisted
    // in SelectedInterviewQuestion collection (mirrors createFeedback behavior)
    if (originalQuestionFeedback && originalQuestionFeedback.length > 0) {
      const interviewRoundId = updatedFeedback.interviewRoundId;
      const tenantId = updatedFeedback.tenantId;
      const ownerId = updatedFeedback.ownerId;
      const interviewerId = updatedFeedback.interviewerId;

      let resolvedInterviewId = null;
      try {
        if (interviewRoundId) {
          const roundDoc = await InterviewRounds.findById(
            interviewRoundId
          ).select("interviewId");
          resolvedInterviewId = roundDoc?.interviewId || null;
        }
      } catch (e) {
        console.warn(
          "Unable to resolve interviewId during feedback update:",
          interviewRoundId,
          e?.message
        );
      }

      if (interviewRoundId && ownerId) {
        for (let i = 0; i < originalQuestionFeedback.length; i++) {
          const original = originalQuestionFeedback[i]?.questionId;

          // Only process interviewer-added questions sent as full objects
          if (original && typeof original === "object") {
            const actual = original.snapshot || original;
            const normalizedQuestionId =
              original.questionId || original._id || original.id || "";

            if (!normalizedQuestionId) continue;

            const src = original.source || actual.source || "custom";
            const mand = original.mandatory || actual.mandatory || "false";

            // Align SelectedInterviewQuestion.ownerId with interviewerId when available
            const questionOwnerId =
              (interviewerId && interviewerId.toString()) ||
              (ownerId && ownerId.toString()) ||
              "";

            const exists = await InterviewQuestions.findOne({
              roundId: interviewRoundId,
              ownerId: questionOwnerId,
              questionId: normalizedQuestionId,
              addedBy: "interviewer",
            }).lean();

            if (!exists) {
              const doc = new InterviewQuestions({
                interviewId: resolvedInterviewId,
                roundId: interviewRoundId,
                order: i + 1,
                mandatory: mand,
                tenantId: tenantId || "",
                ownerId: questionOwnerId,
                questionId: normalizedQuestionId,
                source: src,
                snapshot: actual || {},
                addedBy: "interviewer",
              });

              await doc.save();
            }
          }
        }
      }
    }

    // Trigger webhook for feedback status update if status changed to submitted
    if (updatedFeedback.status === "submitted") {
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
          `[FEEDBACK WEBHOOK] Triggering status update webhook for feedback ${updatedFeedback._id} with status: ${updatedFeedback.status}`
        );
        await triggerWebhook(
          EVENT_TYPES.FEEDBACK_STATUS_UPDATED,
          webhookPayload,
          updatedFeedback.tenantId
        );
        console.log(
          `[FEEDBACK WEBHOOK] Status update webhook sent successfully for feedback ${updatedFeedback._id}`
        );
      } catch (webhookError) {
        console.error(
          "[FEEDBACK WEBHOOK] Error triggering feedback status update webhook:",
          webhookError
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

// Validation endpoint for feedback
const validateFeedback = async (req, res) => {
  try {
    const { type } = req.body;

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
