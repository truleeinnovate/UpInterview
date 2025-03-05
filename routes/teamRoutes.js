// routes/teamRoutes.js
const express = require('express');
const router = express.Router();
const { createTeamMember } = require('../controllers/teamController');

router.post('/', createTeamMember);

module.exports = router;