const express = require('express');
const router = express.Router();
const { getAllInterviewRounds } = require('../controllers/interviewRoundsController.js');

router.get('/', getAllInterviewRounds);

module.exports = router;