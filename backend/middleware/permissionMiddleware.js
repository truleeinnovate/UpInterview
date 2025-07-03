const jwt = require('jsonwebtoken');
const { Users } = require('../models/Users');
const Tenant = require('../models/Tenant');
const RolesPermissionObject = require('../models/rolesPermissionObject');
const RoleOverrides = require('../models/roleOverrides');
const { refreshTokenIfNeeded } = require('../utils/jwt');

const permissionMiddleware = async (req, res, next) => {

  try {
    const userId = req.headers['x-user-id'] || req.cookies.userId;
    const tenantId = req.headers['x-tenant-id'] || req.cookies.tenantId;
    const impersonatedUserId = req.headers['x-impersonation-token'];
    const authHeader = req.headers.authorization;

    // console.log('Setting res.locals with:', {
    //   effectivePermissions: Object.keys(permissionsObject),
    //   isImpersonating,
    //   // ... other relevant data
    // });
    
    // Check for token refresh
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const newToken = refreshTokenIfNeeded(token);
      
      if (newToken) {
        // Set the new token in the response headers
        res.set('X-New-Token', newToken);
      }
    }
    
    let decoded = null;
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

    if (userId && tenantId) {
      try {
        if (!userId) {
          console.error('Missing userId in token');
          return res.status(401).json({ error: 'Unauthorized: Missing userId in token' });
        }
        currentUser = await Users.findById(userId).populate('roleId');
        if (!currentUser) {
          console.error(`User not found for userId: ${userId}`);
          return res.status(401).json({ error: 'Unauthorized: User not found' });
        }

        effectivePermissions_RoleType = currentUser.roleId?.roleType || null;
        effectivePermissions_RoleLevel = currentUser.roleId?.level || null;
        effectivePermissions_RoleName = currentUser.roleId?.roleName || null;

        if (currentUser?.roleId) {
          const roleTemplate = await RolesPermissionObject.findById(currentUser.roleId);

          if (!roleTemplate) {
            console.error(`Role template not found for roleId: ${effectiveUser.roleId}`);
            return res.status(403).json({ error: 'Role template not found' });
          }

          if (roleTemplate.roleType === 'organization') {
            if (!tenantId) {
              console.error('Missing tenantId for organization user');
              return res.status(401).json({ error: 'Unauthorized: Missing tenantId for organization user' });

            }

            const tenant = await Tenant.findById(tenantId);
            if (!tenant || tenant.type !== 'organization') {
              console.error(`Invalid tenant for tenantId: ${tenantId}`);
              return res.status(403).json({ error: 'Invalid tenant for organization user' });
            }


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
          } else if (roleTemplate.roleType === 'individual') {
            effectivePermissions = roleTemplate.objects || [];
          }
        } else {
          effectivePermissions = currentUser?.permissions || [];
        }
 
      } catch (err) {
        console.error('JWT verification error:', err.message);
      }
    }

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
        console.error('Impersonation token error (continuing with normal auth):', err.message);
      }
    }

    const permissionsObject = effectivePermissions.reduce((acc, { objectName, permissions }) => {
      acc[objectName] = permissions;
      return acc;
    }, {});

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
      effectivePermissions_RoleType,
      effectivePermissions_RoleLevel,
      effectivePermissions_RoleName,
      tenantId,
      userId: currentUser?._id,
      impersonatedUser_roleType,
      impersonatedUser_roleName
    };
    console.log('res.locals', res.locals)
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


