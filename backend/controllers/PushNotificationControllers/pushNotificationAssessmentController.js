const cron = require('node-cron');
const mongoose = require('mongoose');
const moment = require('moment');
const PushNotification = require('../../models/PushNotifications');
const Assessment = require('../../models/Assessment/assessmentsSchema');
const ScheduledAssessment = require('../../models/Assessment/assessmentsSchema');
const { CandidateAssessment } = require('../../models/Assessment/candidateAssessment');
const { Candidate } = require('../../models/candidate');
const { Users } = require('../../models/Users');
const { Position } = require('../../models/Position/position');

// console.log('[ASSESSMENT NOTIFICATIONS] Module loaded at', new Date().toISOString());

// Helper function to get user details
async function getUserDetails(userId) {
  try {
    if (!userId) return null;
    const user = await Users.findById(userId).select('firstName lastName email');
    return user;
  } catch (error) {
    console.error('[ASSESSMENT NOTIFICATIONS] Error fetching user details:', error);
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
    console.error('[ASSESSMENT NOTIFICATIONS] Error fetching candidate details:', error);
    return null;
  }
}

// Create notification for assessment creation
async function createAssessmentCreatedNotification(assessment, createdBy) {
  try {
    // console.log('[ASSESSMENT NOTIFICATIONS] Creating notification for assessment creation:', assessment._id);
    // console.log('[ASSESSMENT NOTIFICATIONS] Assessment data:', {
    //   assessmentId: assessment._id,
    //   ownerId: createdBy || assessment.ownerId,
    //   tenantId: assessment.tenantId || assessment.organizationId,
    //   assessmentTitle: assessment.AssessmentTitle,
    //   assessmentCode: assessment.AssessmentCode
    // });

    const creator = await getUserDetails(createdBy || assessment.ownerId);
    const creatorName = creator ? `${creator.firstName} ${creator.lastName}` : 'System';

    const notification = new PushNotification({
      ownerId: String(createdBy || assessment.ownerId),
      tenantId: String(assessment.tenantId || assessment.organizationId),
      title: 'New Assessment Created',
      message: `New assessment "${assessment.AssessmentTitle || assessment.order || 'Assessment'}" has been created by ${creatorName} (ID: ${assessment.AssessmentCode || assessment.scheduledAssessmentCode || assessment._id})`,
      type: 'system',
      category: 'assessment_created',
      unread: true,
      metadata: {
        assessmentId: String(assessment._id),
        assessmentCode: assessment.AssessmentCode || assessment.scheduledAssessmentCode,
        createdBy: String(createdBy || assessment.ownerId),
        status: assessment.status
      }
    });

    await notification.save();
    // console.log('[ASSESSMENT NOTIFICATIONS] ✅ Assessment creation notification saved:', notification._id);

  } catch (error) {
    console.error('[ASSESSMENT NOTIFICATIONS] Error creating assessment creation notification:', error);
  }
}

