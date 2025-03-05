
const express = require('express')
const { AddQuestion, GetQuestions, DeleteQuestions, GetQuestionsBasedOnId } = require('../controllers/interviewQuestions')

const router = express.Router()

router.get('/test',(req,res)=>{
    res.send("Hello world")
})

router.post('/add-question',AddQuestion)
router.get('/get-questions',GetQuestions)
router.delete('/question/:id',DeleteQuestions)
router.get('/question/:id',GetQuestionsBasedOnId)
module.exports = router