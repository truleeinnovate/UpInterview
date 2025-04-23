
const mongoose = require("mongoose")
const express = require("express")
const { newAssessment, updateAssessment, getAssessmentDetailsBasedOnAssessmentId,getAssessmentCandidates,getAssessmentResults,getAssignedCandidates } = require("../controllers/assessmentController")
 
const router = express.Router()

router.post('/new-assessment', newAssessment)  

router.patch('/update/:id', updateAssessment)
 
router.get('/details/:assessmentId', getAssessmentDetailsBasedOnAssessmentId)

// above code is created by sashak now we have changes assesment logic so wee need to check wich one is working or not
// from here this is new code created by ashraf
router.get('/:assessmentId/candidates', getAssessmentCandidates);
router.get('/:assessmentId/results', getAssessmentResults);

// checking candidates if already assigned for assessment or not
router.get('/assigned/:assessmentId', getAssignedCandidates);

module.exports = router