// Create notification for assessment scheduling
async function createAssessmentScheduledNotification(scheduledAssessment, candidateIds = []) {
  try {
    // console.log('[ASSESSMENT NOTIFICATIONS] Creating notification for assessment scheduling:', scheduledAssessment._id);
    // console.log('[ASSESSMENT NOTIFICATIONS] Scheduled assessment data:', {
    //   scheduledAssessmentId: scheduledAssessment._id,
    //   assessmentId: scheduledAssessment.assessmentId,
    //   createdBy: scheduledAssessment.createdBy,
    //   organizationId: scheduledAssessment.organizationId,
    //   order: scheduledAssessment.order,
    //   expiryAt: scheduledAssessment.expiryAt
    // });

    const creator = await getUserDetails(scheduledAssessment.createdBy);
    const creatorName = creator ? `${creator.firstName} ${creator.lastName}` : 'System';
    const expiryDate = moment(scheduledAssessment.expiryAt).format('MMMM Do, YYYY, h:mm a');

    // Notify the creator
    const creatorNotification = new PushNotification({
      ownerId: String(scheduledAssessment.createdBy),
      tenantId: String(scheduledAssessment.organizationId),
      title: 'Assessment Scheduled',
      message: `Assessment "${scheduledAssessment.order}" has been scheduled. Expires on ${expiryDate}`,
      type: 'system',
      category: 'assessment_scheduled',
      unread: true,
      metadata: {
        assessmentId: String(scheduledAssessment.assessmentId),
        scheduledAssessmentId: String(scheduledAssessment._id),
        assessmentCode: scheduledAssessment.scheduledAssessmentCode,
        expiryAt: scheduledAssessment.expiryAt,
        proctoringEnabled: scheduledAssessment.proctoringEnabled
      }
    });
    await creatorNotification.save();
    // console.log('[ASSESSMENT NOTIFICATIONS] ✅ Creator notification saved for scheduled assessment:', creatorNotification._id);

    // Notify candidates if provided
    for (const candidateId of candidateIds) {
      const candidate = await getCandidateDetails(candidateId);
      if (candidate && candidate.Email) {
        // Check if candidate has a user account
        const candidateUser = await Users.findOne({ email: candidate.Email });
        if (candidateUser) {
          const candidateNotification = new PushNotification({
            ownerId: String(candidateUser._id),
            tenantId: String(scheduledAssessment.organizationId),
            title: 'Assessment Assigned',
            message: `You have been assigned an assessment. Please complete it before ${expiryDate}`,
            type: 'system',
            category: 'assessment_assigned',
            unread: true,
            metadata: {
              assessmentId: String(scheduledAssessment.assessmentId),
              scheduledAssessmentId: String(scheduledAssessment._id),
              expiryAt: scheduledAssessment.expiryAt,
              proctoringEnabled: scheduledAssessment.proctoringEnabled
            }
          });
          await candidateNotification.save();
        }
      }
    }

    // console.log('[ASSESSMENT NOTIFICATIONS] ✅ Assessment scheduling notifications saved');

  } catch (error) {
    console.error('[ASSESSMENT NOTIFICATIONS] Error creating assessment scheduling notification:', error);
  }
}

// Create notification for assessment status update
async function createAssessmentStatusUpdateNotification(assessment, oldStatus, newStatus) {
  try {
    // console.log('[ASSESSMENT NOTIFICATIONS] Creating notification for assessment status update:', assessment._id);

    let title = 'Assessment Status Updated';
    let message = `Assessment "${assessment.order}" status changed from ${oldStatus} to ${newStatus}`;

    // Customize message based on status
    if (newStatus === 'completed') {
      title = 'Assessment Completed';
      message = `Assessment "${assessment.order}" has been completed`;
    } else if (newStatus === 'cancelled') {
      title = 'Assessment Cancelled';
      message = `Assessment "${assessment.order}" has been cancelled`;
    } else if (newStatus === 'expired') {
      title = 'Assessment Expired';
      message = `Assessment "${assessment.order}" has expired`;
    } else if (newStatus === 'failed') {
      title = 'Assessment Failed';
      message = `Assessment "${assessment.order}" has failed`;
    }

    // Double-check for existing notification before creating
    const existingNotification = await PushNotification.findOne({
      $or: [
        {
          'metadata.scheduledAssessmentId': String(assessment._id),
          'metadata.newStatus': newStatus,
          'category': 'assessment_status_update'
        },
        {
          'message': message,
          'category': 'assessment_status_update',
          'ownerId': String(assessment.createdBy)
        }
      ]
    });
    
    if (existingNotification) {
      console.log('[ASSESSMENT NOTIFICATIONS] ⚠️ Notification already exists for assessment:', assessment._id);
      return existingNotification;
    }

    const notification = new PushNotification({
      ownerId: String(assessment.createdBy),
      tenantId: String(assessment.organizationId),
      title,
      message,
      type: 'system',
      category: 'assessment_status_update',
      unread: true,
      metadata: {
        assessmentId: String(assessment.assessmentId),
        scheduledAssessmentId: String(assessment._id),
        assessmentCode: assessment.scheduledAssessmentCode,
        oldStatus,
        newStatus
      }
    });

    await notification.save();

  } catch (error) {
    console.error('[ASSESSMENT NOTIFICATIONS] Error creating status update notification:', error);
  }
}

