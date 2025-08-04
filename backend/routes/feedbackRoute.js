

const express = require('express')
const { createFeedback, getFeedbackByTenantId } = require('../controllers/feedback.js')

const router = express.Router()


router.post('/create',createFeedback)

router.get('/:tenantId',getFeedbackByTenantId)

module.exports =router 
 