
// // new code

// // middleware/permissionMiddleware.js
// const mongoose = require('mongoose');
// const RolesPermissionObject = mongoose.model('RolesPermissionObject');
// const RoleOverrides = mongoose.model('RoleOverrides');
// const Users = mongoose.model('Users');
// const Tenant = mongoose.model('Tenant');

// const permissionMiddleware = async (req, res, next) => {
//   try {
//     const { userId, tenantId, impersonatedUserId } = req.cookies;
//     if (!userId) {
//       return res.status(401).json({ error: 'Unauthorized: Missing userId' });
//     }

//     // Fetch current user
//     const currentUser = await Users.findById(userId).populate('roleId');
//     if (!currentUser) {
//       return res.status(401).json({ error: 'Unauthorized: User not found' });
//     }

//     let effectiveUser = currentUser;
//     let effectiveTenantId = tenantId || currentUser.tenantId;
//     let isImpersonating = false;

//     // Handle impersonation
//     if (impersonatedUserId && currentUser.roleId?.roleType === 'internal') {
//       const impersonatedUser = await Users.findById(impersonatedUserId).populate('roleId');
//       if (!impersonatedUser) {
//         return res.status(404).json({ error: 'Impersonated user not found' });
//       }
//       effectiveUser = impersonatedUser;
//       effectiveTenantId = impersonatedUser.tenantId;
//       isImpersonating = true;
//     }

//     // Initialize permissions and inherited roles
//     let permissions = [];
//     let inheritedRoleIds = [];

//     if (effectiveUser.roleId) {
//       const roleTemplate = await RolesPermissionObject.findById(effectiveUser.roleId);
//       if (!roleTemplate) {
//         return res.status(403).json({ error: 'Role template not found' });
//       }

//       if (['individual', 'internal'].includes(roleTemplate.roleType)) {
//         // Individual or internal roles: Use template directly
//         permissions = roleTemplate.objects;
//       } else if (roleTemplate.roleName === 'Admin') {
//         // Admin role: Use template directly, no overrides
//         permissions = roleTemplate.objects;
//       } else {
//         // Non-Admin organization roles: Check for overrides
//         if (!effectiveTenantId) {
//           return res.status(401).json({ error: 'Unauthorized: Missing tenantId' });
//         }

//         const tenant = await Tenant.findById(effectiveTenantId);
//         if (!tenant || tenant.type !== 'organization') {
//           return res.status(403).json({ error: 'Invalid tenant for organization user' });
//         }

//         const roleOverride = await RoleOverrides.findOne({
//           tenantId: effectiveTenantId,
//           roleName: roleTemplate.roleName
//         }).populate('inherits');

//         permissions = roleTemplate.objects.map(obj => {
//           const overrideObj = roleOverride?.objects.find(o => o.objectName === obj.objectName);
//           return {
//             objectName: obj.objectName,
//             permissions: overrideObj ? { ...obj.permissions, ...overrideObj.permissions } : obj.permissions
//           };
//         });

//         // Fetch inherited roles
//         inheritedRoleIds = roleOverride?.inherits.map(r => r._id) || [];
//       }
//     } else {
//       // Individual user without roleId
//       permissions = effectiveUser.permissions || [];
//     }

//     // Convert permissions to object
//     req.permissions = permissions.reduce((acc, obj) => {
//       acc[obj.objectName] = obj.permissions;
//       return acc;
//     }, {});
//     req.inheritedRoleIds = inheritedRoleIds;
//     req.tenantId = effectiveTenantId;
//     req.userId = effectiveUser._id;
//     req.isImpersonating = isImpersonating;
//     req.currentUserId = userId;

//     // Pass to frontend context
//     res.locals.permissions = req.permissions;
//     res.locals.inheritedRoleIds = inheritedRoleIds;
//     res.locals.isImpersonating = isImpersonating;

//     next();
//   } catch (error) {
//     console.error('Permission Middleware Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// module.exports = { permissionMiddleware };



// middleware/permissionMiddleware.js
// const express = require('express');
// const cookieParser = require('cookie-parser');
// const app = express();
// const jwt = require('jsonwebtoken');
// app.use(cookieParser()); // Required to read cookies



// const {Users} = require('../models/Users');
// const Tenant = require('../models/Tenant');
// const RolesPermissionObject = require('../models/rolesPermissionObject.js');
// const RoleOverrides = require('../models/roleOverrides.js');


// const permissionMiddleware = async (req, res, next) => { 
//   try {
//     const authToken = req.cookies.authToken; // Replace 'authToken' with your cookie name

//     if (!authToken) {
//       return res.status(401).json({ error: 'Unauthorized: Missing auth token' });
//     }

//     // 2. Decode JWT to get `userId` and `tenantId`
//     const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
//     const { userId, tenantId, impersonatedUserId } = decoded;
//     if (!userId) {
//       return res.status(401).json({ error: 'Unauthorized: Missing userId' });
//     }

//     // Fetch current user (logged-in user)
//     const currentUser = await Users.findById(userId).populate('roleId');
//     if (!currentUser) {
//       return res.status(401).json({ error: 'Unauthorized: User not found' });
//     }

