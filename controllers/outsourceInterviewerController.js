// controllers/outsourceInterviewerController.js

const OutsourceInterviewer = require('../models/OutsourceInterviewersSchema');

exports.getAllInterviewers = async (req, res) => {
    try {
        const interviewers = await OutsourceInterviewer.find()
            .populate({
                path: 'contactId',
                populate: {
                    path: 'availability',
                    model: 'Interviewavailability'
                }
            });

        res.status(200).json(interviewers);
    } catch (error) {
        console.error('❌ Detailed error:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        res.status(500).json({
            success: false,
            message: 'Error fetching outsource interviewers',
            error: error.message
        });
    }
};

exports.updateInterviewerFeedback = async (req, res) => {
    try {
        const { contactId, givenBy, status, rating, comments } = req.body;

        if (!contactId) {
            return res.status(400).json({ success: false, message: "Contact ID is required" });
        }

        // Find and update the interviewer based on contactId
        const updatedInterviewer = await OutsourceInterviewer.findOneAndUpdate(
            { contactId: contactId },
            {
                $set: { 
                    status: status,
                    updatedAt: new Date(),
                    feedback: {
                        givenBy: givenBy || null,
                        rating: rating,
                        comments: comments,
                        createdAt: new Date(),
                    }
                }
            },
            { new: true }
        );

        if (!updatedInterviewer) {
            return res.status(404).json({ success: false, message: "Interviewer not found" });
        }

        res.status(200).json({
            success: true,
            message: "Feedback updated successfully",
            data: updatedInterviewer
        });

    } catch (error) {
        console.error("❌ Error updating interviewer feedback:", error);
        res.status(500).json({
            success: false,
            message: "Server error while updating feedback",
            error: error.message
        });
    }
};