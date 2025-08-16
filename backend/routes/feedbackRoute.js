//<----v1.0.0---Venkatesh-----get feedback by tenant ID

const express = require('express')

const { createFeedback, getFeedbackByRoundId,getAllFeedback, updateFeedback, getFeedbackByContactIdRoundId, getCandidateByRoundId } = require('../controllers/feedbackController.js')

const router = express.Router()

// Route to create feedback
router.post('/create', createFeedback)

// Route to get feedback by round ID (specific route for detailed view)
router.get('/round/:roundId', getFeedbackByRoundId)


// Route to update feedback by ID
router.put('/:id', updateFeedback);

// Route to get feedback by tenant ID
// router.get('/:tenantId', getFeedbackByTenantId);//<----v1.0.0---
// router.get('/ownerId/:ownerId', getFeedbackByInterviewerId);//<----v1.0.0---

router.get('/', getAllFeedback);//<----v1.0.0---

router.get('/contact-details', getFeedbackByContactIdRoundId);

router.get('/candidate-details', getCandidateByRoundId);



module.exports = router 
 