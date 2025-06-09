const express = require('express');
const router = express.Router();

const { getUsers,getInterviewers,UpdateUser,getUsersByTenant,getUniqueUserByOwnerId } = require('../controllers/usersController.js');


// Define the route for fetching users
router.get('/', getUsers);

// Get user by ownerId

// router.get('/:ownerId', getUniqueUserByOwnerId);


router.get('/:tenantId', getUsersByTenant);



// Route to fetch interviewers
router.get('/interviewers/:tenantId', getInterviewers);

// UpdateUser
router.patch("/:id/status",UpdateUser)


module.exports = router;