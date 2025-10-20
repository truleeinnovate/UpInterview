const express = require("express");
const router = express.Router();

const {
  getUsers,
  getInterviewers,
  UpdateUser,
  getUsersByTenant,
  getUniqueUserByOwnerId,
  getPlatformUsers, // SUPER ADMIN added by Ashok
  getSuperAdminUsers,
} = require("../controllers/usersController.js");

// routes/userRoutes.js
const Users = require("../models/Users");
// const RolesPermissionObject = require('../models/RolesPermissionObject');
const RoleOverrides = require("../models/roleOverrides.js");
const Tenant = require("../models/Tenant");

router.get('/permissions', async (req, res) => {
  try {
    // The permission middleware will be applied globally, so we can just return the permissions
    // that are already set in res.locals by the middleware

    const response = {
      effectivePermissions: res.locals.effectivePermissions || {},
      superAdminPermissions: res.locals.superAdminPermissions || null,
      inheritedRoleIds: res.locals.inheritedRoleIds || [],
      isImpersonating: res.locals.isImpersonating || false,
      effectivePermissions_RoleType: res.locals.effectivePermissions_RoleType || null,
      effectivePermissions_RoleLevel: res.locals.effectivePermissions_RoleLevel || null,
      effectivePermissions_RoleName: res.locals.effectivePermissions_RoleName || null,
      impersonatedUser_roleType: res.locals.impersonatedUser_roleType || null,
      impersonatedUser_roleName: res.locals.impersonatedUser_roleName || null
    };

    console.log('[Permissions Endpoint] Returning permissions:', {
      hasEffectivePermissions: !!response.effectivePermissions && Object.keys(response.effectivePermissions).length > 0,
      hasSuperAdminPermissions: !!response.superAdminPermissions,
      isImpersonating: response.isImpersonating,
      roleType: response.effectivePermissions_RoleType,
      roleName: response.effectivePermissions_RoleName,
      userId: res.locals.userId
    });

    res.json(response);
  } catch (error) {
    console.error('[Permissions Endpoint] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get("/super-admins", (req, res, next) => {
  console.log("Hit /users/super-admins route");
  getSuperAdminUsers(req, res, next);
});

//  SUPER ADMIN added by Ashok ====================================>
router.get("/platform-users", getPlatformUsers);
// =================================================================>

// Define the route for fetching users
router.get("/", getUsers);

// Get user by ownerId

router.get("/owner/:ownerId", getUniqueUserByOwnerId);

router.get("/:tenantId", getUsersByTenant);

// Route to fetch interviewers
router.get("/interviewers/:tenantId", getInterviewers);

// UpdateUser
router.patch("/:id/status", UpdateUser);

module.exports = router;
