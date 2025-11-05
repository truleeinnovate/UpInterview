const cron = require('node-cron');
const mongoose = require('mongoose');
const moment = require('moment');
const PushNotification = require('../../models/PushNotifications');
const { Interview } = require('../../models/Interview/Interview');
const { InterviewRounds } = require('../../models/Interview/InterviewRounds');
const InterviewRequest = require('../../models/InterviewRequest');
const { Candidate } = require('../../models/candidate');
const { Position } = require('../../models/Position/position');
const { Users } = require('../../models/Users');
const { Contacts } = require('../../models/Contacts');

// console.log('[INTERVIEW NOTIFICATIONS] Module loaded at', new Date().toISOString());

// Helper function to get user details
async function getUserDetails(userId) {
  try {
    if (!userId) return null;
    const user = await Contacts.findById(userId).select('firstName lastName email');
    return user;
  } catch (error) {
    console.error('[INTERVIEW NOTIFICATIONS] Error fetching user details:', error);
    return null;
  }
}

// Helper function to get candidate details
async function getCandidateDetails(candidateId) {
  try {
    if (!candidateId) return null;
    const candidate = await Candidate.findById(candidateId).select('FirstName LastName Email');
    return candidate;
  } catch (error) {
    console.error('[INTERVIEW NOTIFICATIONS] Error fetching candidate details:', error);
    return null;
  }
}

// Helper function to get position details
async function getPositionDetails(positionId) {
  try {
    if (!positionId) return null;
    const position = await Position.findById(positionId).select('title companyname');
    return position;
  } catch (error) {
    console.error('[INTERVIEW NOTIFICATIONS] Error fetching position details:', error);
    return null;
  }
}

// Create notification for interview creation
async function createInterviewCreatedNotification(interview) {
  try {
    // console.log('[INTERVIEW NOTIFICATIONS] Creating notification for interview creation:', interview._id);
    // console.log('[INTERVIEW NOTIFICATIONS] Interview data:', {
    //   candidateId: interview.candidateId,
    //   positionId: interview.positionId,
    //   ownerId: interview.ownerId,
    //   tenantId: interview.tenantId
    // });

    const candidate = await getCandidateDetails(interview?.candidateId);
    const position = await getPositionDetails(interview?.positionId);

    // console.log('[INTERVIEW NOTIFICATIONS] Fetched candidate:', candidate ? `${candidate.FirstName} ${candidate.LastName}` : 'NULL');
    // console.log('[INTERVIEW NOTIFICATIONS] Fetched position:', position ? position.title : 'NULL');

    const candidateName = candidate ? `${candidate.FirstName} ${candidate.LastName}` : 'Unknown Candidate';
    const positionTitle = position ? position.title : 'Unknown Position';
    const companyName = position ? position.companyname : 'Unknown Company';

    const notification = new PushNotification({
      ownerId: String(interview.ownerId),
      tenantId: String(interview.tenantId),
      title: 'New Interview Created',
      message: `New interview created for ${candidateName} - ${positionTitle} at ${companyName} (ID: ${interview.interviewCode || interview._id})`,
      type: 'system',
      category: 'interview_created',
      unread: true,
      metadata: {
        interviewId: String(interview._id),
        interviewCode: interview.interviewCode,
        candidateId: String(interview.candidateId),
        positionId: String(interview.positionId),
        status: interview.status
      }
    });

    await notification.save();
    // console.log('[INTERVIEW NOTIFICATIONS] ✅ Interview creation notification saved:', notification._id);

    // Also notify the candidate if they have an account
    if (candidate && candidate.Email) {
      const candidateUser = await Users.findOne({ email: candidate.Email });
      if (candidateUser) {
        const candidateNotification = new PushNotification({
          ownerId: String(candidateUser._id),
          tenantId: String(interview.tenantId),
          title: 'Interview Scheduled',
          message: `You have been scheduled for an interview for ${positionTitle} at ${companyName}`,
          type: 'system',
          category: 'interview_scheduled',
          unread: true,
          metadata: {
            interviewId: String(interview._id),
            interviewCode: interview.interviewCode,
            positionId: String(interview.positionId)
          }
        });
        await candidateNotification.save();
        // console.log('[INTERVIEW NOTIFICATIONS] ✅ Candidate notification saved:', candidateNotification._id);
      }
    }

  } catch (error) {
    console.error('[INTERVIEW NOTIFICATIONS] Error creating interview creation notification:', error);
  }
}

