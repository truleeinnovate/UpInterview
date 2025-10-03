const { Interview } = require('../models/Interview/Interview');
const { InterviewRounds } = require('../models/Interview/InterviewRounds');
const { createInterviewStatusUpdateNotification } = require('../controllers/PushNotificationControllers/pushNotificationInterviewController');
const cron = require('node-cron');

// Terminal statuses that a round can be in
const TERMINAL_STATUSES = ['Draft', 'Completed', 'Cancelled', 'Selected', 'Rejected'];

/**
 * Updates an interview status based on its rounds or forces a status update
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateInterviewStatus = async (req, res) => {
    try {
        const { interviewId, status } = req.params;
        const { reason } = req.body;

        // Validate status
        if (!['Completed', 'Cancelled', 'Rejected', 'Selected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: Completed, Cancelled, Rejected, Selected'
            });
        }

        // Find and update the interview
        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({
                success: false,
                message: 'Interview not found'
            });
        }

        // Update the interview status and reason if provided
        interview.status = status;
        if (reason) {
            interview.completionReason = reason;
        }

        // Save the updated interview
        const updatedInterview = await interview.save();

        // Create notification if status changed
        try {
            await createInterviewStatusUpdateNotification(updatedInterview, interview.status, status);
        } catch (notificationError) {
            console.error('[INTERVIEW] Error creating status update notification:', notificationError);
            // Continue execution even if notification fails
        }

        res.status(200).json({
            success: true,
            data: updatedInterview
        });
    } catch (error) {
        console.error('Error updating interview status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating interview status',
            error: error.message
        });
    }
};

/**
 * Processes all interviews to update their status based on rounds
 * @returns {Promise<Object>} Summary of the operation
 */
const processCompletedInterviews = async () => {
  try {
    console.log('Starting interview status update process...');

    // Find all interviews that are not in a terminal state
    const interviews = await Interview.find({
      status: { $nin: ['Completed', 'Cancelled', 'Rejected', 'Selected'] }
    });

    console.log(`Found ${interviews.length} interviews to process`);

    const results = {
      total: interviews.length,
      updated: 0,
      errors: 0,
      details: []
    };

    // Process each interview
    for (const interview of interviews) {
      try {
        const updatedInterview = await updateInterviewStatus(interview._id);

        if (updatedInterview) {
          results.updated++;
          results.details.push({
            interviewId: interview._id,
            oldStatus: interview.status,
            newStatus: updatedInterview.status,
            success: true
          });
        } else {
          results.details.push({
            interviewId: interview._id,
            status: interview.status,
            message: 'No update needed - rounds not in terminal state',
            success: false
          });
        }
      } catch (error) {
        console.error(`Error processing interview ${interview._id}:`, error);
        results.errors++;
        results.details.push({
          interviewId: interview._id,
          error: error.message,
          success: false
        });
      }
    }

    console.log('Interview status update process completed:', results);
    return results;
  } catch (error) {
    console.error('Error in processCompletedInterviews:', error);
    throw error;
  }
};

/**
 * Set up cron job to run twice a day (at 2 AM and 2 PM)
 */
const setupInterviewStatusCronJob = () => {
  // Run at 2 AM and 2 PM every day
  cron.schedule('0 2,14 * * *', async () => {
    console.log('Running scheduled interview status update...');
    try {
      const result = await processCompletedInterviews();
      console.log('Scheduled interview status update completed:', result);
    } catch (error) {
      console.error('Error in scheduled interview status update:', error);
    }
  }, {
    timezone: 'Asia/Kolkata' // Adjust timezone as needed
  });

  console.log('Interview status cron job scheduled to run at 2 AM and 2 PM daily');
};

module.exports = {
  updateInterviewStatus,
  processCompletedInterviews,
  setupInterviewStatusCronJob,
  TERMINAL_STATUSES
};
