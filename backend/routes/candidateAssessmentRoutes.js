// v1.0.0  -  Ashraf  -  added extend,cancel,schedule status api code based on policy
const express = require('express')
// <-------------------------------v1.0.0
const { getCandidateAssessmentBasedOnId, verifyOtp, sendOtp, submitCandidateAssessment, extendCandidateAssessment, cancelCandidateAssessments, checkAndUpdateExpiredAssessments, updateScheduleStatus, updateAllScheduleStatuses } = require('../controllers/candidateAssessmentController')
// ------------------------------v1.0.0 >


const router = express.Router()

//update candidate assessment 
//we are using in assessmet test
// router.patch('/update/:id',updateCandidateAssessment)

//get candidate assessment based on _id ,purpose: to get candidate id and assessment id out of it.
// we are using this assessment test

//save the answers
//we are using in assessment test
// router.patch('/:candidateAssessmentId/sections/:sectionIndex/questions/:questionId',updateAnswersToDb)
//we are using this in asessment test
// router.patch('/:candidateAssessmentId/save-progress',autoSaveAnswers)
//we are using this in asessment test




router.get('/details/:id',getCandidateAssessmentBasedOnId)
router.post('/verify-otp',verifyOtp)
router.post('/submit', submitCandidateAssessment);
// <-------------------------------v1.0.0
// New routes for extend and cancel functionality
router.post('/extend', extendCandidateAssessment);
router.post('/cancel', cancelCandidateAssessments);

// Add the new route for automatic expiry check
router.post('/check-expired', checkAndUpdateExpiredAssessments);

// Add the new route for updating schedule assessment status
router.post('/schedule-status/:scheduleAssessmentId', updateScheduleStatus);

// Add the new route for updating all schedule assessment statuses
router.post('/update-all-schedule-statuses', updateAllScheduleStatuses);
// ------------------------------v1.0.0 >

module.exports = router