// Create notification for candidate assessment submission
async function createAssessmentSubmissionNotification(candidateAssessment) {
  try {
    // console.log('[ASSESSMENT NOTIFICATIONS] Creating notification for assessment submission:', candidateAssessment._id);

    const candidate = await getCandidateDetails(candidateAssessment.candidateId);
    const candidateName = candidate ? `${candidate.FirstName} ${candidate.LastName}` : 'Unknown Candidate';

    // Get the scheduled assessment details
    const scheduledAssessment = await ScheduledAssessment.findById(candidateAssessment.scheduledAssessmentId);
    if (!scheduledAssessment) return;

    const score = candidateAssessment.score || 0;
    const totalQuestions = candidateAssessment.totalQuestions || 0;
    const timeTaken = candidateAssessment.timeTaken || 'N/A';

    // Notify the assessment creator/owner
    const notification = new PushNotification({
      ownerId: String(scheduledAssessment.createdBy),
      tenantId: String(scheduledAssessment.organizationId),
      title: 'Assessment Submission',
      message: `${candidateName} has submitted the assessment "${scheduledAssessment.order}". Score: ${score}/${totalQuestions}. Time taken: ${timeTaken}`,
      type: 'system',
      category: 'assessment_submission',
      unread: true,
      metadata: {
        candidateAssessmentId: String(candidateAssessment._id),
        candidateId: String(candidateAssessment.candidateId),
        assessmentId: String(scheduledAssessment.assessmentId),
        scheduledAssessmentId: String(scheduledAssessment._id),
        score,
        totalQuestions,
        timeTaken,
        submittedAt: candidateAssessment.submittedAt
      }
    });

    await notification.save();
    // console.log('[ASSESSMENT NOTIFICATIONS] ✅ Assessment submission notification saved:', notification._id);

    // Also notify the candidate
    if (candidate && candidate.Email) {
      const candidateUser = await Users.findOne({ email: candidate.Email });
      if (candidateUser) {
        const candidateNotification = new PushNotification({
          ownerId: String(candidateUser._id),
          tenantId: String(scheduledAssessment.organizationId),
          title: 'Assessment Submitted',
          message: `Your assessment "${scheduledAssessment.order}" has been successfully submitted. Score: ${score}/${totalQuestions}`,
          type: 'system',
          category: 'assessment_submitted',
          unread: true,
          metadata: {
            candidateAssessmentId: String(candidateAssessment._id),
            assessmentId: String(scheduledAssessment.assessmentId),
            score,
            totalQuestions,
            timeTaken
          }
        });
        await candidateNotification.save();
      }
    }

  } catch (error) {
    console.error('[ASSESSMENT NOTIFICATIONS] Error creating submission notification:', error);
  }
}

// Create notification for assessment expiry warning
async function createAssessmentExpiryWarningNotification(scheduledAssessment, hoursUntilExpiry) {
  try {
    // console.log('[ASSESSMENT NOTIFICATIONS] Creating expiry warning for assessment:', scheduledAssessment._id);

    const expiryDate = moment(scheduledAssessment.expiryAt).format('MMMM Do, YYYY, h:mm a');

    // Get all candidates who haven't completed the assessment
    const incompleteCandidates = await CandidateAssessment.find({
      scheduledAssessmentId: scheduledAssessment._id,
      status: { $nin: ['completed', 'submitted'] }
    });

    for (const candidateAssessment of incompleteCandidates) {
      const candidate = await getCandidateDetails(candidateAssessment.candidateId);
      if (candidate && candidate.Email) {
        const candidateUser = await Users.findOne({ email: candidate.Email });
        if (candidateUser) {
          // Check if we've already sent this warning
          const warningIdentifier = `assessment_${scheduledAssessment._id}_${hoursUntilExpiry}h_warning`;
          const existingWarning = await PushNotification.findOne({
            ownerId: String(candidateUser._id),
            'metadata.warningIdentifier': warningIdentifier
          });

          if (!existingWarning) {
            const notification = new PushNotification({
              ownerId: String(candidateUser._id),
              tenantId: String(scheduledAssessment.organizationId),
              title: 'Assessment Expiry Warning',
              message: `Your assessment "${scheduledAssessment.order}" will expire in ${hoursUntilExpiry} hours (${expiryDate}). Please complete it soon.`,
              type: 'system',
              category: 'assessment_expiry_warning',
              unread: true,
              metadata: {
                assessmentId: String(scheduledAssessment.assessmentId),
                scheduledAssessmentId: String(scheduledAssessment._id),
                expiryAt: scheduledAssessment.expiryAt,
                hoursUntilExpiry,
                warningIdentifier
              }
            });
            await notification.save();
            // console.log(`[ASSESSMENT NOTIFICATIONS] ✅ Expiry warning sent to candidate ${candidate.email}`);
          }
        }
      }
    }

  } catch (error) {
    console.error('[ASSESSMENT NOTIFICATIONS] Error creating expiry warning:', error);
  }
}

