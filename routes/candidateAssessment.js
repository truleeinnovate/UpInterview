
const express = require('express')

const { createCandidateAssessment, getCandidateAssessmentBasedOnScheduledAssessmentId, updateCandidateAssessment, getCandidateAssessmentBasedOnId, updateAnswersToDb, autoSaveAnswers, verifyOtp, sendLinkToCandidate } = require('../controllers/candidateAssessment')

const router = express.Router()

router.post('/create',createCandidateAssessment)

//getting candidate assessment based on scheduled assessment id
router.get('/scheduled-assessment/:id',getCandidateAssessmentBasedOnScheduledAssessmentId)


//update candidate assessment 
router.patch('/update/:id',updateCandidateAssessment)

//get candidate assessment based on _id ,purpose: to get candidate id and assessment id out of it.
router.get('/details/:id',getCandidateAssessmentBasedOnId)

//save the answers
router.patch('/:candidateAssessmentId/sections/:sectionIndex/questions/:questionId',updateAnswersToDb)

router.patch('/:candidateAssessmentId/save-progress',autoSaveAnswers)

router.post('/verify-otp',verifyOtp)

// router.post('/resend-otp',resendOtp) 

router.post('/candidate-link/:scheduledAssessmentId/:candidateId',sendLinkToCandidate)

// router.post('/send-assessment-link',sendAssessmentLink)



module.exports = router