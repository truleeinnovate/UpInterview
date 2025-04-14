
const express = require('express')
const { AddQuestion, GetQuestions, DeleteQuestions, GetQuestionsBasedOnId } = require('../controllers/interviewQuestions.js')

const router = express.Router()

router.get('/test',(req,res)=>{
    res.send("Hello world")
})

router.post('/add-question',AddQuestion)//we are not using this because from rounds only we are saving questions(ashraf)
router.get('/get-questions',GetQuestions)
router.delete('/question/:id',DeleteQuestions)
router.get('/question/:id',GetQuestionsBasedOnId)
module.exports = router