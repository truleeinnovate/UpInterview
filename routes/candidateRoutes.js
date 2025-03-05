const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const loggingService = require('../middlewares/loggingService');


router.get('/', candidateController.getCandidates);
router.post('/',loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, candidateController.createCandidate);
router.patch('/:id',loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, candidateController.updateCandidate);
router.get('/:id', candidateController.getCandidateById);//we have to check where we are using this code

module.exports = router;
