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
      roleType: res.locals.roleType,
      roleLevel: res.locals.roleLevel,
      roleName: res.locals.roleName
    });
    console.log("effectivePermissions userroutes", res.locals.effectivePermissions);
    console.log("superAdminPermissions userroutes", res.locals.superAdminPermissions);
    console.log("inheritedRoleIds userroutes", res.locals.inheritedRoleIds);
    console.log("isImpersonating userroutes", res.locals.isImpersonating);
    console.log("roleType userroutes", res.locals.roleType);
    console.log("roleLevel userroutes", res.locals.roleLevel);
    console.log("roleName userroutes", res.locals.roleName);    
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


