
const express = require('express')

const { getCandidateAssessmentBasedOnId, verifyOtp, sendOtp,submitCandidateAssessment} = require('../controllers/candidateAssessmentController')
// const { customControllerToSendEmail } = require('../controllers/assessmentEmailCommonController')

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
//we are using in assessment test





router.get('/details/:id',getCandidateAssessmentBasedOnId)
router.post('/verify-otp',verifyOtp)
router.post('/submit', submitCandidateAssessment);


module.exports = router