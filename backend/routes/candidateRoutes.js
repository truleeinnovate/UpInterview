const express = require('express');
const { getCandidates,addCandidatePostCall,updateCandidatePatchCall,getCandidateById } = require('../controllers/candidateController.js');
const router = express.Router();

// const candidateController = require('../controllers/candidateController');
const loggingService = require('../middlewares/loggingService');


router.post('/',loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, addCandidatePostCall);

router.patch('/:id',loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, updateCandidatePatchCall);
router.get('/',getCandidates);
router.get('/:id',getCandidateById);

module.exports = router;