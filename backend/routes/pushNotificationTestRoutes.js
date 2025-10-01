const express = require('express');
const router = express.Router();

// Import notification functions
const { 
  runTaskReminderJob 
} = require('../controllers/PushNotificationControllers/pushNotificationTaskController');

const { 
  runInterviewReminderJob 
} = require('../controllers/PushNotificationControllers/pushNotificationInterviewController');

const { 
  runAssessmentReminderJob 
} = require('../controllers/PushNotificationControllers/pushNotificationAssessmentController');

// Test endpoint for task reminders
router.post('/test-task-reminder', async (req, res) => {
  try {
    console.log('[TEST] Manually triggering task reminder job...');
    await runTaskReminderJob();
    res.status(200).json({ 
      success: true, 
      message: 'Task reminder job executed successfully. Check console logs for details.' 
    });
  } catch (error) {
    console.error('[TEST] Error running task reminder:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to run task reminder job', 
      error: error.message 
    });
  }
});

// Test endpoint for interview reminders
router.post('/test-interview-reminder', async (req, res) => {
  try {
    console.log('[TEST] Manually triggering interview reminder job...');
    await runInterviewReminderJob();
    res.status(200).json({ 
      success: true, 
      message: 'Interview reminder job executed successfully. Check console logs for details.' 
    });
  } catch (error) {
    console.error('[TEST] Error running interview reminder:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to run interview reminder job', 
      error: error.message 
    });
  }
});

// Test endpoint for assessment reminders
router.post('/test-assessment-reminder', async (req, res) => {
  try {
    console.log('[TEST] Manually triggering assessment reminder job...');
    await runAssessmentReminderJob();
    res.status(200).json({ 
      success: true, 
      message: 'Assessment reminder job executed successfully. Check console logs for details.' 
    });
  } catch (error) {
    console.error('[TEST] Error running assessment reminder:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to run assessment reminder job', 
      error: error.message 
    });
  }
});

// Cleanup duplicate expired assessment notifications
router.post('/cleanup-assessment-duplicates', async (req, res) => {
  try {
    const { 
      cleanupDuplicateExpiredNotifications 
    } = require('../controllers/PushNotificationControllers/pushNotificationAssessmentController');
    
    console.log('[TEST] Running cleanup for duplicate expired assessment notifications...');
    const duplicatesRemoved = await cleanupDuplicateExpiredNotifications();
    
    res.status(200).json({ 
      success: true, 
      message: `Cleanup completed successfully. Removed ${duplicatesRemoved} duplicate notifications.`,
      duplicatesRemoved 
    });
  } catch (error) {
    console.error('[TEST] Error running cleanup:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to run cleanup', 
      error: error.message 
    });
  }
});

// Test scheduled assessment notification
router.post('/test-scheduled-assessment', async (req, res) => {
  try {
    const { 
      createAssessmentScheduledNotification 
    } = require('../controllers/PushNotificationControllers/pushNotificationAssessmentController');
    
    // Create a mock scheduled assessment object
    const mockScheduledAssessment = {
      _id: new Date().getTime(),
      scheduledAssessmentCode: 'ASMT-00099',
      assessmentId: '66e3dc1d93743e06e3bb8b65',
      organizationId: req.body.organizationId || '66e2f1f19ca8f3e893e11236',
      createdBy: req.body.createdBy || '66e3dc1d93743e06e3bb8b65',
      order: 'Test Assessment 1',
      expiryAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'scheduled',
      proctoringEnabled: false
    };
    
    console.log('[TEST] Creating test scheduled assessment notification with:', mockScheduledAssessment);
    await createAssessmentScheduledNotification(mockScheduledAssessment);
    
    res.status(200).json({ 
      success: true, 
      message: 'Test scheduled assessment notification created. Check PushNotifications collection and console logs.' 
    });
  } catch (error) {
    console.error('[TEST] Error creating test scheduled assessment notification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create test scheduled assessment notification', 
      error: error.message 
    });
  }
});

// Test creating assessment notifications manually
router.post('/test-assessment-creation', async (req, res) => {
  try {
    const { 
      createAssessmentCreatedNotification 
    } = require('../controllers/PushNotificationControllers/pushNotificationAssessmentController');
    
    // Create a mock assessment object
    const mockAssessment = {
      _id: new Date().getTime(),
      AssessmentTitle: 'Test Assessment',
      AssessmentCode: 'ASMT-TPL-00099',
      ownerId: req.body.ownerId || '66e3dc1d93743e06e3bb8b65', // Use a default or pass in body
      tenantId: req.body.tenantId || '66e2f1f19ca8f3e893e11236',
      status: 'active'
    };
    
    console.log('[TEST] Creating test assessment notification with:', mockAssessment);
    await createAssessmentCreatedNotification(mockAssessment, mockAssessment.ownerId);
    
    res.status(200).json({ 
      success: true, 
      message: 'Test assessment creation notification created. Check PushNotifications collection.' 
    });
  } catch (error) {
    console.error('[TEST] Error creating test assessment notification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create test assessment notification', 
      error: error.message 
    });
  }
});

// Test endpoint to trigger all reminders
router.post('/test-all-reminders', async (req, res) => {
  try {
    console.log('[TEST] Manually triggering all reminder jobs...');
    
    const results = {
      tasks: { status: 'pending' },
      interviews: { status: 'pending' },
      assessments: { status: 'pending' }
    };

    // Run task reminders
    try {
      await runTaskReminderJob();
      results.tasks.status = 'success';
    } catch (error) {
      results.tasks.status = 'error';
      results.tasks.error = error.message;
    }

    // Run interview reminders
    try {
      await runInterviewReminderJob();
      results.interviews.status = 'success';
    } catch (error) {
      results.interviews.status = 'error';
      results.interviews.error = error.message;
    }

    // Run assessment reminders
    try {
      await runAssessmentReminderJob();
      results.assessments.status = 'success';
    } catch (error) {
      results.assessments.status = 'error';
      results.assessments.error = error.message;
    }

    res.status(200).json({ 
      success: true, 
      message: 'All reminder jobs executed. Check console logs for details.',
      results 
    });
  } catch (error) {
    console.error('[TEST] Error running all reminders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to run all reminder jobs', 
      error: error.message 
    });
  }
});

module.exports = router;
