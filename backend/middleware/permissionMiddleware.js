const jwt = require('jsonwebtoken');
const { Users } = require('../models/Users');
const Tenant = require('../models/Tenant');
const RolesPermissionObject = require('../models/rolesPermissionObject');
const RoleOverrides = require('../models/roleOverrides');

const permissionMiddleware = async (req, res, next) => {
  try {
    // Get tokens from cookies (they might be undefined)
    let authToken = req.cookies.authToken;
    let impersonationToken = req.cookies.impersonationToken;

    // If not in cookies, check Authorization header
    if (!authToken && !impersonationToken) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        // Try to determine which type of token this is by decoding it
        try {
          const decoded = jwt.decode(token);
          if (decoded) {
            if (decoded.impersonatedUserId) {
              // This is an impersonation token
              impersonationToken = token;
            } else if (decoded.userId && decoded.tenantId) {
              // This is an auth token
              authToken = token;
            }
          }
        } catch (err) {
          console.warn('[permissionMiddleware] Failed to decode token from Authorization header:', err.message);
        }
      }
    }

    // Initialize payload variables
    let authPayload = null;
    let impersonationPayload = null;

    // Safely decode tokens if they exist
    try {
      authPayload = authToken ? jwt.decode(authToken) : null;
      impersonationPayload = impersonationToken ? jwt.decode(impersonationToken) : null;
    } catch (err) {
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

    // console.log('[permissionMiddleware] Processing permissions:', {
    //   hasAuthToken: !!authToken,
    //   hasImpersonationToken: !!impersonationToken,
    //   userId,
    //   tenantId,
    //   impersonatedUserId
    // });

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

    // console.log('[permissionMiddleware] Final permissions result:', {
    //   effectivePermissionsCount: Object.keys(permissionsObject).length,
    //   hasSuperAdminPermissions: !!superAdminPermissions,
    //   isImpersonating,
    //   roleType: effectivePermissions_RoleType,
    //   roleName: effectivePermissions_RoleName,
    //   userId: res.locals.userId
    // });

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
