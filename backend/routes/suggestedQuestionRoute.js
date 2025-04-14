
const express = require('express')
const { createQuestion, getQuestions } = require('../controllers/suggestedQuestions.js')

const router = express.Router()


router.post('/create',createQuestion)
router.get('/questions',getQuestions)

module.exports = router