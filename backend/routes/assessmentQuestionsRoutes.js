

const express = require('express')
const AssessmentQuestionsController = require('../controllers/assessmentQuestionsController')
const loggingService = require('../middleware/loggingService')

const router = express.Router()
//assessment realted
router.post('/upsert', loggingService.internalLoggingMiddleware, AssessmentQuestionsController.upsertAssessmentQuestions)

//using in assessment test
// Get questions by assessment ID
router.get('/list/:assessmentId', AssessmentQuestionsController.getByAssessmentId)

// Get question by ID
// router.get('/:id', AssessmentQuestionsController.getByAssessmentQuestionsId)

// assessment questions position, interview, intevriew template
// router.get('/:id', AssessmentQuestionsController.getAssessmentById);

module.exports = router