//     let effectiveUser = currentUser;
//     let effectiveTenantId = tenantId || currentUser.tenantId;
//     let isImpersonating = false;
//     let superAdminPermissions = null;
//     let effectivePermissions = [];
//     let inheritedRoleIds = [];

//     // Compute Super Admin permissions if applicable
//     if (currentUser.roleId?.roleType === 'internal') {
//       const superAdminRole = await RolesPermissionObject.findById(currentUser.roleId);
//       if (superAdminRole) {
//         superAdminPermissions = superAdminRole.objects.reduce((acc, obj) => {
//           acc[obj.objectName] = obj.permissions;
//           return acc;
//         }, {});
//       }
//     }

//     // Handle impersonation
//     if (impersonatedUserId && currentUser.roleId?.roleType === 'internal') {
//       const impersonatedUser = await Users.findById(impersonatedUserId).populate('roleId');
//       if (!impersonatedUser) {
//         return res.status(404).json({ error: 'Impersonated user not found' });
//       }
//       effectiveUser = impersonatedUser;
//       effectiveTenantId = impersonatedUser.tenantId;
//       isImpersonating = true;
//     }

//     // Compute effective permissions for the effective user
//     if (effectiveUser.roleId) {
//       const roleTemplate = await RolesPermissionObject.findById(effectiveUser.roleId);
//       if (!roleTemplate) {
//         return res.status(403).json({ error: 'Role template not found' });
//       }

//       if (['individual', 'internal'].includes(roleTemplate.roleType)) {
//         // Individual or internal roles: Use template directly
//         effectivePermissions = roleTemplate.objects;
//       } else if (roleTemplate.roleName === 'Admin') {
//         // Admin role: Use template directly, no overrides
//         effectivePermissions = roleTemplate.objects;
//       } else {
//         // Non-Admin organization roles: Check for overrides
//         if (!effectiveTenantId) {
//           return res.status(401).json({ error: 'Unauthorized: Missing tenantId' });
//         }

//         const tenant = await Tenant.findById(effectiveTenantId);
//         if (!tenant || tenant.type !== 'organization') {
//           return res.status(403).json({ error: 'Invalid tenant for organization user' });
//         }

//         const roleOverride = await RoleOverrides.findOne({
//           tenantId: effectiveTenantId,
//           roleName: roleTemplate.roleName
//         }).populate('inherits');

//         effectivePermissions = roleTemplate.objects.map(obj => {
//           const overrideObj = roleOverride?.objects.find(o => o.objectName === obj.objectName);
//           return {
//             objectName: obj.objectName,
//             permissions: overrideObj ? { ...obj.permissions, ...overrideObj.permissions } : obj.permissions
//           };
//         });

//         // Fetch inherited roles
//         inheritedRoleIds = roleOverride?.inherits.map(r => r._id) || [];
//       }
//     } else {
//       // Individual user without roleId
//       effectivePermissions = effectiveUser.permissions || [];
//     }

//     // Convert effective permissions to object
//     req.effectivePermissions = effectivePermissions.reduce((acc, obj) => {
//       acc[obj.objectName] = obj.permissions;
//       return acc;
//     }, {});
//     req.superAdminPermissions = superAdminPermissions; // Null for non-Super Admins
//     req.inheritedRoleIds = inheritedRoleIds;
//     req.tenantId = effectiveTenantId;
//     req.userId = effectiveUser._id;
//     req.isImpersonating = isImpersonating;
//     req.currentUserId = userId;

//     // Pass to frontend context
//     res.locals.effectivePermissions = req.effectivePermissions;
//     res.locals.superAdminPermissions = req.superAdminPermissions;
//     res.locals.inheritedRoleIds = req.inheritedRoleIds;
//     res.locals.isImpersonating = req.isImpersonating;

//     next();
//   } catch (error) {
//     console.error('Permission Middleware Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// module.exports = { permissionMiddleware };






// middleware/permissionMiddleware.js
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { Users } = require('../models/Users');
const Tenant = require('../models/Tenant');
const RolesPermissionObject = require('../models/rolesPermissionObject');
const RoleOverrides = require('../models/roleOverrides');