// Create notification for interview round scheduling
async function createInterviewRoundScheduledNotification(round) {
  try {
    // console.log('[INTERVIEW NOTIFICATIONS] Creating notification for interview round scheduling:', round._id);
    // console.log('[INTERVIEW NOTIFICATIONS] Round data:', {
    //   interviewId: round.interviewId,
    //   sequence: round.sequence,
    //   interviewers: round.interviewers,
    //   dateTime: round.dateTime,
    //   roundTitle: round.roundTitle
    // });

    const interview = await Interview.findById(round.interviewId);
    if (!interview) {
      console.error('[INTERVIEW NOTIFICATIONS] Interview not found for round:', round.interviewId);
      return;
    }

    const candidate = await getCandidateDetails(interview.candidateId);
    const position = await getPositionDetails(interview.positionId);

    // Handle multiple interviewers (it's an array)
    let interviewerNames = 'Unknown Interviewer';
    if (round.interviewers && round.interviewers.length > 0) {
      const interviewerPromises = round.interviewers.map(id => getUserDetails(id));
      const interviewers = await Promise.all(interviewerPromises);
      const names = interviewers
        .filter(i => i)
        .map(i => `${i.firstName} ${i.lastName}`);
      if (names.length > 0) {
        interviewerNames = names.join(', ');
      }
    }

    const candidateName = candidate ? `${candidate.FirstName} ${candidate.LastName}` : 'Unknown Candidate';
    const positionTitle = position ? position.title : 'Unknown Position';
    const scheduledDate = round?.dateTime ? round?.dateTime : 'Invalid Date';

    // Notify interview owner
    const ownerNotification = new PushNotification({
      ownerId: String(interview.ownerId),
      tenantId: String(interview.tenantId),
      title: 'Interview Round Scheduled',
      message: `Round ${round.sequence || 'undefined'} scheduled for ${candidateName} - ${positionTitle} on ${scheduledDate}`,
      type: 'system',
      category: 'interview_round_scheduled',
      unread: true,
      metadata: {
        interviewId: String(interview._id),
        roundId: String(round._id),
        roundNumber: round.sequence,
        interviewers: round.interviewers ? round.interviewers.map(id => String(id)) : [],
        scheduledDate: round?.dateTime
      }
    });
    await ownerNotification.save();

    // Notify interviewers (multiple)
    if (round.interviewers && round.interviewers.length > 0) {
      for (const interviewerId of round.interviewers) {
        const interviewerNotification = new PushNotification({
          ownerId: String(interviewerId),
          tenantId: String(interview.tenantId),
          title: 'Interview Assignment',
          message: `You have been assigned to interview ${candidateName} for ${positionTitle} on ${scheduledDate}`,
          type: 'system',
          category: 'interview_assigned',
          unread: true,
          metadata: {
            interviewId: String(interview._id),
            roundId: String(round._id),
            roundNumber: round.sequence,
            scheduledDate: round?.dateTime,
            candidateId: String(interview.candidateId)
          }
        });
        await interviewerNotification.save();
      }
    }

    // console.log('[INTERVIEW NOTIFICATIONS] ✅ Interview round scheduling notifications saved');

  } catch (error) {
    console.error('[INTERVIEW NOTIFICATIONS] Error creating round scheduling notification:', error);
  }
}

// Create notification for interview status update
async function createInterviewStatusUpdateNotification(interview, oldStatus, newStatus) {
  try {
    // console.log('[INTERVIEW NOTIFICATIONS] Creating notification for interview status update:', interview._id);

    const candidate = await getCandidateDetails(interview.candidateId);
    const position = await getPositionDetails(interview.positionId);

    const candidateName = candidate ? `${candidate.FirstName} ${candidate.LastName}` : 'Unknown Candidate';
    const positionTitle = position ? position.title : 'Unknown Position';

    let title = 'Interview Status Updated';
    let message = `Interview status for ${candidateName} - ${positionTitle} changed from ${oldStatus} to ${newStatus}`;

    // Customize message based on status
    if (newStatus === 'completed') {
      title = 'Interview Completed';
      message = `Interview for ${candidateName} - ${positionTitle} has been completed`;
    } else if (newStatus === 'cancelled') {
      title = 'Interview Cancelled';
      message = `Interview for ${candidateName} - ${positionTitle} has been cancelled`;
    } else if (newStatus === 'inprogress') {
      title = 'Interview In Progress';
      message = `Interview for ${candidateName} - ${positionTitle} is now in progress`;
    }

    const notification = new PushNotification({
      ownerId: String(interview.ownerId),
      tenantId: String(interview.tenantId),
      title,
      message,
      type: 'system',
      category: 'interview_status_update',
      unread: true,
      metadata: {
        interviewId: String(interview._id),
        interviewCode: interview.interviewCode,
        oldStatus,
        newStatus,
        candidateId: String(interview.candidateId),
        positionId: String(interview.positionId)
      }
    });

    await notification.save();
    // console.log('[INTERVIEW NOTIFICATIONS] ✅ Interview status update notification saved:', notification._id);

  } catch (error) {
    console.error('[INTERVIEW NOTIFICATIONS] Error creating status update notification:', error);
  }
}

