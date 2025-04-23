// interviewroutes.js

const express = require('express');
const router = express.Router();
const { createInterview,saveInterviewRound } = require('../controllers/interviewController');

// router.get('/', getAllInterviews);
// router.get('/:id',getInterviewBasedOnInterviewId)
router.post('/', createInterview);
// router.patch('/:id', updateInterview);
router.post('/save-round', saveInterviewRound);



module.exports = router;