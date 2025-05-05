const express = require('express')
const router = express.Router()
const AssessmentQuestionsController = require('../controllers/assessmentQuestionsController')

// Get question by ID
router.get('/:id', AssessmentQuestionsController.getByAssessmentQuestionsId)

module.exports = router