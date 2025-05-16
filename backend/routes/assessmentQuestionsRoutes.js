

const express = require('express')
const AssessmentQuestionsController = require('../controllers/assessmentQuestionsController')

const router = express.Router()
//assessment realted
router.post('/upsert',AssessmentQuestionsController.upsertAssessmentQuestions)
   

//using in assessment test
// Get questions by assessment ID
router.get('/list/:assessmentId', AssessmentQuestionsController.getByAssessmentId)

// Get question by ID
// router.get('/:id', AssessmentQuestionsController.getByAssessmentQuestionsId)

module.exports = router
