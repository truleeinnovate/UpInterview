// const jwt = require('jsonwebtoken');
// const { Users } = require('../models/Users');
// const Tenant = require('../models/Tenant');
// const RolesPermissionObject = require('../models/rolesPermissionObject');
// const RoleOverrides = require('../models/roleOverrides');
// const { refreshTokenIfNeeded } = require('../utils/jwt');

// const permissionMiddleware = async (req, res, next) => {
//   // console.log('[permissionMiddleware] Starting middleware execution');
//   try {

//     // const authHeader = req.headers.authorization || req.cookies.authToken;
//     // console.log('authHeader', authHeader)
//     let userId = req.headers['x-user-id'];
//     let tenantId = req.headers['x-tenant-id'];
//     const impersonatedUserId = req.headers['x-impersonation-userid'];

//     // Decode JWT if available
//     // let decoded = null;
//     // if (authHeader && authHeader.startsWith('Bearer ')) {
//     //   const token = authHeader.split(' ')[1];
//     //   try {
//     //     decoded = jwt.verify(token, process.env.JWT_SECRET);
//     //     userId = userId || decoded.userId; // Fallback to JWT if header is missing
//     //     tenantId = tenantId || decoded.tenantId; // Fallback to JWT if header is missing
//     //     console.log('[permissionMiddleware] Decoded JWT:', { userId, tenantId });

//     //     // Check for token refresh
//     //     const newToken = refreshTokenIfNeeded(token);
//     //     if (newToken) {
//     //       res.set('X-New-Token', newToken);
//     //     }
//     //   } catch (err) {
//     //     console.error('[permissionMiddleware] JWT verification error:', err.message);
//     //   }
//     // }

//     let currentUser = null;
//     let isImpersonating = false;
//     let superAdminPermissions = null;
//     let effectivePermissions = [];
//     let inheritedRoleIds = [];
//     let effectivePermissions_RoleType = null;
//     let effectivePermissions_RoleLevel = null;
//     let effectivePermissions_RoleName = null;
//     let impersonatedUser_roleType = null;
//     let impersonatedUser_roleName = null;

//     // console.log('userId && tenantId 1', userId, tenantId)

//     if (userId && tenantId) {
//       console.log('userId && tenantId 2', userId, tenantId)

//       try {
//         // console.log('userId && tenantId 3', userId, tenantId)

//         currentUser = await Users.findById(userId).populate('roleId');
//         if (!currentUser) {
//           console.error(`[permissionMiddleware] User not found for userId: ${userId}`);
//           return res.status(401).json({ error: 'Unauthorized: User not found' });
//         }

//         effectivePermissions_RoleType = currentUser.roleId?.roleType || null;
//         effectivePermissions_RoleLevel = currentUser.roleId?.level || null;
//         effectivePermissions_RoleName = currentUser.roleId?.roleName || null;

//         if (currentUser?.roleId) {
//           const roleTemplate = await RolesPermissionObject.findById(currentUser.roleId);
//           if (!roleTemplate) {
//             console.error(`[permissionMiddleware] Role template not found for roleId: ${currentUser.roleId}`);
//             return res.status(403).json({ error: 'Role template not found' });
//           }

//           if (roleTemplate.roleType === 'organization') {
//             const tenant = await Tenant.findById(tenantId);
//             if (!tenant || tenant.type !== 'organization') {
//               console.error(`[permissionMiddleware] Invalid tenant for tenantId: ${tenantId}`);
//               return res.status(403).json({ error: 'Invalid tenant for organization user' });
//             }

//             const roleOverride = await RoleOverrides.findOne({
//               tenantId: tenantId,
//               roleName: roleTemplate.roleName,
//             }).populate('inherits');

//             effectivePermissions = roleTemplate.objects.map((obj) => {
//               const overrideObj = roleOverride?.objects?.find((o) => o.objectName === obj.objectName);
//               return {
//                 objectName: obj.objectName,
//                 permissions: overrideObj ? { ...obj.permissions, ...overrideObj.permissions } : obj.permissions,
//               };
//             });

//             inheritedRoleIds = roleOverride?.inherits?.map((r) => r._id) || [];
//           } else if (roleTemplate.roleType === 'individual') {
//             effectivePermissions = roleTemplate.objects || [];
//           }
//         } else {
//           effectivePermissions = currentUser?.permissions || [];
//         }
//       } catch (err) {
//         console.error('[permissionMiddleware] Error processing user/tenant:', err.message);
//       }
//     } else {
//       // console.log('[permissionMiddleware] Missing userId or tenantId, skipping user processing');
//     }

//     if (impersonatedUserId) {
//       try {
//         const impersonatedUser = await Users.findById(impersonatedUserId).populate('roleId');
//         if (impersonatedUser) {
//           isImpersonating = true;
//           impersonatedUser_roleType = impersonatedUser.roleId?.roleType || null;
//           impersonatedUser_roleName = impersonatedUser.roleId?.roleName || null;
//           const superAdminRole = await RolesPermissionObject.findById(impersonatedUser.roleId);
//           if (superAdminRole) {
//             superAdminPermissions = superAdminRole.objects.reduce((acc, obj) => {
//               acc[obj.objectName] = obj.permissions;
//               return acc;
//             }, {});
//           }
//         }
//       } catch (err) {
//         console.error('[permissionMiddleware] Impersonation token error:', err.message);
//       }
//     }

//     const permissionsObject = effectivePermissions.reduce((acc, { objectName, permissions }) => {
//       acc[objectName] = permissions;
//       return acc;
//     }, {});