// Cron job for assessment reminders and expiry checks (runs every hour)
const runAssessmentReminderJob = async () => {
  if (mongoose.connection.readyState !== 1) {
    console.warn('[ASSESSMENT REMINDERS] Skipping: MongoDB not connected');
    return;
  }

//   console.log('[ASSESSMENT REMINDERS] Running reminder job at', new Date().toISOString());

  try {
    const now = moment();
    const tomorrow = moment().add(24, 'hours');
    const in48Hours = moment().add(48, 'hours');

    // Find assessments expiring in the next 48 hours
    const expiringAssessments = await ScheduledAssessment.find({
      expiryAt: {
        $gte: now.toDate(),
        $lte: in48Hours.toDate()
      },
      status: 'scheduled'
    });

    // console.log(`[ASSESSMENT REMINDERS] Found ${expiringAssessments.length} expiring assessments`);

    for (const assessment of expiringAssessments) {
      const expiryTime = moment(assessment.expiryAt);
      const hoursUntil = Math.ceil(expiryTime.diff(now, 'hours', true));

      // Send warnings at 48, 24, and 2 hours before expiry
      if (hoursUntil === 48 || hoursUntil === 24 || hoursUntil === 2) {
        await createAssessmentExpiryWarningNotification(assessment, hoursUntil);
      }
    }

    // Check for expired assessments and update their status
    // Use findOneAndUpdate to atomically update status to prevent race conditions
    const expiredAssessments = await ScheduledAssessment.find({
      expiryAt: { $lt: now.toDate() },
      status: 'scheduled'  // Only find assessments that are still 'scheduled'
    });
    
    console.log(`[ASSESSMENT REMINDERS] Found ${expiredAssessments.length} expired assessments`);
    console.log(`[ASSESSMENT REMINDERS] Current time: ${now.format()}, checking assessments with expiry < ${now.toDate()}`);
    
    for (const assessment of expiredAssessments) {
      console.log(`[ASSESSMENT REMINDERS] Processing expired assessment: ${assessment._id} (${assessment.order}), current status: ${assessment.status}`);
      
      // FIRST: Atomically update the status to prevent concurrent processing
      // This ensures that even if multiple instances are running, only one will succeed
      const atomicUpdate = await ScheduledAssessment.findOneAndUpdate(
        {
          _id: assessment._id,
          status: 'scheduled'  // Only update if still scheduled
        },
        { 
          status: 'expired',
          $set: { expiredProcessedAt: new Date() }  // Track when we processed this
        },
        { new: true }
      );
      
      // If the atomic update didn't find a document (status already changed), skip
      if (!atomicUpdate) {
        console.log(`[ASSESSMENT REMINDERS] ⚠️ Assessment ${assessment._id} (${assessment.order}) already processed by another instance, skipping`);
        continue;
      }
      
      console.log(`[ASSESSMENT REMINDERS] Successfully updated assessment ${assessment._id} status to: expired`);
      
      // Now check if we've already created a notification for this assessment
      let existingExpiryNotification = await PushNotification.findOne({
        $or: [
          {
            'metadata.scheduledAssessmentId': String(assessment._id),
            'metadata.newStatus': 'expired',
            'category': 'assessment_status_update'
          },
          {
            'message': `Assessment "${assessment.order}" has expired`,
            'category': 'assessment_status_update',
            'ownerId': String(assessment.createdBy)
          }
        ]
      });
      
      console.log(`[ASSESSMENT REMINDERS] Existing notification check for ${assessment._id}: ${existingExpiryNotification ? 'FOUND' : 'NOT FOUND'}`);
      
      if (!existingExpiryNotification) {
        // Create notification for expiry (only once)
        await createAssessmentStatusUpdateNotification(atomicUpdate, 'scheduled', 'expired');
        console.log(`[ASSESSMENT REMINDERS] ✅ Created expiry notification for assessment ${assessment._id} (${assessment.order})`);
      } else {
        console.log(`[ASSESSMENT REMINDERS] ℹ️ Notification already exists for assessment ${assessment._id} (${assessment.order}), skipping notification creation`);
      }
    }

    // console.log('[ASSESSMENT REMINDERS] Job completed successfully');

  } catch (error) {
    console.error('[ASSESSMENT REMINDERS] Job Error:', error);
  }
};

