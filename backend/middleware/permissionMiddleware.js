

// // middleware/permissionMiddleware.js
// const express = require('express');
// const cookieParser = require('cookie-parser');
// const jwt = require('jsonwebtoken');
// const { Users } = require('../models/Users');
// const Tenant = require('../models/Tenant');
// const RolesPermissionObject = require('../models/rolesPermissionObject');
// const RoleOverrides = require('../models/roleOverrides');

// const permissionMiddleware = async (req, res, next) => {
//   try {
//     const authToken = req.cookies.authToken; // Get JWT from cookie
//     console.log('authToken:', authToken); // Debug: Log the token

//     if (!authToken) {
//       console.error('No auth token found in cookies');
//       return res.status(401).json({ error: 'Unauthorized: Missing auth token' });
//     }

//     // Decode JWT
//     let decoded;
//     try {
//       decoded = jwt.verify(authToken, process.env.JWT_SECRET);
//       console.log('Decoded JWT:', decoded); // Debug: Log decoded payload
//     } catch (err) {
//       console.error('JWT verification error:', err.message); // Debug: Log specific error
//       return res.status(401).json({ error: 'Unauthorized: Invalid token', details: err.message });
//     }

//     const { userId, tenantId, impersonatedUserId } = decoded;
//     if (!userId && !impersonatedUserId) {
//       console.error('Missing userId and impersonatedUserId in token');
//       return res.status(401).json({ error: 'Unauthorized: Missing both userId and impersonatedUserId in token' });
//     }

//     // Initialize variables
//     let currentUser = null;
//     let effectiveUser = null;
//     let effectiveTenantId = tenantId;
//     let isImpersonating = false;
//     let superAdminPermissions = null;
//     let effectivePermissions = [];
//     let inheritedRoleIds = [];
//     let roleType = null;
//     let roleLevel = null;

//     // Handle current user (userId) logic
//     if (userId) {
//       currentUser = await Users.findById(userId).populate('roleId');
//       if (!currentUser) {
//         console.error(`User not found for userId: ${userId}`);
//         return res.status(401).json({ error: 'Unauthorized: User not found' });
//       }

//       effectiveUser = currentUser;
//       effectiveTenantId = effectiveTenantId || currentUser.tenantId;
//       roleType = currentUser.roleId?.roleType || null;
//       roleLevel = currentUser.roleLevel || null; // Assuming Users schema has roleLevel

//       // Process permissions if not a Super Admin
//       if (currentUser.roleId?.roleType !== 'internal') {
//         if (currentUser.roleId) {
//           const roleTemplate = await RolesPermissionObject.findById(currentUser.roleId);
//           if (!roleTemplate) {
//             console.error(`Role template not found for roleId: ${currentUser.roleId}`);
//             return res.status(403).json({ error: 'Role template not found' });
//           }

//           if (roleTemplate.roleType === 'organization') {
//             if (!effectiveTenantId) {
//               console.error('Missing tenantId for organization user');
//               return res.status(401).json({ error: 'Unauthorized: Missing tenantId for organization user' });
//             }

//             const tenant = await Tenant.findById(effectiveTenantId);
//             if (!tenant || tenant.type !== 'organization') {
//               console.error(`Invalid tenant for tenantId: ${effectiveTenantId}`);
//               return res.status(403).json({ error: 'Invalid tenant for organization user' });
//             }

//             const roleOverride = await RoleOverrides.findOne({
//               tenantId: effectiveTenantId,
//               roleName: roleTemplate.roleName,
//             }).populate('inherits');

//             effectivePermissions = roleTemplate.objects.map((obj) => {
//               const overrideObj = roleOverride?.objects.find((o) => o.objectName === obj.objectName);
//               return {
//                 objectName: obj.objectName,
//                 permissions: overrideObj ? { ...obj.permissions, ...overrideObj.permissions } : obj.permissions,
//               };
//             });

