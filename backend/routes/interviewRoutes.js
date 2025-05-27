// interviewroutes.js

const express = require('express');
const router = express.Router();
const { createInterview,saveInterviewRound,getDashboardStats } = require('../controllers/interviewController');

// router.get('/', getAllInterviews);
// router.get('/:id',getInterviewBasedOnInterviewId)
router.post('/', createInterview);
// router.patch('/:id', updateInterview);
router.post('/save-round', saveInterviewRound);

// Route to fetch dashboard statistics
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;