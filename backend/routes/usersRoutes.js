const express = require("express");
const router = express.Router();

const {
  getUsers,
  getInterviewers,
  UpdateUser,
  getUsersByTenant,
  getPlatformUsers,
} = require("../controllers/usersController.js");

//  SUPER ADMIN
router.get("/platform-users", getPlatformUsers);

// Define the route for fetching users
router.get("/", getUsers);

router.get("/:tenantId", getUsersByTenant);

// Route to fetch interviewers
router.get("/interviewers/:tenantId", getInterviewers);

// UpdateUser
router.patch("/:id/status", UpdateUser);

module.exports = router;
