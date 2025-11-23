const express = require('express');
const { getCandidates,addCandidatePostCall,updateCandidatePatchCall,getCandidateById, deleteCandidate, searchCandidates, getCandidatesData, bulkAddCandidates } = require('../controllers/candidateController.js');
const router = express.Router();
const { apiKeyAuth, requirePermission, extractApiKey } = require('../middleware/apiKeyAuth.js');
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

// Unified access control for candidates:
// - If API key is present, use apiKeyAuth with required permission (external apps)
// - Otherwise, use logged-in user from res.locals.auth (internal app)
// keep this candidateAccess part in the routes only dont send it to controller - Mansoor
const candidateAccess = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const apiKey = extractApiKey(req);

      if (apiKey) {
        // Delegate to existing API key middleware for external integrations
        return apiKeyAuth(requiredPermission)(req, res, next);
      }

      // Fallback: internal app using cookie/JWT auth
      const auth = res.locals?.auth;

      if (auth?.actingAsUserId && auth?.actingAsTenantId) {
        // Populate req.user and req.tenantId like apiKeyAuth does
        req.user = {
          _id: auth.actingAsUserId,
          userId: auth.actingAsUserId,
        };
        req.tenantId = auth.actingAsTenantId;
        return next();
      }

      // Neither API key nor authenticated user present
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: API key or user authentication required',
        error: 'UNAUTHORIZED',
      });
    } catch (err) {
      console.error('[CandidateAccess] Error while checking access:', err);
      return res.status(500).json({
        success: false,
        message: 'Error while checking access for candidate endpoint',
        error: 'CANDIDATE_ACCESS_ERROR',
      });
    }
  };
};

router.post('/', candidateAccess('candidates:write'), loggingService.internalLoggingMiddleware, loggingService.FeedsMiddleware, candidateCreateMiddleware);

// Explicit bulk route (optional, for clarity)
//router.post('/bulk',loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, bulkAddCandidates);

router.patch('/:id',loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, updateCandidatePatchCall);
// router.get('/',getCandidates);
router.get('/details/:id',getCandidateById);
router.delete('/delete-candidate/:id', deleteCandidate);

router.get('/', candidateAccess('candidates:read'), getCandidatesData);

router.post('/search',searchCandidates);

module.exports = router;