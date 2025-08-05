//<----v1.0.0---Venkatesh-----get feedback by tenant ID

const express = require('express')

const { createFeedback, getFeedbackByTenantId, getFeedbackByRoundId,getAllFeedback } = require('../controllers/feedbackController.js')

const router = express.Router()

// Route to create feedback
router.post('/create', createFeedback)

// Route to get feedback by round ID (more specific route first)
router.get('/round/:roundId', getFeedbackByRoundId)


// Route to get feedback by tenant ID
router.get('/:tenantId', getFeedbackByTenantId);//<----v1.0.0---
router.get('/', getAllFeedback);//<----v1.0.0---
router.post('/create',createFeedback)




module.exports = router 
 