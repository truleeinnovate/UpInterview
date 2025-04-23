

const express = require('express')
const { upsertAssessmentQuestions, getAssessmentQuestionsBasedOnAssessmentId, updateAssessmentQuestion,getByAssessmentId } = require('../controllers/assessmentQuestions')

const router = express.Router()

router.post('/upsert',upsertAssessmentQuestions)
   
//get assessment question based on assessment id
router.get('/question/:id',getAssessmentQuestionsBasedOnAssessmentId)

//delete assessment question, update order 
// router.delete('/question/:id',deleteAssessmentQuestion)

// router.patch('/question',updateAssessmentQuestion)

router.get('/list/:assessmentId', getByAssessmentId)

module.exports = router
