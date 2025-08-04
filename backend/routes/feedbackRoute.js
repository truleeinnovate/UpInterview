//<----v1.0.0---Venkatesh-----get feedback by tenant ID

const express = require('express')
const { createFeedback, getFeedbackByTenantId } = require('../controllers/feedbackController.js')

const router = express.Router()

// Route to get feedback by tenant ID
router.get('/feedback/:tenantId', getFeedbackByTenantId);//<----v1.0.0---

router.post('/create',createFeedback)

module.exports =router 
 