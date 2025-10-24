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
const { Candidate } = require("../models/Candidate");
const { MockInterviewRound } = require('../models/Mockinterview/mockinterviewRound');
const { MockInterview } = require('../models/Mockinterview/mockinterview');


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

function generateCustomRequestId(latestNumber) {
  const nextNumber = latestNumber + 1;
  return `INT-RQST-${String(nextNumber).padStart(5, "0")}`;
}

exports.createRequest = async (req, res) => {
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
      status,
      roundId,
      requestMessage,
      expiryDateTime,
      isMockInterview,
      contactId
    } = req.body;
    const isInternal = interviewerType === "internal";

    // Step 1: Get the last created request to determine the last number used
    // v1.0.0 <------------------------------------------------------------------------
    const lastRequest = await InterviewRequest.findOne({})
      .sort({ _id: -1 }) // ensure you have timestamps enabled
      .select("customRequestId");
    // v1.0.0 ------------------------------------------------------------------------>

    let latestNumber = 0;
    if (lastRequest && lastRequest.customRequestId) {
      const match = lastRequest.customRequestId.match(/INT-RQST-(\d+)/);
      if (match) {
        latestNumber = parseInt(match[1], 10);
      }
    }

    const customRequestId = generateCustomRequestId(latestNumber);

    const newRequest = new InterviewRequest({
      interviewRequestCode: customRequestId,
      tenantId: new mongoose.Types.ObjectId(tenantId),
      ownerId,
      scheduledInterviewId: isMockInterview ? undefined : new mongoose.Types.ObjectId(scheduledInterviewId),
      interviewerType,
      contactId: new mongoose.Types.ObjectId(contactId),
      interviewerId: new mongoose.Types.ObjectId(interviewerId), // Save interviewerId instead of an array
      dateTime,
      duration,
      candidateId: isMockInterview ? undefined : new mongoose.Types.ObjectId(candidateId),
      positionId: isMockInterview ? undefined : new mongoose.Types.ObjectId(positionId),
      status: isInternal ? "accepted" : "inprogress",
      roundId: new mongoose.Types.ObjectId(roundId),
      requestMessage,
      expiryDateTime,
      isMockInterview
    });

    await newRequest.save();
    res.status(201).json({
      message: "Interview request created successfully",
      data: newRequest,
    });
  } catch (error) {
    console.error("Error creating interview request:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
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
      // v1.0.0 <------------------------------------------------------------------------
      .populate({
        path: "interviewerId",
        model: "Contacts",
        select: "firstName lastName email phone currentRole imageData skills", // customize fields
      });
    // v1.0.0 ------------------------------------------------------------------------>
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
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
    res.status(200).json({
      message: "Request and interview updated successfully",
      data: request,
    });
  } catch (error) {
    console.error("Error updating request:", error);
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
      const mockRound = await mongoose.model("MockInterviewRound").findById(request.roundId)
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
      const interviewRound = await mongoose.model("InterviewRounds").findById(request.roundId)
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
      const contact = await mongoose.model("Contacts").findById(request.contactId)
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
      const candidate = await mongoose.model("Candidate").findById(request.candidateId)
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
    const position = await mongoose.model("Position").findById(request.positionId)
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
      requests = await InterviewRequest.find({ interviewerId: interviewerObjectId }).lean();
    } else {
      // Default: use ownerId logic
      if (!ownerId) {
        return res.status(400).json({ message: "ownerId is required" });
      }

      console.log(`ownerId: ${ownerId}`);

      // Find all contacts where ownerId matches
      const contacts = await mongoose.model("Contacts").find({ ownerId }).lean();

      if (!contacts || contacts.length === 0) {
        console.log("No contacts found for ownerId:", ownerId);
        return res.status(404).json({ message: "No contacts found for this ownerId" });
      }

      console.log(`Found ${contacts.length} contacts for ownerId:`, ownerId);

      // Get all contact IDs for the query
      console.log("contacts:", contacts);
      const contactIds = contacts.map((contact) => contact._id);
      console.log("contactIds:", contactIds);

      // Find interview requests where interviewerId matches any of the contact IDs
      const query = { interviewerId: { $in: contactIds } };
      console.log("Querying interview requests with:", JSON.stringify(query, null, 2));

      requests = await InterviewRequest.find(query).lean();

      console.log(`Found ${requests.length} matching interview requests`);
    }

    // Format all requests using the shared function
    const formattedRequests = await Promise.all(requests.map(formatInterviewRequest));

    console.log(`Sending ${formattedRequests.length} formatted requests to frontend`);

    res.status(200).json(formattedRequests);
  } catch (error) {
    console.error("[getInterviewRequests] Error:", error, error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.acceptInterviewRequest = async (req, res) => {
  try {
    const { requestId, contactId, roundId } = req.body;

    console.log(
      `acceptInterviewRequest called with body: ${JSON.stringify(
        req.body,
        null,
        2
      )}`
    );

    if (!requestId || !contactId || !roundId) {
      console.log("acceptInterviewRequest: One or more required params missing");
      return res
        .status(400)
        .json({ message: "requestId, contactId, and roundId are required" });
    }

    // Get the interview request to check if it's a mock interview
    const request = await InterviewRequest.findById(requestId);
    if (!request) {
      console.log(`acceptInterviewRequest: Interview request not found for requestId ${requestId}`);
      return res.status(404).json({ message: "Interview request not found" });
    }

    console.log(`Interview request isMockInterview: ${request.isMockInterview}`);

    let round;

    // Update based on interview type: MockInterviewRound or InterviewRounds
    if (request.isMockInterview) {
      round = await MockInterviewRound.findById(roundId);
      if (!round) {
        console.log(`acceptInterviewRequest: Mock interview round not found for roundId ${roundId}`);
        return res.status(404).json({ message: "Mock interview round not found" });
      }
    } else {
      round = await InterviewRounds.findById(roundId);
      if (!round) {
        console.log(`acceptInterviewRequest: Interview round not found for roundId ${roundId}`);
        return res.status(404).json({ message: "Interview round not found" });
      }
    }

    console.log(`Found ${request.isMockInterview ? 'mock ' : ''}interview round: ${JSON.stringify(round, null, 2)}`);

    if (!round.interviewers.includes(contactId)) {
      round.interviewers.push(contactId);
      round.status = "Scheduled";
      await round.save();
    } else {
      console.log(`acceptInterviewRequest: Contact ${contactId} already in round ${roundId}`);
    }

    // Update all other interview requests with the same roundId to 'withdrawn' status
    const updateResult = await InterviewRequest.updateMany(
      {
        roundId: roundId,
        _id: { $ne: requestId }, // Don't update the accepted request
        status: { $ne: 'withdrawn' } // Only update if not already withdrawn
      },
      { status: 'withdrawn', updatedAt: new Date() }
    );

    console.log(
      `Updated ${updateResult.modifiedCount} other interview requests to 'withdrawn' status for round ${roundId}`
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
      console.log(`Contact not found for contactId ${contactId}`);
      return res.status(404).json({ message: "Interviewer contact not found" });
    }

    // Validate duration
    const duration = request.duration;
    const durationInMinutes = parseInt(duration?.split(" ")[0], 10);
    if (isNaN(durationInMinutes) || durationInMinutes <= 0) {
      console.log(`Invalid duration for request ${requestId}: ${duration} (parsed: ${durationInMinutes})`);
      return res.status(400).json({
        success: false,
        message: `Invalid duration in interview request. Expected format like "30 minutes".`
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
          console.log("Mock interview not found");
        }
      } catch (error) {
        console.error("Invalid MockInterview ID:", error.message);
      }
      console.log("Mock interview:", mockInterview.currentExperience);

      const expertiseYears = Number(mockInterview.currentExperience);
      if (isNaN(expertiseYears) || expertiseYears < 0) {
        console.log(`Invalid expertiseLevel for contact ${mockInterview.currentExperience}`);
        return res.status(400).json({
          success: false,
          message: `Invalid or missing expertiseLevel for interviewer (${mockInterview}). Must be a non-negative number.`
        });
      }
      if (expertiseYears <= 3) {
        experienceLevel = 'junior';
      } else if (expertiseYears <= 6) {
        experienceLevel = 'mid';
      } else {
        experienceLevel = 'senior';
      }
      rate = contact.rates?.[experienceLevel]?.inr;
      if (typeof rate !== 'number' || rate <= 0) {
        console.log(`Invalid INR rate for contact ${contactId}, level ${experienceLevel}: ${rate}`);
        return res.status(400).json({
          success: false,
          message: `Invalid or missing INR rate for ${experienceLevel} level in contact (${contactId}).`
        });
      }
    } else {
      // Regular interview: Map candidate's CurrentExperience to level
      const candidate = await Candidate.findById(request.candidateId);
      if (!candidate) {
        console.log(`Candidate not found for candidateId ${request.candidateId}`);
        return res.status(404).json({ message: "Candidate not found" });
      }
      const experienceYears = Number(candidate.CurrentExperience);
      if (isNaN(experienceYears) || experienceYears < 0) {
        console.log(`Invalid CurrentExperience for candidate ${request.candidateId}: ${candidate.CurrentExperience}`);
        return res.status(400).json({
          success: false,
          message: `Invalid or missing CurrentExperience for candidate (${request.candidateId}).`
        });
      }
      if (experienceYears <= 3) {
        experienceLevel = 'junior';
      } else if (experienceYears <= 6) {
        experienceLevel = 'mid';
      } else {
        experienceLevel = 'senior';
      }
      rate = contact.rates?.[experienceLevel]?.inr;
      if (typeof rate !== 'number' || rate <= 0) {
        console.log(`Invalid INR rate for contact ${contactId}, level ${experienceLevel}: ${rate}`);
        return res.status(400).json({
          success: false,
          message: `Invalid or missing INR rate for ${experienceLevel} level in contact (${contactId}).`
        });
      }
    }

    console.log(`Selected INR rate for ${experienceLevel} level: ${rate}`);

    // Calculate base amount
    let totalAmount = (rate * durationInMinutes) / 60;
    if (isNaN(totalAmount) || totalAmount <= 0) {
      console.log(`Calculated invalid total amount: ${totalAmount} (rate: ${rate}, minutes: ${durationInMinutes})`);
      return res.status(400).json({
        success: false,
        message: "Failed to calculate interview fee. Please check rate and duration."
      });
    }

    console.log(`Calculated base amount for this request: ${totalAmount}`);

    // Apply discount if it's a mock interview
    let appliedDiscountPercentage = 0;
    let discountAmount = 0;
    if (request.isMockInterview && contact.mock_interview_discount) {
      appliedDiscountPercentage = parseFloat(contact.mock_interview_discount) || 0;
      if (appliedDiscountPercentage > 0 && appliedDiscountPercentage <= 100) {
        discountAmount = (totalAmount * appliedDiscountPercentage) / 100;
        totalAmount -= discountAmount;
        console.log(`Applied mock interview discount of ${appliedDiscountPercentage}%`);
        console.log(`Discount amount: ${discountAmount}`);
      }
    }

    console.log(`Final total amount for this request: ${totalAmount}`);

    // Fetch wallet
    const wallet = await Wallet.findOne({ ownerId: request.ownerId });
    if (!wallet) {
      console.log(`No wallet found for tenant ${request.ownerId}`);
      return res.status(400).json({
        success: false,
        message: "No wallet found for this organization."
      });
    }
    const walletBalance = Number(wallet.balance || 0);

    console.log(`Found wallet balance for tenant ${request.ownerId}: ${walletBalance}`);

    // Check if there is enough balance
    if (walletBalance < totalAmount) {
      console.log(`Insufficient balance in wallet. Wallet balance: ${walletBalance}, Total amount: ${totalAmount}`);
      return res.status(400).json({
        success: false,
        message: "Insufficient balance in wallet to accept this interview request."
      });
    }

    console.log(`Wallet balance is sufficient to accept this request`);

    // Prepare transaction record
    const prevBalance = Number(wallet.balance || 0);
    const prevHoldAmount = Number(wallet.holdAmount || 0);
    const holdID = request?.interviewRequestCode || String(requestId).slice(-10);

    const holdTransaction = {
      type: "hold",
      amount: totalAmount,
      description: `Hold for ${request.isMockInterview ? 'mock ' : ''}interview round ${round?.roundTitle}`,
      relatedInvoiceId: holdID,
      status: "pending",
      metadata: {
        interviewId: String(request.isMockInterview ? round?.mockInterviewId : round?.interviewId || ""),
        roundId: String(roundId),
        requestId: String(requestId),
        interviewerContactId: String(contact._id),
        rate: rate,  // Store selected rate
        experienceLevel: experienceLevel,
        duration: String(duration),
        durationInMinutes: durationInMinutes,
        isMockInterview: Boolean(request.isMockInterview),
        mockInterviewDiscount: request.isMockInterview ? appliedDiscountPercentage : null,
        calculation: {
          formula: request.isMockInterview && appliedDiscountPercentage > 0
            ? "(rate * minutes / 60) - discount"
            : "rate * minutes / 60",
          rate: rate,
          minutes: durationInMinutes,
          discountPercentage: appliedDiscountPercentage
        },
        prevBalance,
        prevHoldAmount,
        newBalance: prevBalance - totalAmount,
        newHoldAmount: prevHoldAmount + totalAmount,
      },
      createdDate: new Date(),
      createdAt: new Date(),
    };

    // Update wallet
    const updatedWallet = await Wallet.findOneAndUpdate(
      { ownerId: request.ownerId },
      {
        $inc: {
          balance: -totalAmount,
          holdAmount: totalAmount,
        },
        $push: { transactions: holdTransaction },
      },
      { new: true, runValidators: true }
    );

    console.log(`Updated wallet: ${JSON.stringify(updatedWallet, null, 2)}`);
    console.log(`Deducted ${totalAmount} from wallet balance. New balance: ${updatedWallet.balance}`);
    console.log(`Added ${totalAmount} to hold amount. New hold amount: ${updatedWallet.holdAmount}`);
    console.log(`Recorded hold transaction in wallet history`);

    // Get the transaction ID from the updated wallet (last transaction)
    const savedTransaction = updatedWallet.transactions[updatedWallet.transactions.length - 1];
    const transactionId = savedTransaction._id ? savedTransaction._id.toString() : null;

    // Update the round with the hold transaction ID
    if (transactionId) {
      if (request.isMockInterview) {
        await MockInterviewRound.findByIdAndUpdate(
          roundId,
          { holdTransactionId: transactionId },
          { new: true }
        );
        console.log(`Updated mock interview round ${roundId} with hold transaction ID: ${transactionId}`);
      } else {
        await InterviewRounds.findByIdAndUpdate(
          roundId,
          { holdTransactionId: transactionId },
          { new: true }
        );
        console.log(`Updated interview round ${roundId} with hold transaction ID: ${transactionId}`);
      }
    }

    // Send emails
    try {
      const emailController = require('./EmailsController/interviewEmailController');
      await emailController.sendInterviewRoundEmails({
        body: {
          interviewId: request.isMockInterview ? round?.mockInterviewId : round?.interviewId,
          roundId: roundId,
          sendEmails: true
        }
      });
      console.log('Interview round emails sent successfully after acceptance');
    } catch (emailError) {
      console.error('Failed to send interview round emails:', emailError);
    }

    return res.status(200).json({
      success: true,
      message: `${request.isMockInterview ? 'Mock i' : 'I'}nterview request accepted; funds held and emails processed`,
      wallet: {
        balance: updatedWallet?.balance,
        holdAmount: updatedWallet?.holdAmount,
      },
      transaction: {
        ...holdTransaction,
        _id: transactionId  // Include the actual transaction ID
      },
      appliedDiscount: request.isMockInterview ? appliedDiscountPercentage : null,
      roundUpdated: true,
      holdTransactionId: transactionId
    });
  } catch (error) {
    console.error("[acceptInterviewRequest] Error:", error);
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