const permissionMiddleware = async (req, res, next) => {
  try {
    const authToken = req.cookies.authToken; // Get JWT from cookie
    console.log('authToken:', authToken); // Debug: Log the token

    if (!authToken) {
      console.error('No auth token found in cookies');
      return res.status(401).json({ error: 'Unauthorized: Missing auth token' });
    }

    // Decode JWT
    let decoded;
    try {
      decoded = jwt.verify(authToken, process.env.JWT_SECRET);
      console.log('Decoded JWT:', decoded); // Debug: Log decoded payload
    } catch (err) {
      console.error('JWT verification error:', err.message); // Debug: Log specific error
      return res.status(401).json({ error: 'Unauthorized: Invalid token', details: err.message });
    }

    const { userId, tenantId, impersonatedUserId } = decoded;
    if (!userId && !impersonatedUserId) {
      console.error('Missing userId and impersonatedUserId in token');
      return res.status(401).json({ error: 'Unauthorized: Missing both userId and impersonatedUserId in token' });
    }

    // Initialize variables
    let currentUser = null;
    let effectiveUser = null;
    let effectiveTenantId = tenantId;
    let isImpersonating = false;
    let superAdminPermissions = null;
    let effectivePermissions = [];
    let inheritedRoleIds = [];
    let roleType = null;
    let roleLevel = null;

    // Handle current user (userId) logic
    if (userId) {
      currentUser = await Users.findById(userId).populate('roleId');
      if (!currentUser) {
        console.error(`User not found for userId: ${userId}`);
        return res.status(401).json({ error: 'Unauthorized: User not found' });
      }

      effectiveUser = currentUser;
      effectiveTenantId = effectiveTenantId || currentUser.tenantId;
      roleType = currentUser.roleId?.roleType || null;
      roleLevel = currentUser.roleLevel || null; // Assuming Users schema has roleLevel

      // Process permissions if not a Super Admin
      if (currentUser.roleId?.roleType !== 'internal') {
        if (currentUser.roleId) {
          const roleTemplate = await RolesPermissionObject.findById(currentUser.roleId);
          if (!roleTemplate) {
            console.error(`Role template not found for roleId: ${currentUser.roleId}`);
            return res.status(403).json({ error: 'Role template not found' });
          }

          if (roleTemplate.roleType === 'organization') {
            if (!effectiveTenantId) {
              console.error('Missing tenantId for organization user');
              return res.status(401).json({ error: 'Unauthorized: Missing tenantId for organization user' });
            }

            const tenant = await Tenant.findById(effectiveTenantId);
            if (!tenant || tenant.type !== 'organization') {
              console.error(`Invalid tenant for tenantId: ${effectiveTenantId}`);
              return res.status(403).json({ error: 'Invalid tenant for organization user' });
            }

            const roleOverride = await RoleOverrides.findOne({
              tenantId: effectiveTenantId,
              roleName: roleTemplate.roleName,
            }).populate('inherits');

            effectivePermissions = roleTemplate.objects.map((obj) => {
              const overrideObj = roleOverride?.objects.find((o) => o.objectName === obj.objectName);
              return {
                objectName: obj.objectName,
                permissions: overrideObj ? { ...obj.permissions, ...overrideObj.permissions } : obj.permissions,
              };
            });

            inheritedRoleIds = roleOverride?.inherits.map((r) => r._id) || [];
          } else if (roleTemplate.roleType === 'individual') {
            effectivePermissions = roleTemplate.objects;
          }
        } else {
          effectivePermissions = currentUser.permissions || [];
        }
      }
    }

    // Handle impersonated user (impersonatedUserId) logic
    if (impersonatedUserId) {
      const impersonatedUser = await Users.findById(impersonatedUserId).populate('roleId');
      console.log('impersonatedUser:', impersonatedUser);

      if (!impersonatedUser) {
        console.error(`Impersonated user not found for impersonatedUserId: ${impersonatedUserId}`);
        return res.status(404).json({ error: 'Impersonated user not found' });
      }

      // if (impersonatedUser.roleId?.roleType !== 'internal') {
      //   console.error('Impersonated user is not a Super Admin');
      //   return res.status(403).json({ error: 'Unauthorized: impersonatedUserId must be a Super Admin' });
      // }

      isImpersonating = true;
      effectiveUser = impersonatedUser;
      // effectiveTenantId = impersonatedUser.tenantId || effectiveTenantId;
      roleType = impersonatedUser.roleId?.roleType || null;
      roleLevel = impersonatedUser.roleLevel || null; // Assuming Users schema has roleLevel

      const superAdminRole = await RolesPermissionObject.findById(impersonatedUser.roleId);
      if (superAdminRole) {
        superAdminPermissions = superAdminRole.objects.reduce((acc, obj) => {
          acc[obj.objectName] = obj.permissions;
          return acc;
        }, {});
      }
    }

    // Convert effective permissions to object
    // In permissionMiddleware, replace the permissions conversion with:
    req.effectivePermissions = effectivePermissions.reduce((acc, { objectName, permissions }) => {
      acc[objectName] = permissions; // Preserve the exact permission structure
      return acc;
    }, {});

    // Set request and locals properties
    req.superAdminPermissions = superAdminPermissions;
    // req.inheritedRoleIds = inheritedRoleIds;
    // req.tenantId = effectiveTenantId;
    // req.userId = effectiveUser?._id;
    // req.isImpersonating = isImpersonating;
    // req.currentUserId = userId;

    res.locals.effectivePermissions = req.effectivePermissions;
    res.locals.superAdminPermissions = req.superAdminPermissions;
    // res.locals.inheritedRoleIds = req.inheritedRoleIds;
    // res.locals.isImpersonating = req.isImpersonating;
    // res.locals.roleType = roleType;
    // res.locals.roleLevel = roleLevel;

    console.log('req.effectivePermissions', req.effectivePermissions);
    console.log('req.superAdminPermissions', req.superAdminPermissions);
    
    

    next();
  } catch (error) {
    console.error('Permission Middleware Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

module.exports = { permissionMiddleware };