// Schedule the cron job (runs every hour at minute 30)
let cronTask;
function scheduleAssessmentReminderCron() {
  if (cronTask) return;

  cronTask = cron.schedule('30 * * * *', async () => {
    try {
      await runAssessmentReminderJob();
    } catch (err) {
      console.error('[ASSESSMENT REMINDERS] Cron job error:', err);
    }
  });

//   console.log('[ASSESSMENT REMINDERS] ⚡ Cron job scheduled to run every hour at minute 30');
}

// Start the cron job when MongoDB is connected
if (mongoose.connection.readyState === 1) {
  scheduleAssessmentReminderCron();
  // Run once immediately
  runAssessmentReminderJob().catch(err => console.error('[ASSESSMENT REMINDERS] Initial run error:', err));
} else {
  mongoose.connection.once('connected', () => {
    scheduleAssessmentReminderCron();
    // console.log('[ASSESSMENT REMINDERS] 🚀 MongoDB connected, running initial check...');
    // runAssessmentReminderJob().catch(err => console.error('[ASSESSMENT REMINDERS] Initial run error:', err));
  });
}

// Manual test function to check for duplicate notifications
async function checkDuplicateNotifications(assessmentId) {
  try {
    const notifications = await PushNotification.find({
      $or: [
        { 'metadata.scheduledAssessmentId': String(assessmentId) },
        { 'metadata.assessmentId': String(assessmentId) },
        { 
          'message': new RegExp(`Assessment ".*" has expired`),
          'category': 'assessment_status_update'
        }
      ],
      'category': 'assessment_status_update'
    }).sort({ _id: -1 });
    
    console.log(`[ASSESSMENT CHECK] Found ${notifications.length} notifications for assessment ${assessmentId}`);
    notifications.forEach((notif, index) => {
      console.log(`  ${index + 1}. Created at: ${notif.createdAt}, Message: ${notif.message}, HasMetadata: ${!!notif.metadata}`);
    });
    
    return notifications;
  } catch (error) {
    console.error('[ASSESSMENT CHECK] Error checking duplicates:', error);
    return [];
  }
}

// Function to clean up duplicate expired notifications
async function cleanupDuplicateExpiredNotifications() {
  try {
    console.log('[CLEANUP] Starting duplicate expired notification cleanup...');
    
    // Find all expired assessment notifications
    const allExpiredNotifications = await PushNotification.find({
      'category': 'assessment_status_update',
      $or: [
        { 'metadata.newStatus': 'expired' },
        { 'message': new RegExp('has expired$') }
      ]
    }).sort({ _id: 1 });
    
    // Group by assessment (using message as key since metadata might be missing)
    const notificationsByAssessment = {};
    
    allExpiredNotifications.forEach(notif => {
      const key = notif.message || notif.metadata?.scheduledAssessmentId;
      if (!notificationsByAssessment[key]) {
        notificationsByAssessment[key] = [];
      }
      notificationsByAssessment[key].push(notif);
    });
    
    let duplicatesRemoved = 0;
    
    // Keep only the first notification for each assessment, delete the rest
    for (const [key, notifications] of Object.entries(notificationsByAssessment)) {
      if (notifications.length > 1) {
        console.log(`[CLEANUP] Found ${notifications.length} notifications for: ${key}`);
        
        // Keep the first one, delete the rest
        for (let i = 1; i < notifications.length; i++) {
          await PushNotification.deleteOne({ _id: notifications[i]._id });
          duplicatesRemoved++;
          console.log(`[CLEANUP] Removed duplicate notification: ${notifications[i]._id}`);
        }
      }
    }
    
    console.log(`[CLEANUP] ✅ Cleanup complete. Removed ${duplicatesRemoved} duplicate notifications`);
    return duplicatesRemoved;
    
  } catch (error) {
    console.error('[CLEANUP] Error during cleanup:', error);
    return 0;
  }
}

// Export functions for use in controllers
module.exports = {
  createAssessmentCreatedNotification,
  createAssessmentScheduledNotification,
  createAssessmentStatusUpdateNotification,
  createAssessmentSubmissionNotification,
  createAssessmentExpiryWarningNotification,
  runAssessmentReminderJob,
  checkDuplicateNotifications,
  cleanupDuplicateExpiredNotifications
};
