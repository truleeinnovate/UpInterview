// v1.0.0 - Ashok - changed createdAt to _id for customRequestId generation
// v1.0.1 - Venkatesh - added wallet functionality deduction and hold amount
// v1.0.2 - Venkatesh -- Prepare a transaction record for wallet history (type: 'hold')
// v1.0.3 - Venkatesh - Store hold transaction ID in interview round for settlement tracking

const mongoose = require("mongoose");
const Interview = require("../models/Interview/Interview.js");
const InterviewRequest = require("../models/InterviewRequest");
const { Contacts } = require("../models/Contacts");
const { InterviewRounds } = require("../models/Interview/InterviewRounds.js");
const Wallet = require("../models/WalletTopup");
const { Candidate } = require("../models/Candidate.js");
const {
  MockInterviewRound,
} = require("../models/Mockinterview/mockinterviewRound.js");
const { MockInterview } = require("../models/Mockinterview/mockinterview.js");
const { generateUniqueId } = require("../services/uniqueIdGeneratorService.js");
const { buildSmartRoundUpdate } = require("./interviewRoundsController.js");
const {
  WALLET_BUSINESS_TYPES,
  createWalletTransaction,
} = require("../utils/interviewWalletUtil");

//old mansoor code i have changed this code because each interviwer send one request

// exports.createRequest = async (req, res) => {
//     try {
//         const {
//             tenantId, ownerId, scheduledInterviewId, interviewerType,
//             dateTime, duration, interviewerIds, candidateId,
//             positionId, status, roundId, requestMessage, expiryDateTime
//         } = req.body;

//         // const formattedInterviewerIds = interviewerIds.map(interviewer => ({
//         //     id: mongoose.isValidObjectId(interviewer.id) ? new mongoose.Types.ObjectId(interviewer.id) : null,
//         //     status: interviewer.status || "inprogress"
//         // })).filter(interviewer => interviewer.id !== null);

//         const newRequest = new OutsourceInterviewRequest({
//             tenantId: new mongoose.Types.ObjectId(tenantId),
//             ownerId,
//             scheduledInterviewId: new mongoose.Types.ObjectId(scheduledInterviewId),
//             interviewerType,
//             interviewerIds: interviewerIds,
//             dateTime,
//             duration,
//             candidateId,
//             positionId,
//             status,
//             // roundNumber,
//             roundId,
//             requestMessage,
//             expiryDateTime,
//         });

//         await newRequest.save();
//         res.status(201).json({ message: 'Interview request created successfully', data: newRequest });
//     } catch (error) {
//         console.error('Error creating interview request:', error);
//         res.status(500).json({ message: 'Internal server error', error: error.message });
//     }
// };

// each interviwer send one request

