const express = require('express');
const { createCandidatePosition, getAllCandidatePositions} = require('../controllers/candidatePositionController');

const router = express.Router();

router.get('/', getAllCandidatePositions);
router.post('/', createCandidatePosition);

module.exports = router