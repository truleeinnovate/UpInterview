// routes/outsourceInterviewerRoutes.js

const express = require('express');
const router = express.Router();
const outsourceInterviewerController = require('../controllers/outsourceInterviewerController');

router.get('/', outsourceInterviewerController.getAllInterviewers);
router.patch('/', outsourceInterviewerController.updateInterviewerFeedback);

module.exports = router;