// Create notification for interview request
async function createInterviewRequestNotification(request) {
  try {
    // console.log('[INTERVIEW NOTIFICATIONS] Creating notification for interview request:', request._id);

    const position = await getPositionDetails(request.positionId);
    const requester = await getUserDetails(request.createdBy);

    const positionTitle = position ? position.title : 'Unknown Position';
    const companyName = position ? position.companyname : 'Unknown Company';
    const requesterName = requester ? `${requester.firstName} ${requester.lastName}` : 'Unknown Requester';

    // Notify the interviewer/contact
    if (request.contactId) {
      const notification = new PushNotification({
        ownerId: String(request.contactId),
        tenantId: String(request.tenantId),
        title: 'New Interview Request',
        message: `You have received an interview request from ${requesterName} for ${positionTitle} at ${companyName}`,
        type: 'system',
        category: 'interview_request',
        unread: true,
        metadata: {
          requestId: String(request._id),
          requestCode: request.interviewRequestCode,
          positionId: String(request.positionId),
          requesterId: String(request.createdBy),
          hourlyRate: request.hourlyRate,
          duration: request.duration
        }
      });

      await notification.save();
    //   console.log('[INTERVIEW NOTIFICATIONS] ✅ Interview request notification saved:', notification._id);
    }

  } catch (error) {
    console.error('[INTERVIEW NOTIFICATIONS] Error creating interview request notification:', error);
  }
}

