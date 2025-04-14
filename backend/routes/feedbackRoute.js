

const express = require('express')
const { createFeedback } = require('../controllers/feedback.js')

const router = express.Router()


router.post('/create',createFeedback)

module.exports =router 
 