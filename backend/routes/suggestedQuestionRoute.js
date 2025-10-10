const express = require('express')
const { createQuestion, getQuestions, checkQuestionBankUsage } = require('../controllers/suggestedQuestionsControllers')

const router = express.Router()


router.post('/create',createQuestion)
router.get('/questions',getQuestions)
router.get('/check-usage', checkQuestionBankUsage)

module.exports = router