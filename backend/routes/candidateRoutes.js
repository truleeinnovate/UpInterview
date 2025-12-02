const express = require('express');
const { getCandidates,addCandidatePostCall,updateCandidatePatchCall,getCandidateById, deleteCandidate, searchCandidates, getCandidatesData } = require('../controllers/candidateController.js');
const router = express.Router();
const loggingService = require('../middleware/loggingService.js');

router.post('/', loggingService.internalLoggingMiddleware, loggingService.FeedsMiddleware, addCandidatePostCall);

router.patch('/:id',loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, updateCandidatePatchCall);
// router.get('/',getCandidates);
router.get('/details/:id',getCandidateById);
router.delete('/delete-candidate/:id', deleteCandidate);

router.get('/', getCandidatesData);

router.post('/search',searchCandidates);

module.exports = router;