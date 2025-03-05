
const express = require('express')
const { createScheduledAssessment, getScheduledAssessmentBasedOnAssessmentId, getScheduledAssessmentsListBasedOnId, updateScheduleAssessment, shareScheduledAssessment } = require('../controllers/scheduledAssessment')
const { updateAssessment } = require('../controllers/assessment')

const router = express.Router()

router.post('/schedule',createScheduledAssessment)


router.get('/assessment/:id',getScheduledAssessmentBasedOnAssessmentId)

//getting scheduled assessments based on scheduled assessment id 
router.get('/list/:id',getScheduledAssessmentsListBasedOnId)


//update(status) schedule assessment based on schedule assessment id
router.patch('/update/:id',updateScheduleAssessment)

router.post('/resend-link-otp/:id',shareScheduledAssessment)

module.exports = router