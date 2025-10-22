const { Interview } = require('../models/Interview/Interview');
const { InterviewRounds } = require('../models/Interview/InterviewRounds');
const { createInterviewStatusUpdateNotification } = require('../controllers/PushNotificationControllers/pushNotificationInterviewController');
const cron = require('node-cron');

// Terminal statuses that a round can be in
const TERMINAL_STATUSES = ['Draft', 'Completed', 'Cancelled', 'Selected', 'Rejected'];

/**
 * Core function to update interview status based on its rounds
 * @param {String} interviewId - The interview ID
 * @param {String} forcedStatus - Optional forced status to set
 * @param {String} reason - Optional reason for status change
 * @returns {Promise<Object|null>} Updated interview or null if not found
 */
const updateInterviewStatusCore = async (interviewId, forcedStatus = null, reason = null) => {
    try {
        // Find the interview
        const interview = await Interview.findById(interviewId);
        if (!interview) {
            console.error(`Interview not found: ${interviewId}`);
            return null;
        }

        const oldStatus = interview.status;
        let newStatus = interview.status;

        // If a status is being forced, use that
        if (forcedStatus) {
            newStatus = forcedStatus;
            interview.status = forcedStatus;
            if (reason) {
                interview.completionReason = reason;
            }
        } else {
            // Otherwise, determine status based on rounds
            const rounds = await InterviewRounds.find({ interviewId: interviewId });
            
            if (rounds.length === 0) {
                console.log(`No rounds found for interview ${interviewId}`);
                return interview;
            }

            // Check if all rounds are in terminal state
            const allRoundsTerminal = rounds.every(round => 
                TERMINAL_STATUSES.includes(round.status)
            );

            if (!allRoundsTerminal) {
                console.log(`Not all rounds are in terminal state for interview ${interviewId}`);
                return interview;
            }

            // Determine the new interview status based on rounds
            const hasRejected = rounds.some(round => round.status === 'Rejected');
            const hasCancelled = rounds.some(round => round.status === 'Cancelled');
            const allCompleted = rounds.every(round => 
                round.status === 'Completed' || round.status === 'Selected'
            );
            
            if (hasRejected) {
                newStatus = 'Rejected';
            } else if (hasCancelled) {
                newStatus = 'Cancelled';
            } else if (allCompleted) {
                newStatus = 'Completed';
            }

            // Update interview status if changed
            if (newStatus !== interview.status) {
                interview.status = newStatus;
            } else {
                // No change needed
                return interview;
            }
        }

        // Save the updated interview
        const updatedInterview = await interview.save();

        // Create notification if status changed
        if (oldStatus !== newStatus) {
            try {
                await createInterviewStatusUpdateNotification(updatedInterview, oldStatus, newStatus);
            } catch (notificationError) {
                console.error('[INTERVIEW] Error creating status update notification:', notificationError);
                // Continue execution even if notification fails
            }
        }

        return updatedInterview;
    } catch (error) {
        console.error('Error updating interview status:', error);
        throw error;
    }
};

/**
 * HTTP handler for updating interview status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateInterviewStatus = async (req, res) => {
    try {
        const { interviewId, status } = req.params;
        const { reason } = req.body;

        // Validate status if provided
        if (status && !['Completed', 'Cancelled', 'Rejected', 'Selected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: Completed, Cancelled, Rejected, Selected'
            });
        }

        // Call the core function
        const updatedInterview = await updateInterviewStatusCore(interviewId, status, reason);
        
        if (!updatedInterview) {
            return res.status(404).json({
                success: false,
                message: 'Interview not found'
            });
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
        const oldStatus = interview.status;
        // Use the core function instead of the HTTP handler
        const updatedInterview = await updateInterviewStatusCore(interview._id);

        if (updatedInterview && updatedInterview.status !== oldStatus) {
          results.updated++;
          results.details.push({
            interviewId: interview._id,
            oldStatus: oldStatus,
            newStatus: updatedInterview.status,
            success: true
          });
        } else {
          results.details.push({
            interviewId: interview._id,
            status: interview.status,
            message: 'No update needed - rounds not in terminal state or no status change',
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
  updateInterviewStatusCore,
  processCompletedInterviews,
  setupInterviewStatusCronJob,
  TERMINAL_STATUSES
};
