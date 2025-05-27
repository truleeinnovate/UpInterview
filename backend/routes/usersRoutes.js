const express = require('express');
const router = express.Router();
const { getUsers,getInterviewers } = require('../controllers/usersController.js');

// Define the route for fetching users
router.get('/', getUsers);

// Route to fetch interviewers
router.get('/interviewers/:tenantId', getInterviewers);

module.exports = router;