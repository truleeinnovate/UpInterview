//<----v1.0.0---Venkatesh-----get feedback by tenant ID

const express = require('express')
const { createFeedback, getFeedbackByTenantId, getFeedbackByRoundId } = require('../controllers/feedbackController.js')

const router = express.Router()

// Route to create feedback
router.post('/create', createFeedback)

// Route to get feedback by round ID (more specific route first)
router.get('/round/:roundId', getFeedbackByRoundId)

// Route to get feedback by tenant ID (less specific route last)
router.get('/tenant/:tenantId', getFeedbackByTenantId)

module.exports = router 
 