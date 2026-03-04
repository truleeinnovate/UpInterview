
const express = require('express')
const { AddQuestion, GetQuestions, DeleteQuestions, GetQuestionsBasedOnId } = require('../controllers/interviewQuestionsControllers')

const router = express.Router()
const loggingService = require('../middleware/loggingService.js')

router.get('/test', (req, res) => {
    res.send("Hello world")
})

router.post('/add-question', loggingService.internalLoggingMiddleware, AddQuestion)//we are not using this because from rounds only we are saving questions(ashraf)
router.get('/get-questions', GetQuestions)
router.delete('/question/:id', DeleteQuestions)
router.get('/question/:id', GetQuestionsBasedOnId)
module.exports = router