//             inheritedRoleIds = roleOverride?.inherits.map((r) => r._id) || [];
//           } else if (roleTemplate.roleType === 'individual') {
//             effectivePermissions = roleTemplate.objects;
//           }
//         } else {
//           effectivePermissions = currentUser.permissions || [];
//         }
//       }
//     }

//     // Handle impersonated user (impersonatedUserId) logic
//     if (impersonatedUserId) {
//       const impersonatedUser = await Users.findById(impersonatedUserId).populate('roleId');
//       console.log('impersonatedUser:', impersonatedUser);

//       if (!impersonatedUser) {
//         console.error(`Impersonated user not found for impersonatedUserId: ${impersonatedUserId}`);
//         return res.status(404).json({ error: 'Impersonated user not found' });
//       }

//       // if (impersonatedUser.roleId?.roleType !== 'internal') {
//       //   console.error('Impersonated user is not a Super Admin');
//       //   return res.status(403).json({ error: 'Unauthorized: impersonatedUserId must be a Super Admin' });
//       // }

//       isImpersonating = true;
//       effectiveUser = impersonatedUser;
//       // effectiveTenantId = impersonatedUser.tenantId || effectiveTenantId;
//       roleType = impersonatedUser.roleId?.roleType || null;
//       roleLevel = impersonatedUser.roleLevel || null; // Assuming Users schema has roleLevel

//       const superAdminRole = await RolesPermissionObject.findById(impersonatedUser.roleId);
//       if (superAdminRole) {
//         superAdminPermissions = superAdminRole.objects.reduce((acc, obj) => {
//           acc[obj.objectName] = obj.permissions;
//           return acc;
//         }, {});
//       }
//     }

//     // Convert effective permissions to object
//     // In permissionMiddleware, replace the permissions conversion with:
//     req.effectivePermissions = effectivePermissions.reduce((acc, { objectName, permissions }) => {
//       acc[objectName] = permissions; // Preserve the exact permission structure
//       return acc;
//     }, {});

//     // Set request and locals properties
//     req.superAdminPermissions = superAdminPermissions;
//     // req.inheritedRoleIds = inheritedRoleIds;
//     // req.tenantId = effectiveTenantId;
//     // req.userId = effectiveUser?._id;
//     // req.isImpersonating = isImpersonating;
//     // req.currentUserId = userId;

//     res.locals.effectivePermissions = req.effectivePermissions;
//     res.locals.superAdminPermissions = req.superAdminPermissions;
//     // res.locals.inheritedRoleIds = req.inheritedRoleIds;
//     // res.locals.isImpersonating = req.isImpersonating;
//     // res.locals.roleType = roleType;
//     // res.locals.roleLevel = roleLevel;

//     console.log('req.effectivePermissions', req.effectivePermissions);
//     console.log('req.superAdminPermissions', req.superAdminPermissions);



//     next();
//   } catch (error) {
//     console.error('Permission Middleware Error:', error);
//     res.status(500).json({ error: 'Internal server error', message: error.message });
//   }
// };

// module.exports = { permissionMiddleware };















const jwt = require('jsonwebtoken');
const { Users } = require('../models/Users');
const Tenant = require('../models/Tenant');
const RolesPermissionObject = require('../models/rolesPermissionObject');
const RoleOverrides = require('../models/roleOverrides');

