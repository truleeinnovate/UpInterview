const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/usersController.js');

// Define the route for fetching users
router.get('/', getUsers);

module.exports = router;