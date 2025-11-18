const express = require('express');
const { getCandidates,addCandidatePostCall,updateCandidatePatchCall,getCandidateById, deleteCandidate, searchCandidates, getCandidatesData, bulkAddCandidates } = require('../controllers/candidateController.js');
const router = express.Router();
const { apiKeyAuth, requirePermission } = require('../middleware/apiKeyAuth.js');

// const candidateController = require('../controllers/candidateController');
const loggingService = require('../middleware/loggingService.js');

// Middleware to handle both single and bulk candidate creation
const candidateCreateMiddleware = (req, res, next) => {
  // Check if request body is an array (bulk insert)
  if (Array.isArray(req.body)) {
    return bulkAddCandidates(req, res);
  }
  // Otherwise, handle as single candidate
  return addCandidatePostCall(req, res);
};

router.post('/', apiKeyAuth('candidates:write'), loggingService.internalLoggingMiddleware, loggingService.FeedsMiddleware, candidateCreateMiddleware);

// Explicit bulk route (optional, for clarity)
//router.post('/bulk',loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, bulkAddCandidates);

router.patch('/:id',loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, updateCandidatePatchCall);
// router.get('/',getCandidates);
router.get('/details/:id',getCandidateById);
router.delete('/delete-candidate/:id', deleteCandidate);


router.get('/', apiKeyAuth('candidates:read'), getCandidatesData);
router.post('/search',searchCandidates);


module.exports = router;