const { InterviewRounds } = require('../models/Interview/InterviewRounds');

const getAllInterviewRounds = async (req, res) => {
  try {
    const rounds = await InterviewRounds.find()
      .populate({
        path: 'interviewId',
        populate: [
          { path: 'candidateId', model: 'Candidate' },
          { path: 'positionId', model: 'Position' }
        ]
      });
    res.status(200).json(rounds);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching interview rounds', error: error.message });
  }
};

module.exports = { getAllInterviewRounds };