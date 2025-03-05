const Interview = require('../models/Interview');

const createInterview = async (req, res) => {
    try {
        const interviewData = req.body;
        const newInterview = new Interview(interviewData);
        const savedInterview = await newInterview.save();
        res.status(201).json(savedInterview);
    } catch (error) {
        console.error("Error saving interview:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// const getAllInterviews = async (req, res) => {
//     try {
//         const interviews = await Interview.find().sort({ createdOn: -1 });
//         res.json(interviews);
//     } catch (error) {
//         console.error('Error fetching interviews:', error);
//         res.status(500).json({ message: 'Error fetching interviews', error });
//     }
// };

const getAllInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find()
            .populate({
                path: 'PositionId',
                model: 'Position'
            })
            .sort({ createdOn: -1 });

        res.json(interviews);
    } catch (error) {
        console.error('Error fetching interviews:', error);
        res.status(500).json({ message: 'Error fetching interviews', error });
    }
};

const updateInterview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rounds, LastModifiedById } = req.body;

        const existingInterview = await Interview.findById(id);
        if (!existingInterview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        existingInterview.rounds = rounds.map(round => ({
            ...round,
            interviewers: round.interviewers?.map(member => ({
                id: member.id,
                name: member.name
            })),
            questions: round.questions?.map(question => ({
                questionId: question.questionId
            }))
        }));

        existingInterview.LastModifiedById = LastModifiedById;

        // Save the updated interview document in the database
        const updatedInterview = await Interview.findByIdAndUpdate(
            id,
            { rounds: existingInterview.rounds, LastModifiedById },
            { new: true }
        );

        res.status(200).json(updatedInterview);
    } catch (error) {
        console.error("Error updating interview:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateInterviewReschedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, roundIndex, dateTime, duration, LastModifiedById } = req.body;

        const existingInterview = await Interview.findById(id);
        if (!existingInterview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        // ✅ Update the main status outside of rounds
        if (status) {
            existingInterview.Status = status;
        }

        if (LastModifiedById) {
            existingInterview.LastModifiedById = LastModifiedById;
        }

        // ✅ Update the round data (dateTime & duration) for the specific round index
        if (roundIndex !== undefined && existingInterview.rounds[roundIndex]) {
            existingInterview.rounds[roundIndex].dateTime = dateTime;
            existingInterview.rounds[roundIndex].duration = duration;
        } else {
            return res.status(400).json({ message: "Invalid round index" });
        }

        // ✅ Save the updated interview document
        const updatedInterview = await existingInterview.save();
        res.status(200).json(updatedInterview);
    } catch (error) {
        console.error("Error updating interview:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateInterviewCancel = async (req, res) => {
    try {
        const { id, roundIndex } = req.params;
        const { status } = req.body;

        const interview = await Interview.findById(id);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        // Ensure round index is valid
        const roundIdx = parseInt(roundIndex); // Convert string to number
        if (isNaN(roundIdx) || roundIdx < 0 || roundIdx >= interview.rounds.length) {
            return res.status(400).json({ message: "Invalid round index" });
        }

        // ✅ Update only the selected round's status
        interview.Status = status;

        await interview.save();

        res.status(200).json({ message: "Round status updated", interview });
    } catch (error) {
        console.error("Error updating round status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


module.exports = { createInterview, getAllInterviews, updateInterview, updateInterviewReschedule, updateInterviewCancel };
