const mongoose = require('mongoose');
const Interview = require('../models/Interview.js')
const InterviewRequest = require('../models/InterviewRequest');
const Contacts = require('../models/Contacts');
const InterviewRounds = require('../models/InterviewRounds');

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
  
      const newRequest = new InterviewRequest({
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
      res.status(201).json({ message: "Interview request created successfully", data: newRequest });
    } catch (error) {
      console.error("Error creating interview request:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };

exports.getAllRequests = async (req, res) => {
    try {
        const requests = await InterviewRequest.find()
            .populate({
                path: 'positionId',
                model: 'Position',
                select: 'title',
                match: (doc) => mongoose.Types.ObjectId.isValid(doc.positionId) ? {} : null,
            })
            .populate({
                path: 'candidateId',
                model: 'Candidate',
                select: 'skills'
            });
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
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
            return res.status(404).json({ message: 'Interview request not found' });
        }
        let isAccepted = false;
        request.interviewerIds = request.interviewerIds.map(interviewer => {
            const updatedInterviewer = interviewerIds.find(i => String(i.id) === String(interviewer.id));
            if (updatedInterviewer) {
                interviewer.status = updatedInterviewer.status;
                if (updatedInterviewer.status === "accepted") {
                    isAccepted = true;
                }
            }
            return interviewer;
        });
        if (isAccepted) {
            request.interviewerIds = request.interviewerIds.map(interviewer => ({
                ...interviewer,
                status: interviewer.status === "accepted" ? "accepted" : "cancelled"
            }));
            const interview = await Interview.findById(request.scheduledInterviewId);
            if (interview) {
                interview.Status = "Scheduled";
                interview.rounds = interview.rounds.map(round => ({
                    ...round,
                    Status: "scheduled" 
                }));
                await interview.save();
            } else {
                return res.status(404).json({ message: 'Interview not found for the scheduledInterviewId' });
            }
        }
        await request.save();
        res.status(200).json({ message: 'Request and interview updated successfully', data: request });
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


exports.getInterviewRequests = async (req, res) => {
  try {
    const { ownerId } = req.query;

    if (!ownerId) {
      return res.status(400).json({ message: 'ownerId is required' });
    }

    // Find the contact where ownerId matches
    const contact = await Contacts.findOne({ ownerId });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found for this ownerId' });
    }

    const contactId = contact._id;

    // Find interview requests where interviewerId matches the contactId
    const requests = await InterviewRequest.find({ interviewerId: contactId })
      .populate('candidateId', 'firstName lastName') // Assuming Candidate has these fields
      .populate('positionId', 'title') // Assuming Position has a title field
      .populate('tenantId', 'name') // Assuming Organization has a name field
      .populate('roundId', 'roundTitle interviewType duration dateTime'); // Populate round details

    const formattedRequests = requests.map((request) => ({
      id: request._id,
      candidate: request.candidateId
        ? `${request.candidateId.firstName} ${request.candidateId.lastName}`
        : 'Unknown Candidate',
      position: request.positionId ? request.positionId.title : 'Unknown Position',
      company: request.tenantId ? request.tenantId.name : 'Unknown Company',
      type: request.roundId ? request.roundId.interviewType : 'Unknown Type',
      status: request.status,
      requestedDate: request.requestedAt.toISOString().split('T')[0],
      urgency: request.expiryDateTime
        ? new Date(request.expiryDateTime) < new Date()
          ? 'High'
          : 'Medium'
        : 'Low',
      roundId: request.roundId ? request.roundId._id : null,
      roundDetails: request.roundId
        ? {
            roundTitle: request.roundId.roundTitle,
            interviewType: request.roundId.interviewType,
            duration: request.roundId.duration,
            dateTime: request.roundId.dateTime,
          }
        : {},
    }));

    res.status(200).json(formattedRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.acceptInterviewRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { requestId, contactId, roundId } = req.body;

    if (!requestId || !contactId || !roundId) {
      return res.status(400).json({ message: 'requestId, contactId, and roundId are required' });
    }

    // Update InterviewRounds: Add contactId to interviewers array
    const round = await InterviewRounds.findById(roundId).session(session);
    if (!round) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Interview round not found' });
    }

    if (!round.interviewers.includes(contactId)) {
      round.interviewers.push(contactId);
      round.status = 'scheduled'; // Update status to scheduled
      await round.save({ session });
    }

    // Delete the interview request for this round
    await InterviewRequest.deleteOne({ _id: requestId, roundId }).session(session);

    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ message: 'Interview request accepted and deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};