const mongoose = require('mongoose')
const AssessmentQuestions = require('../models/AssessmentQuestions')

exports.getByAssessmentQuestionsId = async (req, res) => {
    try {
        // Validate if id is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid question ID format' 
            });
        }

        const assessmentQuestion = await AssessmentQuestions.findById(req.params.id);
        
        if (!assessmentQuestion) {
            return res.status(404).json({ 
                success: false,
                message: 'Assessment question not found' 
            });
        }

        res.status(200).json({
            success: true,
            data: assessmentQuestion
        });
    } catch (error) {
        console.error('Error in getByAssessmentQuestionsId:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
}