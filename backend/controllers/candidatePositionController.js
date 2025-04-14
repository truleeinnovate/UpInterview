const CandidatePosition = require('../models/CandidatePosition.js');

const getAllCandidatePositions = async (req, res) => {
    try {
        const candidatePositions = await CandidatePosition.find()
            .populate('candidateId')
            .populate('positionId')
            .populate('interviewId');
        res.status(200).json(candidatePositions);
    } catch (error) {
        console.error("Error fetching candidate positions:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const createCandidatePosition = async (req, res) => {
    try {
        const candidatePosition = new CandidatePosition(req.body);
        await candidatePosition.save();
        res.status(201).json(candidatePosition);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createCandidatePosition, getAllCandidatePositions };