//     res.locals = {
//       effectivePermissions: permissionsObject,
//       superAdminPermissions,
//       inheritedRoleIds,
//       isImpersonating,
//       effectivePermissions_RoleType,
//       effectivePermissions_RoleLevel,
//       effectivePermissions_RoleName,
//       tenantId,
//       userId: currentUser?._id,
//       impersonatedUser_roleType,
//       impersonatedUser_roleName,
//     };

//     // console.log('[permissionMiddleware] Setting res.locals:', res.locals);
//     next();
//   } catch (error) {
//     console.error('[permissionMiddleware] Error:', error.message);
//     res.status(500).json({
//       error: 'Internal server error',
//       message: error.message,
//       stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
//     });
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
    // Get tokens from cookies (they might be undefined)
    const authToken = req.cookies.authToken;
    const impersonationToken = req.cookies.impersonationToken;

    // Initialize payload variables
    let authPayload = null;
    let impersonationPayload = null;

    // Safely decode tokens if they exist
    try {
      authPayload = authToken ? jwt.decode(authToken) : null;
      impersonationPayload = impersonationToken ? jwt.decode(impersonationToken) : null;
    } catch (err) {
      console.log('Token decoding error (non-critical):', err.message);
      // Continue with null payloads
    }

    // Initialize user variables with defaults
    let userId = authPayload?.userId || null;
    let tenantId = authPayload?.tenantId || null;
    const impersonatedUserId = impersonationPayload?.impersonatedUserId || null;

    let currentUser = null;
    let isImpersonating = false;
    let superAdminPermissions = null;
    let effectivePermissions = [];
    let inheritedRoleIds = [];
    let effectivePermissions_RoleType = null;
    let effectivePermissions_RoleLevel = null;
    let effectivePermissions_RoleName = null;
    let impersonatedUser_roleType = null;
    let impersonatedUser_roleName = null;

    // Only process user if we have both userId and tenantId
    if (userId && tenantId) {
      try {
        currentUser = await Users.findById(userId).populate('roleId');
        if (!currentUser) {
          console.error(`[permissionMiddleware] User not found for userId: ${userId}`);
          // Don't return error, just continue with default permissions
        } else {
          effectivePermissions_RoleType = currentUser.roleId?.roleType || null;
          effectivePermissions_RoleLevel = currentUser.roleId?.level || null;
          effectivePermissions_RoleName = currentUser.roleId?.roleName || null;

          if (currentUser?.roleId) {
            const roleTemplate = await RolesPermissionObject.findById(currentUser.roleId);
            if (roleTemplate) {
              if (roleTemplate.roleType === 'organization') {
                const tenant = await Tenant.findById(tenantId);
                if (tenant && tenant.type === 'organization') {
                  const roleOverride = await RoleOverrides.findOne({
                    tenantId: tenantId,
                    roleName: roleTemplate.roleName,
                  }).populate('inherits');

                  effectivePermissions = roleTemplate.objects.map((obj) => {
                    const overrideObj = roleOverride?.objects?.find((o) => o.objectName === obj.objectName);
                    return {
                      objectName: obj.objectName,
                      permissions: overrideObj ? { ...obj.permissions, ...overrideObj.permissions } : obj.permissions,
                    };
                  });

                  inheritedRoleIds = roleOverride?.inherits?.map((r) => r._id) || [];
                }
              } else if (roleTemplate.roleType === 'individual') {
                effectivePermissions = roleTemplate.objects || [];
              }
            }
          } else {
            effectivePermissions = currentUser?.permissions || [];
          }
        }
      } catch (err) {
        console.error('[permissionMiddleware] Error processing user/tenant:', err.message);
        // Continue with default permissions
      }
    }

    // Handle impersonation if we have an impersonated user ID
    if (impersonatedUserId) {
      try {
        const impersonatedUser = await Users.findById(impersonatedUserId).populate('roleId');
        if (impersonatedUser) {
          isImpersonating = true;
          impersonatedUser_roleType = impersonatedUser.roleId?.roleType || null;
          impersonatedUser_roleName = impersonatedUser.roleId?.roleName || null;
          
          const superAdminRole = await RolesPermissionObject.findById(impersonatedUser.roleId);
          if (superAdminRole) {
            superAdminPermissions = superAdminRole.objects.reduce((acc, obj) => {
              acc[obj.objectName] = obj.permissions;
              return acc;
            }, {});
          }
        }
      } catch (err) {
        console.error('[permissionMiddleware] Impersonation token error:', err.message);
        // Continue without impersonation
      }
    }

    // Build the permissions object
    const permissionsObject = effectivePermissions.reduce((acc, { objectName, permissions }) => {
      acc[objectName] = permissions;
      return acc;
    }, {});

    // Set response locals
    res.locals = {
      effectivePermissions: permissionsObject,
      superAdminPermissions,
      inheritedRoleIds,
      isImpersonating,
      effectivePermissions_RoleType,
      effectivePermissions_RoleLevel,
      effectivePermissions_RoleName,
      tenantId,
      userId: currentUser?._id || userId, // Fall back to the ID from token if no user was fetched
      impersonatedUser_roleType,
      impersonatedUser_roleName,
    };

    next();
  } catch (error) {
    console.error('Permission middleware error:', error);
    // Set default permissions and continue
    res.locals = {
      effectivePermissions: {},
      superAdminPermissions: null,
      inheritedRoleIds: [],
      isImpersonating: false,
      effectivePermissions_RoleType: null,
      effectivePermissions_RoleLevel: null,
      effectivePermissions_RoleName: null,
      tenantId: null,
      userId: null,
      impersonatedUser_roleType: null,
      impersonatedUser_roleName: null,
    };
    next();
  }
};

module.exports = { permissionMiddleware };