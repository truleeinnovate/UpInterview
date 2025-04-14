// routes/teamRoutes.js
const express = require('express');
const router = express.Router();
const { createTeamMember } = require('../controllers/teamController.js');

router.post('/', createTeamMember);

module.exports = router;