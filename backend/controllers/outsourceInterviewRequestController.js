const mongoose = require('mongoose');
const OutsourceInterviewRequest = require('../models/OutsourceInterviewRequest.js');
const Interview = require('../models/Interview.js')
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
        interviewerId, // Now passing only one interviewer ID
        candidateId,
        positionId,
        status,
        roundId,
        requestMessage,
        expiryDateTime,
      } = req.body;
      const isInternal = interviewerType === "internal";
  
      const newRequest = new OutsourceInterviewRequest({
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
        const requests = await OutsourceInterviewRequest.find()
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
        const request = await OutsourceInterviewRequest.findById(id);
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