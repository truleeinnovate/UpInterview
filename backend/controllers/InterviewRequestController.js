// v1.0.0 - Ashok - changed createdAt to _id for customRequestId generation
// v1.0.1 - Venkatesh - added wallet functionality deduction and hold amount
// v1.0.2 - Venkatesh -- Prepare a transaction record for wallet history (type: 'hold')

const mongoose = require("mongoose");
const Interview = require("../models/Interview.js");
const InterviewRequest = require("../models/InterviewRequest");
const { Contacts } = require("../models/Contacts");
const { InterviewRounds } = require("../models/InterviewRounds");
const Wallet = require("../models/WalletTopup");

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
      scheduledInterviewId: new mongoose.Types.ObjectId(scheduledInterviewId),
      interviewerType,
      interviewerId: new mongoose.Types.ObjectId(interviewerId), // Save interviewerId instead of an array
      dateTime,
      duration,
      candidateId: new mongoose.Types.ObjectId(candidateId),
      positionId: new mongoose.Types.ObjectId(positionId),
      status: isInternal ? "accepted" : "inprogress",
      roundId: new mongoose.Types.ObjectId(roundId),
      requestMessage,
      expiryDateTime,
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
          Status: "scheduled",
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

exports.getInterviewRequests = async (req, res) => {
  try {
    const { ownerId, interviewerId } = req.query;

    // If interviewerId is provided, fetch requests for that interviewer only
    if (interviewerId) {
      if (!mongoose.Types.ObjectId.isValid(interviewerId)) {
        return res.status(400).json({ message: 'Invalid interviewerId' });
      }
      const interviewerObjectId = new mongoose.Types.ObjectId(interviewerId);
      const requests = await InterviewRequest.find({ interviewerId: interviewerObjectId })
        .populate("candidateId")
        .populate("positionId")
        .populate("tenantId")
        .populate("roundId")
        .populate("interviewerId")
        .lean();
      const formattedRequests = requests.map((request) => ({
        ...request,
        _id: request._id,
        id: request._id,
        positionId: request.positionId || null,
        tenantId: request.tenantId || null,
        roundId: request.roundId || null,
        contactId: request.interviewerId || null,
        status: request.status,
        requestedDate: request.requestedAt
          ? new Date(request.requestedAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        urgency: request.expiryDateTime
          ? new Date(request.expiryDateTime) < new Date()
            ? "High"
            : "Medium"
          : "Low",
        type: request.roundId?.interviewType || "Unknown Type",
        roundId: request.roundId?._id || null,
        roundDetails: request.roundId
          ? {
            roundTitle: request.roundId.roundTitle,
            interviewType: request.roundId.interviewType,
            duration: request.roundId.duration,
            dateTime: request.roundId.dateTime,
          }
          : null,
        originalRequest: {
          dateTime: request.dateTime,
          duration: request.duration,
          status: request.status,
          interviewerType: request.interviewerType,
          expiryDateTime: request.expiryDateTime,
        },
      }));
      return res.status(200).json(formattedRequests);
    }

    // Default: use ownerId logic
    if (!ownerId) {
      return res.status(400).json({ message: "ownerId is required" });
    }

    console.log(`ownerId: ${ownerId}`);

    // Find all contacts where ownerId matches
    const contacts = await Contacts.find({ ownerId });

    if (!contacts || contacts.length === 0) {
      console.log("No contacts found for ownerId:", ownerId);
      return res
        .status(404)
        .json({ message: "No contacts found for this ownerId" });
    }

    console.log(`Found ${contacts.length} contacts for ownerId:`, ownerId);

    // Get all contact IDs for the query
    console.log("contacts:", contacts);
    const contactIds = contacts.map((contact) => contact._id);
    console.log("contactIds:", contactIds);

    // Find interview requests where interviewerId matches any of the contact IDs
    const query = { interviewerId: { $in: contactIds } };
    console.log(
      "Querying interview requests with:",
      JSON.stringify(query, null, 2)
    );

    // Find all matching interview requests and populate all fields from referenced models
    const requests = await InterviewRequest.find(query)
      .populate("candidateId") // Populate all candidate fields
      .populate("positionId") // Populate all position fields
      .populate("tenantId") // Populate all tenant fields
      .populate("roundId") // Populate all round fields
      .populate("interviewerId") // Populate all contact fields
      .lean();

    console.log(`Found ${requests.length} matching interview requests`);

    const formattedRequests = requests.map((request) => {
      // Create a new object with all request fields
      return {
        ...request, // Spread all original request fields
        _id: request._id, // Keep the original _id
        id: request._id, // Also include as id for backward compatibility
        // Include full populated objects
        positionId: request.positionId || null,
        tenantId: request.tenantId || null,
        roundId: request.roundId || null,
        contactId: request.interviewerId || null,
        // Keep existing calculated fields
        status: request.status,
        requestedDate: request.requestedAt
          ? new Date(request.requestedAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        urgency: request.expiryDateTime
          ? new Date(request.expiryDateTime) < new Date()
            ? "High"
            : "Medium"
          : "Low",
        // For backward compatibility, keep these fields
        type: request.roundId?.interviewType || "Unknown Type",
        roundId: request.roundId?._id || null,
        roundDetails: request.roundId
          ? {
            roundTitle: request.roundId.roundTitle,
            interviewType: request.roundId.interviewType,
            duration: request.roundId.duration,
            dateTime: request.roundId.dateTime,
          }
          : null,
        originalRequest: {
          dateTime: request.dateTime,
          duration: request.duration,
          status: request.status,
          interviewerType: request.interviewerType,
          expiryDateTime: request.expiryDateTime,
        },
      };
    });

    console.log(
      `Sending ${formattedRequests.length} formatted requests to frontend`
    );

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
      console.log(
        "acceptInterviewRequest: One or more required params missing"
      );
      return res
        .status(400)
        .json({ message: "requestId, contactId, and roundId are required" });
    }

    // Update InterviewRounds: Add contactId to interviewers array
    const round = await InterviewRounds.findById(roundId);
    if (!round) {
      console.log(
        `acceptInterviewRequest: Interview round not found for roundId ${roundId}`
      );
      return res.status(404).json({ message: "Interview round not found" });
    }

    console.log(`Found interview round: ${JSON.stringify(round, null, 2)}`);

    if (!round.interviewers.includes(contactId)) {
      round.interviewers.push(contactId);
      round.status = "scheduled";
      await round.save();
    } else {
      console.log(
        `acceptInterviewRequest: Contact ${contactId} already in round ${roundId}`
      );
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

    //<-----------v1.0.1-----------------------
    // add hourly rate to the request
    const findHourlyRate = await Contacts.findById(contactId);
    const hourlyRate = findHourlyRate.hourlyRate;

    console.log(`Found hourly rate for contact ${contactId}: ${hourlyRate}`);

    const request = await InterviewRequest.findById(requestId);
    const duration = request.duration;
    const durationInMinutes = parseInt(duration.split(" ")[0]);
    // if hourlyRate is 100$ and duration is 45 minutes, totalAmount is 75$
    const totalAmount = (hourlyRate * durationInMinutes) / 60;
    console.log(`Calculated total amount for this request: ${totalAmount}`);

    const wallet = await Wallet.findOne({ tenantId: request.tenantId });
    if (!wallet) {
      console.log(`No wallet found for tenant ${request.tenantId}`);
      return res.status(400).json({
        success: false,
        message: "No wallet found for this organization."
      });
    }
    console.log(`Found wallet for tenant ${request.tenantId}:`, wallet);
    const walletBalance = wallet.balance || 0;

    console.log(`Found wallet balance for tenant ${request.tenantId}: ${walletBalance}`);

    // Check if there is enough balance in the wallet
    if (walletBalance < totalAmount) {
      console.log(`Insufficient balance in wallet to accept this interview request. Wallet balance: ${walletBalance}, Total amount: ${totalAmount}`);
      return res.status(400).json({
        success: false,
        message: "Insufficient balance in wallet to accept this interview request."
      });
    }

    console.log(`Wallet balance is sufficient to accept this request`);

    // Deduct the total amount from wallet balance
    console.log(`Attempting to deduct ${totalAmount} from wallet balance and add to hold amount`);
    //<-----v1.0.2------
    // Prepare a transaction record for wallet history (type: 'hold')
    const holdTransaction = {
      type: "hold",
      amount: totalAmount,
      description: `Hold for interview round ${round?.roundTitle}`,
      relatedInvoiceId: String((request?._id).slice(10)),
      status: "completed",
      metadata: {
        interviewId: String(round?.interviewId || ""),
        roundId: String(roundId),
        requestId: String(requestId),
        interviewerContactId: String(contactId),
        hourlyRate: Number(hourlyRate),
        duration: String(duration),
        durationInMinutes: Number(durationInMinutes),
        calculation: {
          formula: "hourlyRate * minutes / 60",
          hourlyRate: Number(hourlyRate),
          minutes: Number(durationInMinutes),
        },
        prevBalance: Number(wallet.balance || 0),
        prevHoldAmount: Number(wallet.holdAmount || 0),
        newBalance: Number((wallet.balance || 0) - totalAmount),
        newHoldAmount: Number((wallet.holdAmount || 0) + totalAmount),
      },
      createdDate: new Date(),
      createdAt: new Date(),
    };
    //-----v1.0.2------>
    const updatedWallet = await Wallet.findOneAndUpdate(
      { tenantId: request.tenantId },
      {
        $inc: {
          balance: -totalAmount,
          holdAmount: totalAmount,
        },
        $push: { transactions: holdTransaction },
      },
      { new: true }
    );
    console.log(`Updated wallet found: ${JSON.stringify(updatedWallet, null, 2)}`);

    console.log(`Deducted ${totalAmount} from wallet balance. New balance: ${updatedWallet.balance}`);
    console.log(`Added ${totalAmount} to hold amount. New hold amount: ${updatedWallet.holdAmount}`);
    console.log(`Recorded hold transaction in wallet history`);
    //-----------v1.0.1------------------------------>

    // Send emails after successful acceptance
    try {
      const emailController = require('./EmailsController/interviewEmailController');
      await emailController.sendInterviewRoundEmails({
        body: {
          // interviewId: request.scheduledInterviewId,
          interviewId: round.interviewId,
          roundId: roundId,
          sendEmails: true
        }
      });
      console.log('Interview round emails sent successfully after acceptance');
    } catch (emailError) {
      console.error('Failed to send interview round emails after acceptance:', emailError);
      // Don't fail the request if email sending fails
    }
  
    res.status(200).json({
      message:
        "Interview request accepted and other requests for this round removed",
      deletedCount: deleteResult.deletedCount,
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
