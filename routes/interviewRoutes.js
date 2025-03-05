// interviewroutes.js

const express = require('express');
const router = express.Router();
const { createInterview, getAllInterviews, updateInterview, updateInterviewReschedule, updateInterviewCancel } = require('../controllers/interviewController');

router.get('/', getAllInterviews);
router.post('/', createInterview);
router.patch('/:id', updateInterview);
router.patch('/reschedule/:id', updateInterviewReschedule);
router.patch('/cancel/:id/:roundIndex', updateInterviewCancel);

module.exports = router;