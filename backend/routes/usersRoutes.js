const express = require("express");
const router = express.Router();

const {
  getUsers,
  getInterviewers,
  UpdateUser,
  getUsersByTenant,
  getUniqueUserByOwnerId,
  getPlatformUsers, // SUPER ADMIN added by Ashok
} = require("../controllers/usersController.js");

// routes/userRoutes.js
const Users = require('../models/Users');
// const RolesPermissionObject = require('../models/RolesPermissionObject');
const RoleOverrides = require('../models/roleOverrides.js');
const Tenant = require('../models/Tenant');
const { permissionMiddleware } = require('../middleware/permissionMiddleware');

router.get('/permissions', permissionMiddleware, async (req, res) => {
  try {
    res.json({
      effectivePermissions: res.locals.effectivePermissions,
      superAdminPermissions: res.locals.superAdminPermissions,
      inheritedRoleIds: res.locals.inheritedRoleIds,
      isImpersonating: res.locals.isImpersonating,
      effectivePermissions_RoleType: res.locals.effectivePermissions_RoleType,
      effectivePermissions_RoleLevel: res.locals.effectivePermissions_RoleLevel,
      effectivePermissions_RoleName: res.locals.effectivePermissions_RoleName,
      impersonatedUser_roleType: res.locals.impersonatedUser_roleType,
      impersonatedUser_roleName: res.locals.impersonatedUser_roleName
    });

  } catch (error) {
    console.error('Get Permissions Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Define the route for fetching users
router.get("/", getUsers);

// Get user by ownerId

router.get("/owner/:ownerId", getUniqueUserByOwnerId);

router.get("/:tenantId", getUsersByTenant);

// Route to fetch interviewers
router.get("/interviewers/:tenantId", getInterviewers);

// UpdateUser
router.patch("/:id/status", UpdateUser);

//  SUPER ADMIN added by Ashok ====================================>
router.get("/platform-users", getPlatformUsers);
// =================================================================>

module.exports = router;  