// Cron job for interview reminders (runs every hour)
const runInterviewReminderJob = async () => {
  if (mongoose.connection.readyState !== 1) {
    // console.warn('[INTERVIEW REMINDERS] Skipping: MongoDB not connected');
    return;
  }

//   console.log('[INTERVIEW REMINDERS] Running reminder job at', new Date().toISOString());

  try {
    const now = moment();
    const tomorrow = moment().add(24, 'hours');
    const oneHourFromNow = moment().add(1, 'hour');

    // Find interview rounds scheduled in the next 24 hours
    const upcomingRounds = await InterviewRounds.find({
      scheduledDate: {
        $gte: now.toDate(),
        $lte: tomorrow.toDate()
      },
      status: { $nin: ['completed', 'cancelled'] }
    });

    // console.log(`[INTERVIEW REMINDERS] Found ${upcomingRounds.length} upcoming interview rounds`);

    for (const round of upcomingRounds) {
      const interview = await Interview.findById(round.interviewId);
      if (!interview) continue;

      const candidate = await getCandidateDetails(interview.candidateId);
      const position = await getPositionDetails(interview.positionId);
      // Handle multiple interviewers (it's an array)
    let interviewerNames = 'Unknown Interviewer';
    if (round.interviewers && round.interviewers.length > 0) {
      const interviewerPromises = round.interviewers.map(id => getUserDetails(id));
      const interviewers = await Promise.all(interviewerPromises);
      const names = interviewers
        .filter(i => i)
        .map(i => `${i.firstName} ${i.lastName}`);
      if (names.length > 0) {
        interviewerNames = names.join(', ');
      }
    }

      const candidateName = candidate ? `${candidate.FirstName} ${candidate.LastName}` : 'Unknown Candidate';
      const positionTitle = position ? position.title : 'Unknown Position';
      
      // Parse the dateTime format: "15-10-2025 05:08 PM - 06:08 PM"
      // Extract the start date and time (before the dash)
      let scheduledTime;
      let hoursUntil;
      
      try {
        // Split by ' - ' to get start time
        const dateTimeParts = round.dateTime.split(' - ');
        if (dateTimeParts.length > 0) {
          const startDateTime = dateTimeParts[0]; // "15-10-2025 05:08 PM"
          // Parse with the correct format
          scheduledTime = moment(startDateTime, 'DD-MM-YYYY hh:mm A');
          
          if (!scheduledTime.isValid()) {
            console.log(`[Interview Reminder] Invalid date format for round ${round._id}: ${round.dateTime}`);
            continue; // Skip this round if date is invalid
          }
          
          hoursUntil = scheduledTime.diff(now, 'hours');
        } else {
          console.log(`[Interview Reminder] Cannot parse dateTime for round ${round._id}: ${round.dateTime}`);
          continue; // Skip this round
        }
      } catch (error) {
        console.log(`[Interview Reminder] Error parsing dateTime for round ${round._id}:`, error.message);
        continue; // Skip this round
      }

      // Check if we've already sent a reminder for this round
      const reminderIdentifier = `round_${round._id}_${hoursUntil}h`;
      const existingReminder = await PushNotification.findOne({
        'metadata.reminderIdentifier': reminderIdentifier
      });

      if (!existingReminder) {
        let title, message;

        if (hoursUntil <= 1) {
          title = 'Interview Starting Soon';
          message = `Your interview with ${candidateName} for ${positionTitle} starts in less than 1 hour`;
        } else if (hoursUntil <= 24) {
          title = 'Interview Reminder';
          message = `You have an interview with ${candidateName} for ${positionTitle} scheduled for ${scheduledTime.format('MMMM Do, h:mm A')} (in ${hoursUntil} hours)`;
        }

        // Notify interviewer
        if (round.interviewers && round.interviewers.length > 0) {
          for (const interviewerId of round.interviewers) {
          const interviewerNotification = new PushNotification({
            ownerId: String(interviewerId),
            tenantId: String(interview.tenantId),
            title,
            message,
            type: 'system',
            category: 'interview_reminder',
            unread: true,
            metadata: {
              interviewId: String(interview._id),
              roundId: String(round._id),
              scheduledDate: round.scheduledDate,
              reminderIdentifier,
              hoursUntil
            }
          });
          await interviewerNotification.save();
          }
        }

        // Also notify the interview owner
        const ownerNotification = new PushNotification({
          ownerId: String(interview.ownerId),
          tenantId: String(interview.tenantId),
          title: 'Interview Reminder',
          message: `Interview round ${round.sequence} for ${candidateName} - ${positionTitle} is scheduled for ${scheduledTime.format('MMMM Do, h:mm A')}`,
          type: 'system',
          category: 'interview_reminder',
          unread: true,
          metadata: {
            interviewId: String(interview._id),
            roundId: String(round._id),
            scheduledDate: round.dateTime,
            reminderIdentifier,
            hoursUntil
          }
        });
        await ownerNotification.save();

        // console.log(`[INTERVIEW REMINDERS] ✅ Sent reminder for round ${round._id} (${hoursUntil} hours until interview)`);
      }
    }

    // console.log('[INTERVIEW REMINDERS] Job completed successfully');

  } catch (error) {
    console.error('[INTERVIEW REMINDERS] Job Error:', error);
  }
};

// Schedule the cron job (runs every hour at minute 0)
let cronTask;
function scheduleInterviewReminderCron() {
  if (cronTask) return;

  cronTask = cron.schedule('0 * * * *', async () => {
    try {
      await runInterviewReminderJob();
    } catch (err) {
      console.error('[INTERVIEW REMINDERS] Cron job error:', err);
    }
  });

//   console.log('[INTERVIEW REMINDERS] ⚡ Cron job scheduled to run every hour');
}

// Start the cron job when MongoDB is connected
if (mongoose.connection.readyState === 1) {
  scheduleInterviewReminderCron();
  // Run once immediately
  runInterviewReminderJob().catch(err => console.error('[INTERVIEW REMINDERS] Initial run error:', err));
} else {
  mongoose.connection.once('connected', () => {
    scheduleInterviewReminderCron();
    // console.log('[INTERVIEW REMINDERS] 🚀 MongoDB connected, running initial check...');
    runInterviewReminderJob().catch(err => console.error('[INTERVIEW REMINDERS] Initial run error:', err));
  });
}

// Export functions for use in controllers
module.exports = {
  createInterviewCreatedNotification,
  createInterviewRoundScheduledNotification,
  createInterviewStatusUpdateNotification,
  createInterviewRequestNotification,
  runInterviewReminderJob
};