const permissionMiddleware = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    const tenantId = req.headers['x-tenant-id'];
    const impersonatedUserId = req.headers['x-impersonation-token'];

    console.log('userId backend', userId);
    console.log('tenantId backend', tenantId);
    console.log('impersonatedUserId backend', impersonatedUserId);

    // Get tokens - both are optional
    // const authToken = req.cookies.authToken || req.headers.authorization?.split('Bearer ')[1];
    // const impersonationToken = req.cookies.impersonationToken;

    // Initialize variables with default values
    let decoded = null;
    let currentUser = null;
    // let effectiveUser = null;
    // let effectiveTenantId = null;
    let isImpersonating = false;
    let superAdminPermissions = null;
    let effectivePermissions = [];
    let inheritedRoleIds = [];
    let roleType = null;
    let roleLevel = null;

    // Process auth token if present
    if (userId && tenantId) {
      try {
        // decoded = jwt.verify(authToken, process.env.JWT_SECRET);
        // console.log('Decoded authToken:', decoded);

        // const { userId, tenantId } = decoded;
        if (!userId) {
          console.error('Missing userId in token');
          return res.status(401).json({ error: 'Unauthorized: Missing userId in token' });
        }

        // Get current user
        currentUser = await Users.findById(userId).populate('roleId');
        if (!currentUser) {
          console.error(`User not found for userId: ${userId}`);
          return res.status(401).json({ error: 'Unauthorized: User not found' });
        }

        // Set default effective user (non-impersonated)
        // effectiveUser = currentUser;
        // effectiveTenantId = currentUser.tenantId;
        roleType = currentUser.roleId?.roleType || null;
        roleLevel = currentUser.roleLevel || null;

        if (currentUser?.roleId) {
          console.log('Processing permissions for user:', currentUser._id);
          const roleTemplate = await RolesPermissionObject.findById(currentUser.roleId);
          console.log('roleTemplate', roleTemplate);

          if (!roleTemplate) {
            console.error(`Role template not found for roleId: ${effectiveUser.roleId}`);
            return res.status(403).json({ error: 'Role template not found' });
          }

          if (roleTemplate.roleType === 'organization') {
            console.log('Processing organization role type');
            if (!tenantId) {
              console.error('Missing tenantId for organization user');
              return res.status(401).json({ error: 'Unauthorized: Missing tenantId for organization user' });
            }

            const tenant = await Tenant.findById(tenantId);
            console.log('tenant', tenant);
            if (!tenant || tenant.type !== 'organization') {
              console.error(`Invalid tenant for tenantId: ${tenantId}`);
              return res.status(403).json({ error: 'Invalid tenant for organization user' });
            }

            const roleOverride = await RoleOverrides.findOne({
              tenantId: tenantId,
              roleName: roleTemplate.roleName,
            }).populate('inherits');

            console.log('roleOverride', roleOverride);

            effectivePermissions = roleTemplate.objects.map((obj) => {
              const overrideObj = roleOverride?.objects?.find((o) => o.objectName === obj.objectName);
              return {
                objectName: obj.objectName,
                permissions: overrideObj ? { ...obj.permissions, ...overrideObj.permissions } : obj.permissions,
              };
            });

            inheritedRoleIds = roleOverride?.inherits?.map((r) => r._id) || [];
          } else if (roleTemplate.roleType === 'individual') {
            console.log('Processing individual role type');
            effectivePermissions = roleTemplate.objects || [];
          }
        } else {
          console.log('No roleId found, using default permissions');
          effectivePermissions = currentUser?.permissions || [];
        }

        console.log('Final Effective Permissions:', effectivePermissions);
        // Convert permissions to object format
 
      } catch (err) {
        console.error('JWT verification error:', err.message);
        // Continue with default permissions instead of throwing error
      }
    }

    if (impersonatedUserId) { // Only process if we have a valid currentUser
      try {
        // const impersonationDecoded = jwt.verify(impersonationToken, process.env.JWT_SECRET);
        // console.log('Decoded impersonationToken:', impersonationDecoded);

        const impersonatedUser = await Users.findById(impersonatedUserId).populate('roleId');
        console.log('impersonatedUser:', impersonatedUser);

        if (impersonatedUser) {
          isImpersonating = true;
          // const previousEffectiveUser = impersonatedUser; // Save the original effective user
          roleType = impersonatedUser.roleId?.roleType || null;
          roleLevel = impersonatedUser.roleLevel || null;

          // If we had a previous effective user (from userId/tenantId), keep their tenant context
          // if (previousEffectiveUser && !effectiveTenantId) {
          //   effectiveTenantId = previousEffectiveUser.tenantId;
          // }

          // Get super admin permissions if applicable
          const superAdminRole = await RolesPermissionObject.findById(impersonatedUser.roleId);
          if (superAdminRole) {
            superAdminPermissions = superAdminRole.objects.reduce((acc, obj) => {
              acc[obj.objectName] = obj.permissions;
              return acc;
            }, {});
          }

          // Force permissions refresh for the impersonated user
          // effectivePermissions = []; // Reset permissions to be reloaded
        }
      } catch (err) {
        console.error('Impersonation token error (continuing with normal auth):', err.message);
        // Continue with normal auth if impersonation fails
      }
    }

    // Process permissions for non-superadmin users
    // if (effectiveUser?.roleId) {
    //   console.log('effectiveUser?.roleId', effectiveUser?.roleId);
    //   const roleTemplate = await RolesPermissionObject.findById(effectiveUser.roleId);
    //   console.log('roleTemplate', roleTemplate);
    //   if (!roleTemplate) {
    //     console.error(`Role template not found for roleId: ${effectiveUser.roleId}`);
    //     return res.status(403).json({ error: 'Role template not found' });
    //   }

    //   if (roleTemplate.roleType === 'organization') {
    //     console.log('roleTemplate.roleType', roleTemplate.roleType);
    //     if (!effectiveTenantId) {
    //       console.error('Missing tenantId for organization user');
    //       return res.status(401).json({ error: 'Unauthorized: Missing tenantId for organization user' });
    //     }

    //     const tenant = await Tenant.findById(effectiveTenantId);
    //     console.log('tenant', tenant);
    //     if (!tenant || tenant.type !== 'organization') {
    //       console.error(`Invalid tenant for tenantId: ${effectiveTenantId}`);
    //       return res.status(403).json({ error: 'Invalid tenant for organization user' });
    //     }

    //     const roleOverride = await RoleOverrides.findOne({
    //       tenantId: effectiveTenantId,
    //       roleName: roleTemplate.roleName,
    //     }).populate('inherits');
    //     console.log('roleOverride', roleOverride);
    //     effectivePermissions = roleTemplate.objects.map((obj) => {
    //       const overrideObj = roleOverride?.objects.find((o) => o.objectName === obj.objectName);
    //       return {
    //         objectName: obj.objectName, 
    //         permissions: overrideObj ? { ...obj.permissions, ...overrideObj.permissions } : obj.permissions,
    //       };
    //     });

    //     inheritedRoleIds = roleOverride?.inherits?.map((r) => r._id) || [];
    //   } else if (roleTemplate.roleType === 'individual') {
    //     console.log('roleTemplate.roleType', roleTemplate.roleType);
    //     effectivePermissions = roleTemplate.objects;
    //   }
    // } else {
    //   console.log('effectiveUser?.permissions', effectiveUser?.permissions);
    //   effectivePermissions = effectiveUser?.permissions || [];
    // }
    const permissionsObject = effectivePermissions.reduce((acc, { objectName, permissions }) => {
      acc[objectName] = permissions;
      return acc;
    }, {});


    // Attach all data to request and response
    req.effectivePermissions = permissionsObject;
    req.superAdminPermissions = superAdminPermissions;
    req.inheritedRoleIds = inheritedRoleIds;
    req.tenantId = tenantId;
    req.userId = currentUser?._id;
    req.isImpersonating = isImpersonating;
    req.currentUserId = currentUser?._id;

    res.locals = {
      effectivePermissions: permissionsObject,
      superAdminPermissions,
      inheritedRoleIds,
      isImpersonating,
      roleType,
      roleLevel,
      tenantId,
      userId: currentUser?._id
    };
    next();
  } catch (error) {
    console.error('Permission Middleware Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = { permissionMiddleware };