const express = require('express');
const { getCandidates,addCandidatePostCall,updateCandidatePatchCall,getCandidateById, deleteCandidate } = require('../controllers/candidateController.js');
const router = express.Router();

// const candidateController = require('../controllers/candidateController');
const loggingService = require('../middleware/loggingService.js');


router.post('/',loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, addCandidatePostCall);

router.patch('/:id',loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, updateCandidatePatchCall);
// router.get('/',getCandidates);
// router.get('/:id',getCandidateById);
router.delete('/delete-candidate/:id', deleteCandidate);


module.exports = router;