exports.createRequest = async (req, res) => {
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

exports.getAllRequests = async (req, res) => {
  try {
    const hasPaginationParams =
      "page" in req.query ||
      "limit" in req.query ||
      "search" in req.query ||
      "status" in req.query ||
      "type" in req.query;

    if (!hasPaginationParams) {
      // Legacy behavior: return full list (used by some existing UIs)
      const requests = await InterviewRequest.find()
        .populate({
          path: "positionId",
          model: "Position",
          select: "title",
          match: (doc) =>
            mongoose.Types.ObjectId.isValid(doc.positionId) ? {} : null,
        })
        .populate({
          path: "candidateId",
          model: "Candidate",
          select: "skills",
        })
        .populate({
          path: "interviewerId",
          model: "Contacts",
          select: "firstName lastName email phone currentRole imageData skills",
        })
        .lean();
      return res.status(200).json(requests);
    }

    // Paginated mode
    const page = Math.max(parseInt(req.query.page, 10) || 0, 0);
    const limitRaw = parseInt(req.query.limit, 10);
    const limit =
      Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 100) : 10;
    const search = (req.query.search || "").trim();
    const statusParam = (req.query.status || "").trim();
    const typeParam = (req.query.type || "").trim();

    const statusValues = statusParam
      ? statusParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const pipeline = [
      {
        $lookup: {
          from: "contacts",
          localField: "interviewerId",
          foreignField: "_id",
          as: "interviewer",
        },
      },
      { $unwind: { path: "$interviewer", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "positions",
          localField: "positionId",
          foreignField: "_id",
          as: "position",
        },
      },
      { $unwind: { path: "$position", preserveNullAndEmptyArrays: true } },
    ];

    const match = {};
    if (statusValues.length > 0) {
      match.status = { $in: statusValues };
    }
    if (typeParam) {
      match.interviewerType = { $regex: new RegExp(`^${typeParam}$`, "i") };
    }
    if (search) {
      const regex = new RegExp(search, "i");
      match.$or = [
        { interviewRequestCode: { $regex: regex } },
        { interviewerType: { $regex: regex } },
        { status: { $regex: regex } },
        { "interviewer.firstName": { $regex: regex } },
        { "interviewer.lastName": { $regex: regex } },
        { "interviewer.email": { $regex: regex } },
        { "position.title": { $regex: regex } },
      ];
    }
    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }

    pipeline.push({ $sort: { _id: -1 } });

    pipeline.push({
      $facet: {
        data: [
          { $skip: page * limit },
          { $limit: limit },
          {
            $addFields: {
              interviewerId: "$interviewer",
              positionId: "$position",
            },
          },
          { $project: { interviewer: 0, position: 0 } },
        ],
        totalCount: [{ $count: "count" }],
        statusCounts: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
      },
    });

    const result = await InterviewRequest.aggregate(pipeline);
    const agg = result?.[0] || { data: [], totalCount: [], statusCounts: [] };
    const totalItems = agg.totalCount?.[0]?.count || 0;
    const data = agg.data || [];
    const statsMap = (agg.statusCounts || []).reduce((acc, cur) => {
      if (cur && cur._id) acc[cur._id] = cur.count || 0;
      return acc;
    }, {});
    const stats = {
      inprogress: statsMap.inprogress || 0,
      accepted: statsMap.accepted || 0,
      declined: statsMap.declined || 0,
      expired: statsMap.expired || 0,
      cancelled: statsMap.cancelled || 0,
      withdrawn: statsMap.withdrawn || 0,
    };

    return res.status(200).json({
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit) || 0,
        totalItems,
        hasNext: (page + 1) * limit < totalItems,
        hasPrev: page > 0,
        itemsPerPage: limit,
      },
      stats,
      status: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

// exports.updateRequestStatus = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { interviewerIds, status } = req.body;
//         const request = await OutsourceInterviewRequest.findById(id);
//         if (!request) {
//             return res.status(404).json({ message: 'Interview request not found' });
//         }
//         // ✅ Merge new interviewer IDs with existing ones
//         const existingInterviewerIds = request.interviewerIds.map(String);
//         const newInterviewerIds = interviewerIds.filter(id => !existingInterviewerIds.includes(id));
//         request.interviewerIds = [...existingInterviewerIds, ...newInterviewerIds];
//         if (status && request.status === 'inprogress') {
//             request.status = status;
//             request.respondedAt = new Date();
//         }
//         await request.save();
//         res.status(200).json({ message: 'Request updated successfully', data: request });
//     } catch (error) {
//         console.error('Error updating request:', error);
//         res.status(500).json({ message: 'Internal server error', error: error.message });
//     }
// };

exports.updateRequestStatus = async (req, res) => {
  // Mark that logging will be handled by this controller
  res.locals.loggedByController = true;
  res.locals.processName = "Update Interview Request Status";

  try {
    const { id } = req.params;
    const { interviewerIds } = req.body;
    const request = await InterviewRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Interview request not found" });
    }
    let isAccepted = false;
    request.interviewerId = request.interviewerId.map((interviewer) => {
      const updatedInterviewer = interviewerIds.find(
        (i) => String(i.id) === String(interviewer.id)
      );
      if (updatedInterviewer) {
        interviewer.status = updatedInterviewer.status;
        if (updatedInterviewer.status === "accepted") {
          isAccepted = true;
        }
      }
      return interviewer;
    });
    if (isAccepted) {
      request.interviewerId = request.interviewerId.map((interviewer) => ({
        ...interviewer,
        status: interviewer.status === "accepted" ? "accepted" : "cancelled",
      }));
      const interview = await Interview.findById(request.scheduledInterviewId);
      if (interview) {
        interview.Status = "Scheduled";
        interview.rounds = interview.rounds.map((round) => ({
          ...round,
          Status: "Scheduled",
        }));
        await interview.save();
      } else {
        return res.status(404).json({
          message: "Interview not found for the scheduledInterviewId",
        });
      }
    }
    await request.save();

    // Structured internal log for successful status update
    res.locals.logData = {
      tenantId: request?.tenantId || "",
      ownerId: request?.ownerId || "",
      processName: "Update Interview Request Status",
      requestBody: req.body,
      status: "success",
      message: "Request and interview updated successfully",
      responseBody: request,
    };

    res.status(200).json({
      message: "Request and interview updated successfully",
      data: request,
    });
  } catch (error) {
    console.error("Error updating request:", error);
    // Structured internal log for error case
    res.locals.logData = {
      tenantId: req.body?.tenantId || "",
      ownerId: req.body?.ownerId || "",
      processName: "Update Interview Request Status",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const formatInterviewRequest = async (request) => {
  let roundDetails = null;
  let candidateDetails = null;
  let positionDetails = null;

  // Handle roundId (MockInterviewRounds or InterviewRounds)
  if (request.roundId) {
    if (request.isMockInterview) {
      // Fetch from MockInterviewRounds collection
      const mockRound = await mongoose
        .model("MockInterviewRound")
        .findById(request.roundId)
        .select("roundTitle interviewType duration dateTime")
        .lean();
      roundDetails = mockRound
        ? {
            roundTitle: mockRound.roundTitle,
            interviewType: mockRound.interviewType,
            duration: mockRound.duration,
            dateTime: mockRound.dateTime,
          }
        : null;
    } else {
      // Fetch from InterviewRounds collection
      const interviewRound = await mongoose
        .model("InterviewRounds")
        .findById(request.roundId)
        .select("roundTitle interviewType duration dateTime")
        .lean();
      roundDetails = interviewRound
        ? {
            roundTitle: interviewRound.roundTitle,
            interviewType: interviewRound.interviewType,
            duration: interviewRound.duration,
            dateTime: interviewRound.dateTime,
          }
        : null;
    }
  }

  // Handle candidate/contact data based on isMockInterview
  if (request.isMockInterview) {
    if (request.contactId) {
      const contact = await mongoose
        .model("Contacts")
        .findById(request.contactId)
        .select("firstName lastName email phone")
        .lean();
      candidateDetails = contact
        ? {
            id: contact._id,
            name: `${contact.firstName} ${contact.lastName}`,
            email: contact.email,
            phone: contact.phone,
          }
        : null;
    }
  } else {
    if (request.candidateId) {
      const candidate = await mongoose
        .model("Candidate")
        .findById(request.candidateId)
        .select("FirstName LastName Email Phone")
        .lean();
      candidateDetails = candidate
        ? {
            id: candidate._id,
            name: `${candidate.FirstName} ${candidate.LastName}`,
            email: candidate.Email,
            phone: candidate.Phone,
          }
        : null;
    }
  }

  // Handle position data only for non-mock interviews
  if (!request.isMockInterview && request.positionId) {
    const position = await mongoose
      .model("Position")
      .findById(request.positionId)
      .select("title description location companyname")
      .lean();
    positionDetails = position
      ? {
          id: position._id,
          title: position.title,
          description: position.description,
          location: position.location,
          companyname: position.companyname, // Added to match frontend
        }
      : null;
  }

  return {
    ...request,
    _id: request._id,
    id: request._id,
    positionId: request.positionId || null,
    tenantId: request.tenantId || null,
    roundId: request.roundId || null,
    contactId: request.interviewerId || null,
    status: request.status,
    isMockInterview: request.isMockInterview, // Added for frontend
    requestedDate: request.requestedAt
      ? new Date(request.requestedAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    urgency: request.expiryDateTime
      ? new Date(request.expiryDateTime) < new Date()
        ? "High"
        : "Medium"
      : "Low",
    type: roundDetails?.interviewType || "Unknown Type",
    roundDetails,
    candidateDetails,
    positionDetails,
    originalRequest: {
      dateTime: request.dateTime,
      duration: request.duration,
      status: request.status,
      interviewerType: request.interviewerType,
      expiryDateTime: request.expiryDateTime,
    },
  };
};

exports.getInterviewRequests = async (req, res) => {
  try {
    const { ownerId, interviewerId } = req.query;

    let requests = [];

    // If interviewerId is provided, fetch requests for that interviewer only
    if (interviewerId) {
      if (!mongoose.Types.ObjectId.isValid(interviewerId)) {
        return res.status(400).json({ message: "Invalid interviewerId" });
      }
      const interviewerObjectId = new mongoose.Types.ObjectId(interviewerId);
      requests = await InterviewRequest.find({
        interviewerId: interviewerObjectId,
      }).lean();
    } else {
      // Default: use ownerId logic
      if (!ownerId) {
        return res.status(400).json({ message: "ownerId is required" });
      }

      // Find all contacts where ownerId matches
      const contacts = await mongoose
        .model("Contacts")
        .find({ ownerId })
        .lean();

      if (!contacts || contacts.length === 0) {
        return res
          .status(404)
          .json({ message: "No contacts found for this ownerId" });
      }

      // Get all contact IDs for the query
      const contactIds = contacts.map((contact) => contact._id);

      // Find interview requests where interviewerId matches any of the contact IDs
      const query = { interviewerId: { $in: contactIds } };

      requests = await InterviewRequest.find(query).lean();
    }

    // Format all requests using the shared function
    const formattedRequests = await Promise.all(
      requests.map(formatInterviewRequest)
    );

    res.status(200).json(formattedRequests);
  } catch (error) {
    console.error("[getInterviewRequests] Error:", error, error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.acceptInterviewRequest = async (req, res) => {
  // Mark that logging will be handled by this controller
  res.locals.loggedByController = true;
  res.locals.processName = "Accept Interview Request";

  try {
    const { requestId, contactId, roundId } = req.body;

    if (!requestId || !contactId || !roundId) {
      return res
        .status(400)
        .json({ message: "requestId, contactId, and roundId are required" });
    }

    // Get the interview request to check if it's a mock interview
    const request = await InterviewRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Interview request not found" });
    }
    // let round;

    // Update based on interview type: MockInterviewRound or InterviewRounds
    // if (request.isMockInterview) {
    //   round = await MockInterviewRound.findById(roundId);
    //   if (!round) {
    //     return res
    //       .status(404)
    //       .json({ message: "Mock interview round not found" });
    //   }
    // } else {
    //   round = await InterviewRounds.findById(roundId);
    //   if (!round) {
    //     return res.status(404).json({ message: "Interview round not found" });
    //   }
    // }

    /* =====================================================
     * FETCH ROUND (mock / normal)
     * =================================================== */
    const RoundModel = request.isMockInterview
      ? MockInterviewRound
      : InterviewRounds;

    const round = await RoundModel.findById(roundId);
    if (!round) {
      return res.status(404).json({ message: "Interview round not found" });
    }

    //schedule only update for 1 st time from second time rescheduled will update
    // Decide schedule action based on history
    const hasScheduledOnce = round.history?.some(
      (h) => h.action === "Scheduled"
    );
    // console.log("roundhasScheduledOnce", round);
    const scheduleAction = hasScheduledOnce ? "Rescheduled" : "Scheduled";

    if (!round.interviewers.includes(contactId)) {
      // 🔧 CHANGED: build minimal update body

      const updatedBody = {
        status: scheduleAction,
        dateTime: round.dateTime, // required for history
        interviewerType: round.interviewerType,
        // round.interviewers.push(contactId);
        // interviewers: [
        //   ...(round.interviewers || []).map((id) => ({ _id: id })),
        //   { _id: contactId },
        // ],
        // round.status = "Scheduled";
        selectedInterviewers: [
          ...(round.interviewers || []).map((id) => ({ _id: id })),
          { _id: contactId },
        ],
      };

      // 🔧 CHANGED: explicit change detection
      const changes = {
        anyChange: true,
        statusChanged: round.status !== scheduleAction,
        dateTimeChanged: false,
      };

      // 🔧 CHANGED: correct helper usage
      const updatePayload = buildSmartRoundUpdate({
        existingRound: round,
        body: updatedBody,
        actingAsUserId: req.user?._id || null,
        changes,
      });

      // ✅ IMPORTANT: atomic update (NO manual history push)
      if (updatePayload) {
        await RoundModel.findByIdAndUpdate(
          roundId,
          {
            status: scheduleAction,
            ...updatePayload,
            interviewers: [
              ...(round.interviewers || []).map((id) => ({ _id: id })),
              { _id: contactId },
            ],
            selectedInterviewers: [
              ...(round.interviewers || []).map((id) => ({ _id: id })),
              { _id: contactId },
            ],
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }

      // round.interviewers.push(contactId);
      // round.status = scheduleAction;

      // // Build the update payload using your helper
      // const updatePayload = buildSmartRoundUpdate({
      //   existingRound: round,
      //   body: round, // new array with added interviewer
      //   // You can pass optional reason if frontend provides it
      //   // rescheduleReason: "added_new_interviewer",

      //   actingAsUserId: req.user?._id || null, // or whoever is accepting the request
      //   // changes,
      // });

      // // Apply atomic update with history tracking
      // // const updatedRound = await RoundModel.findByIdAndUpdate(
      // //   roundId,
      // //   updatePayload,
      // //   { new: true, runValidators: true }
      // // );
      // round.history.push(updatePayload);

      // await round.save();
    } else {
    }

    // Update all other interview requests with the same roundId to 'withdrawn' status
    const updateResult = await InterviewRequest.updateMany(
      {
        roundId: roundId,
        _id: { $ne: requestId }, // Don't update the accepted request
        status: { $ne: "withdrawn" }, // Only update if not already withdrawn
      },
      { status: "withdrawn", updatedAt: new Date() }
    );

    // Update the status of the accepted request
    await InterviewRequest.findByIdAndUpdate(
      requestId,
      { status: "accepted" },
      { new: true }
    );

    // Fetch contact for interviewer rates and expertise
    const contact = await Contacts.findById(contactId);
    if (!contact) {
      return res.status(404).json({ message: "Interviewer contact not found" });
    }

    // Validate duration
    const duration = request.duration;
    const durationInMinutes = parseInt(duration?.split(" ")[0], 10);
    if (isNaN(durationInMinutes) || durationInMinutes <= 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid duration in interview request. Expected format like "30 minutes".`,
      });
    }

    // Determine rate based on experience level
    let rate;
    let experienceLevel;

    if (request.isMockInterview) {
      let mockInterview = null;
      try {
        mockInterview = await MockInterview.findById(round.mockInterviewId);
        if (!mockInterview) {
        }
      } catch (error) {
        console.error("Invalid MockInterview ID:", error.message);
      }

      const expertiseYears = Number(mockInterview.currentExperience);
      if (isNaN(expertiseYears) || expertiseYears < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid or missing expertiseLevel for interviewer (${mockInterview}). Must be a non-negative number.`,
        });
      }
      if (expertiseYears <= 3) {
        experienceLevel = "junior";
      } else if (expertiseYears <= 6) {
        experienceLevel = "mid";
      } else {
        experienceLevel = "senior";
      }
      rate = contact.rates?.[experienceLevel]?.inr;
      if (typeof rate !== "number" || rate <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid or missing INR rate for ${experienceLevel} level in contact (${contactId}).`,
        });
      }
    } else {
      // Regular interview: Map candidate's CurrentExperience to level
      const candidate = await Candidate.findById(request.candidateId);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      const experienceYears = Number(candidate.CurrentExperience);
      if (isNaN(experienceYears) || experienceYears < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid or missing CurrentExperience for candidate (${request.candidateId}).`,
        });
      }
      if (experienceYears <= 3) {
        experienceLevel = "junior";
      } else if (experienceYears <= 6) {
        experienceLevel = "mid";
      } else {
        experienceLevel = "senior";
      }
      rate = contact.rates?.[experienceLevel]?.inr;
      if (typeof rate !== "number" || rate <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid or missing INR rate for ${experienceLevel} level in contact (${contactId}).`,
        });
      }
    }

    // Calculate base amount
    let totalAmount = (rate * durationInMinutes) / 60;
    if (isNaN(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Failed to calculate interview fee. Please check rate and duration.",
      });
    }

    // Apply discount if it's a mock interview
    let appliedDiscountPercentage = 0;
    let discountAmount = 0;
    if (request.isMockInterview && contact.mock_interview_discount) {
      appliedDiscountPercentage =
        parseFloat(contact.mock_interview_discount) || 0;
      if (appliedDiscountPercentage > 0 && appliedDiscountPercentage <= 100) {
        discountAmount = (totalAmount * appliedDiscountPercentage) / 100;
        totalAmount -= discountAmount;
      }
    }

    // Fetch wallet and derive available balance, taking existing holds into account
    const wallet = await Wallet.findOne({ ownerId: request.ownerId });
    if (!wallet) {
      return res.status(400).json({
        success: false,
        message: "No wallet found for this organization.",
      });
    }

    const walletBalance = Number(wallet.balance || 0);

    // With the shared wallet helper, `balance` already reflects available funds
    // after all previous holds. We keep the pre-check simple and only look at
    // this round's selection-time hold (if any) plus the current balance.
    const availableBalanceBefore = walletBalance;

    // Try to locate an existing selection-time HOLD for this round (created at round save)
    let selectionHoldTx = null;
    if (Array.isArray(wallet.transactions) && wallet.transactions.length > 0) {
      selectionHoldTx = wallet.transactions
        .slice()
        .reverse()
        .find((t) => {
          if (!t || !t.type || !t.status) return false;
          const txType = String(t.type).toLowerCase();
          const txStatus = String(t.status).toLowerCase();
          const meta = t.metadata || {};
          return (
            txType === "hold" &&
            txStatus === "pending" &&
            String(meta.roundId || "") === String(roundId) &&
            meta.source === "selection_hold"
          );
        });
    }

    const selectionHoldAmount = selectionHoldTx
      ? Number(selectionHoldTx.amount || 0)
      : 0;

    // Effective funds we can use for the final HOLD, considering this round's
    // selection-time hold. We keep the logic simple: available balance now
    // plus whatever was reserved for this round must cover the final
    // interviewer amount.
    const effectiveAvailable = availableBalanceBefore + selectionHoldAmount;

    if (effectiveAvailable < totalAmount) {
      return res.status(400).json({
        success: false,
        message:
          "Insufficient available balance in wallet to accept this interview request.",
      });
    }

    const holdID =
      request?.interviewRequestCode || String(requestId).slice(-10);

    // Description reused for both final hold record and fallback hold create
    const holdDescription = `Hold for ${
      request.isMockInterview ? "mock " : ""
    }interview round ${round?.roundTitle}`;

    let updatedWallet = wallet;
    let savedTransaction = null;

    if (selectionHoldTx && selectionHoldAmount > 0) {
      // Simple adjustment logic:
      // - selectionHoldAmount was reserved at selection time (e.g. 4000)
      // - totalAmount is final interviewer amount (e.g. 1400)
      // - we release only the difference (4000 - 1400 = 2600) back to org wallet
      //   as a credit, and leave the remaining 1400 effectively held.
      const releaseAmount = Math.max(selectionHoldAmount - totalAmount, 0);

      if (releaseAmount > 0) {
        const releaseResult = await createWalletTransaction({
          ownerId: request.ownerId,
          businessType: WALLET_BUSINESS_TYPES.HOLD_RELEASE,
          amount: releaseAmount,
          description: `Refund unused selection-time hold for interview round ${round?.roundTitle}`,
          relatedInvoiceId: selectionHoldTx.relatedInvoiceId || holdID,
          status: "completed",
          metadata: {
            interviewId: String(
              request.isMockInterview
                ? round?.mockInterviewId
                : round?.interviewId || ""
            ),
            roundId: String(roundId),
            requestId: String(requestId),
            source: "selection_hold_refund_on_accept",
            originalSelectionHoldTransactionId: selectionHoldTx._id
              ? selectionHoldTx._id.toString()
              : undefined,
            selectionHoldAmount,
            finalHoldAmount: totalAmount,
          },
        });

        updatedWallet = releaseResult.wallet;
      }

      // Create a non-mutating hold record for the final interviewer amount so
      // that transaction history clearly shows the final hold (e.g. 1400)
      // without double-counting holdAmount.
      const noteResult = await createWalletTransaction({
        ownerId: request.ownerId,
        businessType: WALLET_BUSINESS_TYPES.HOLD_NOTE,
        amount: totalAmount,
        description: holdDescription,
        relatedInvoiceId: holdID,
        metadata: {
          interviewId: String(
            request.isMockInterview
              ? round?.mockInterviewId
              : round?.interviewId || ""
          ),
          roundId: String(roundId),
          requestId: String(requestId),
          interviewerContactId: String(contact._id),
          rate: rate, // Store selected rate
          experienceLevel: experienceLevel,
          duration: String(duration),
          durationInMinutes: durationInMinutes,
          isMockInterview: Boolean(request.isMockInterview),
          mockInterviewDiscount: request.isMockInterview
            ? appliedDiscountPercentage
            : null,
          calculation: {
            formula:
              request.isMockInterview && appliedDiscountPercentage > 0
                ? "(rate * minutes / 60) - discount"
                : "rate * minutes / 60",
            rate: rate,
            minutes: durationInMinutes,
            discountPercentage: appliedDiscountPercentage,
          },
          source: "interview_accept_hold",
        },
      });

      updatedWallet = noteResult.wallet;
      savedTransaction = noteResult.transaction;
    } else {
      // Fallback for legacy cases where no selection-time hold was created:
      // create a real HOLD for the full interviewer amount.
      const holdResult = await createWalletTransaction({
        ownerId: request.ownerId,
        businessType: WALLET_BUSINESS_TYPES.HOLD_CREATE,
        amount: totalAmount,
        description: holdDescription,
        relatedInvoiceId: holdID,
        metadata: {
          interviewId: String(
            request.isMockInterview
              ? round?.mockInterviewId
              : round?.interviewId || ""
          ),
          roundId: String(roundId),
          requestId: String(requestId),
          interviewerContactId: String(contact._id),
          rate: rate, // Store selected rate
          experienceLevel: experienceLevel,
          duration: String(duration),
          durationInMinutes: durationInMinutes,
          isMockInterview: Boolean(request.isMockInterview),
          mockInterviewDiscount: request.isMockInterview
            ? appliedDiscountPercentage
            : null,
          calculation: {
            formula:
              request.isMockInterview && appliedDiscountPercentage > 0
                ? "(rate * minutes / 60) - discount"
                : "rate * minutes / 60",
            rate: rate,
            minutes: durationInMinutes,
            discountPercentage: appliedDiscountPercentage,
          },
          source: "interview_accept_hold",
        },
      });

      updatedWallet = holdResult.wallet;
      savedTransaction = holdResult.transaction;
    }

    // ================== INTERVIEWER WALLET HOLD (PENDING PAYOUT) ==================
    // Mirror the final interviewer amount as a hold in the interviewer's wallet so
    // their wallet shows this amount under `holdAmount` and in transaction history.
    try {
      const interviewerOwnerId = contact?.ownerId;
      if (interviewerOwnerId) {
        const interviewerWallet = await Wallet.findOne({
          ownerId: interviewerOwnerId,
        });

        // Only create a hold if the interviewer already has a wallet set up.
        if (interviewerWallet) {
          await createWalletTransaction({
            ownerId: String(interviewerOwnerId),
            businessType: WALLET_BUSINESS_TYPES.INTERVIEWER_HOLD_CREATE,
            amount: totalAmount,
            description: holdDescription,
            relatedInvoiceId: holdID,
            metadata: {
              interviewId: String(
                request.isMockInterview
                  ? round?.mockInterviewId
                  : round?.interviewId || ""
              ),
              roundId: String(roundId),
              requestId: String(requestId),
              organizationOwnerId: String(request.ownerId),
              source: "interviewer_pending_payout_hold",
            },
          });
        }
      }
    } catch (interviewerHoldErr) {
      console.error(
        "[acceptInterviewRequest] Failed to create interviewer wallet hold:",
        interviewerHoldErr
      );
      // Do not fail the accept flow if interviewer wallet hold creation fails.
    }

    const transactionId =
      savedTransaction && savedTransaction._id
        ? savedTransaction._id.toString()
        : null;

    // Send emails
    try {
      const emailController = require("./EmailsController/interviewEmailController");
      await emailController.sendInterviewRoundEmails({
        body: {
          interviewId: request.isMockInterview
            ? round?.mockInterviewId
            : round?.interviewId,
          roundId: roundId,
          sendEmails: true,
        },
      });
    } catch (emailError) {
      console.error("Failed to send interview round emails:", emailError);
    }

    const successResponse = {
      success: true,
      message: `${
        request.isMockInterview ? "Mock i" : "I"
      }nterview request accepted; funds held and emails processed`,
      wallet: {
        balance: updatedWallet?.balance,
        holdAmount: updatedWallet?.holdAmount,
      },
      transaction: savedTransaction
        ? {
            _id: transactionId,
            type: savedTransaction.type,
            amount: savedTransaction.amount,
            description: savedTransaction.description,
            relatedInvoiceId: savedTransaction.relatedInvoiceId,
            status: savedTransaction.status,
            metadata: savedTransaction.metadata,
          }
        : null,
      appliedDiscount: request.isMockInterview
        ? appliedDiscountPercentage
        : null,
      roundUpdated: true,
      holdTransactionId: transactionId,
    };

    // Structured internal log for successful accept
    res.locals.logData = {
      tenantId: request?.tenantId || "",
      ownerId: request?.ownerId || "",
      processName: "Accept Interview Request",
      requestBody: req.body,
      status: "success",
      message: successResponse.message,
      responseBody: successResponse,
    };

    return res.status(200).json(successResponse);
  } catch (error) {
    console.error("[acceptInterviewRequest] Error:", error);
    // Structured internal log for error case
    res.locals.logData = {
      tenantId: req.body?.tenantId || "",
      ownerId: req.body?.ownerId || "",
      processName: "Accept Interview Request",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getSingleInterviewRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await InterviewRequest.findById(id)
      .populate({
        path: "candidateId",
        model: "Candidate",
        select: "skills",
      })
      // v1.0.0 <------------------------------------------------------------------------
      .populate({
        path: "interviewerId",
        model: "Contacts",
        select: "firstName lastName email phone currentRole imageData skills", // customize fields
      });
    // v1.0.0 ------------------------------------------------------------------------>

    return res.status(200).json(request);
  } catch (error) {
    console.error("Internal server error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// module.exports = createRequest;
