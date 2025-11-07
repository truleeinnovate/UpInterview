
const express = require('express')
const { 
    // getScheduledAssessmentsWithCandidates,
     getScheduledAssessmentsListBasedOnId } = require('../controllers/scheduledAssessmentController')
const router = express.Router()

//createScheduledAssessment using this
// router.post('/schedule',createScheduledAssessment)

//getting scheduled assessments based on scheduled assessment id 
//getScheduledAssessmentsListBasedOnId using in assessmnet test
router.get('/list/:id',getScheduledAssessmentsListBasedOnId)
// we can use this to send link one more time but we are not using this any where

// router.post('/resend-link-otp/:id',shareScheduledAssessment)

// Get all scheduled assessments with their candidates for an assessment
// router.get('/:assessmentId/schedules', getScheduledAssessmentsWithCandidates);
module.exports = router