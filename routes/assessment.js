
const mongoose = require("mongoose")
const express = require("express")
const { newAssessment, updateAssessment, getAssessmentDetailsBasedOnAssessmentId } = require("../controllers/assessment")

const router = express.Router()

router.post('/new-assessment',newAssessment)

router.patch('/update/:id',updateAssessment)

router.get('/details/:assessmentId',getAssessmentDetailsBasedOnAssessmentId)

module.exports = router