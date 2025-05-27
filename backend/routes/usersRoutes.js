const express = require('express');
const router = express.Router();
const { getUsers, UpdateUser } = require('../controllers/usersController.js');

// Define the route for fetching users
router.get('/', getUsers);


// UpdateUser
router.patch("/:id/status",UpdateUser)

module.exports = router;