const express = require("express");
const router = express.Router();

const {
  getUsers,
  getInterviewers,
  UpdateUser,
  getUsersByTenant,
  getUniqueUserByOwnerId,
  getPlatformUsers, // SUPER ADMIN added by Ashok
  getSuperAdminUsers
} = require("../controllers/usersController.js");

// routes/userRoutes.js
const Users = require('../models/Users');
// const RolesPermissionObject = require('../models/RolesPermissionObject');
const RoleOverrides = require('../models/roleOverrides.js');
const Tenant = require('../models/Tenant');
const { permissionMiddleware } = require('../middleware/permissionMiddleware');

router.get('/permissions', async (req, res) => {
  try {
    console.log('[Permissions Endpoint] Request received');
    console.log('[Permissions Endpoint] Cookies:', req.cookies);
    
    // Check if we have any tokens
    const authToken = req.cookies.authToken;
    const impersonationToken = req.cookies.impersonationToken;
    
    // Check if we have at least one valid token (either authToken OR impersonationToken)
    const hasAnyToken = authToken || impersonationToken;
    
    if (!hasAnyToken) {
      console.log('[Permissions Endpoint] No tokens found, returning empty permissions');
      return res.json({
        effectivePermissions: {},
        superAdminPermissions: null,
        inheritedRoleIds: [],
        isImpersonating: false,
        effectivePermissions_RoleType: null,
        effectivePermissions_RoleLevel: null,
        effectivePermissions_RoleName: null,
        impersonatedUser_roleType: null,
        impersonatedUser_roleName: null
      });
    }

    // If we have at least one token, use the permission middleware to get permissions
    console.log('[Permissions Endpoint] Tokens found, using permission middleware');
    return permissionMiddleware(req, res, () => {
      const response = {
        effectivePermissions: res.locals.effectivePermissions,
        superAdminPermissions: res.locals.superAdminPermissions,
        inheritedRoleIds: res.locals.inheritedRoleIds,
        isImpersonating: res.locals.isImpersonating,
        effectivePermissions_RoleType: res.locals.effectivePermissions_RoleType,
        effectivePermissions_RoleLevel: res.locals.effectivePermissions_RoleLevel,
        effectivePermissions_RoleName: res.locals.effectivePermissions_RoleName,
        impersonatedUser_roleType: res.locals.impersonatedUser_roleType,
        impersonatedUser_roleName: res.locals.impersonatedUser_roleName
      };
      
      console.log('[Permissions Endpoint] Response:', {
        hasSuperAdminPermissions: !!response.superAdminPermissions,
        superAdminPermissionKeys: response.superAdminPermissions ? Object.keys(response.superAdminPermissions) : [],
        hasEffectivePermissions: !!response.effectivePermissions,
        effectivePermissionKeys: response.effectivePermissions ? Object.keys(response.effectivePermissions) : [],
        isImpersonating: response.isImpersonating,
        roleType: response.effectivePermissions_RoleType,
        roleName: response.effectivePermissions_RoleName
      });
      
      res.json(response);
    });

  } catch (error) {
    console.error('[Permissions Endpoint] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/super-admins', (req, res, next) => {
  console.log('Hit /users/super-admins route');
  getSuperAdminUsers(req, res, next);
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
// Super admin users route (must be before dynamic routes)

module.exports = router;  