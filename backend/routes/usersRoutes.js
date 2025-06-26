const express = require('express');
const router = express.Router();

const { getUsers,getInterviewers,UpdateUser,getUsersByTenant,getUniqueUserByOwnerId } = require('../controllers/usersController.js');


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
      roleLevel: res.locals.roleLevel
    });
  } catch (error) {
    console.error('Get Permissions Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Define the route for fetching users
router.get('/', getUsers);

// Get user by ownerId

router.get('/owner/:ownerId', getUniqueUserByOwnerId);


router.get('/:tenantId', getUsersByTenant);



// Route to fetch interviewers
router.get('/interviewers/:tenantId', getInterviewers);

// UpdateUser
router.patch("/:id/status",UpdateUser)




//new code for permmisons


// routes/userRoutes.js
// const {Users} = require('../models/Users');
// const Role = require('../models/RolesData.js');
// const { permissionMiddleware } = require('../middleware/permissionMiddleware');

// router.get('/permissions', permissionMiddleware, async (req, res) => {
//   try {
//     res.json({
//       permissions: res.locals.permissions,
//       roleLevel: res.locals.roleLevel
//     });
//   } catch (error) {
//     console.error('Get Permissions Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// router.post('/individual', permissionMiddleware, async (req, res) => {
//   try {
//     if (!res.locals.permissions.Users?.Create) {
//       return res.status(403).json({ error: 'No permission to create users' });
//     }

//     const { firstName, lastName, email, tenantId, permissions } = req.body;
//     const user = await Users.create({
//       firstName,
//       lastName,
//       email,
//       tenantId,
//       permissions, // Same structure as role permissions
//       status: 'active',
//       createdBy: req.userId
//     });
//     res.status(201).json({ user, permissions: res.locals.permissions });
//   } catch (error) {
//     console.error('Create Individual User Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// router.put('/individual/:id/permissions', permissionMiddleware, async (req, res) => {
//   try {
//     if (!res.locals.permissions.Users?.Edit) {
//       return res.status(403).json({ error: 'No permission to edit user permissions' });
//     }

//     const user = await Users.findById(req.params.id);
//     if (!user || user.tenantId.toString() !== req.tenantId) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     user.permissions = req.body.permissions;
//     await user.save();
//     res.json({ user, permissions: res.locals.permissions });
//   } catch (error) {
//     console.error('Update Permissions Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


// new updated one



 
// Other routes (impersonate, end-impersonation, etc.) remain unchanged
// router.post('/impersonate/:userId', permissionMiddleware, async (req, res) => {
//   try {
//     const { userId } = req.params;
//     if (!req.superAdminPermissions?.Impersonate) {
//       return res.status(403).json({ error: 'No permission to impersonate users' });
//     }

//     const targetUser = await Users.findById(userId).populate('roleId');
//     if (!targetUser) {
//       return res.status(404).json({ error: 'Target user not found' });
//     }

//     res.cookie('impersonatedUserId', targetUser._id.toString(), {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       maxAge: 24 * 60 * 60 * 1000
//     });
//     res.cookie('tenantId', targetUser.tenantId?.toString() || '', {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       maxAge: 24 * 60 * 60 * 1000
//     });

//     res.json({ message: 'Impersonation started', userId: targetUser._id });
//   } catch (error) {
//     console.error('Impersonate User Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// router.post('/end-impersonation', permissionMiddleware, async (req, res) => {
//   try {
//     if (!req.superAdminPermissions) {
//       return res.status(403).json({ error: 'No permission to end impersonation' });
//     }

//     res.clearCookie('impersonatedUserId');
//     res.clearCookie('tenantId');

//     res.json({ message: 'Impersonation ended' });
//   } catch (error) {
//     console.error('End Impersonation Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });
// router.post('/individual', permissionMiddleware, async (req, res) => {
//   try {
//     if (!res.locals.permissions.Users?.Create) {
//       return res.status(403).json({ error: 'No permission to create users' });
//     }

//     const { firstName, lastName, email, tenantId, permissions } = req.body;
//     const tenant = await Tenant.findById(tenantId);
//     if (!tenant || tenant.type !== 'organization') {
//       return res.status(400).json({ error: 'Invalid tenant for individual user' });
//     }

//     const individualRole = await RolesPermissionObject.findOne({ roleName: 'Individual' });
//     const user = await Users.create({
//       firstName,
//       lastName,
//       email,
//       tenantId,
//       roleId: permissions ? null : individualRole?._id,
//       roleType: 'individual',
//       permissions: permissions || [],
//       status: 'active',
//       createdBy: req.userId
//     });

//     res.status(201).json({ user, permissions: res.locals.permissions });
//   } catch (error) {
//     console.error('Create Individual User Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// router.put('/individual/:id/permissions', permissionMiddleware, async (req, res) => {
//   try {
//     if (!res.locals.permissions.Users?.Edit) {
//       return res.status(403).json({ error: 'No permission to edit user permissions' });
//     }

//     const user = await Users.findById(req.params.id);
//     if (!user || user.tenantId.toString() !== req.tenantId) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     user.permissions = req.body.permissions;
//     user.roleId = null; // Clear roleId if custom permissions
//     await user.save();
//     res.json({ user, permissions: res.locals.permissions });
//   } catch (error) {
//     console.error('Update Permissions Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// router.put('/roles/:roleName', permissionMiddleware, async (req, res) => {
//   try {
//     if (!res.locals.permissions.Roles?.Edit) {
//       return res.status(403).json({ error: 'No permission to edit roles' });
//     }

//     const { roleName } = req.params;
//     const { objects, level } = req.body;
//     const { tenantId, userId } = req;

//     const roleTemplate = await RolesPermissionObject.findOne({ roleName });
//     if (!roleTemplate || roleTemplate.isGlobal) {
//       return res.status(404).json({ error: 'Role template not found or is global' });
//     }

//     const tenant = await Tenant.findById(tenantId);
//     if (!tenant || tenant.type !== 'organization') {
//       return res.status(400).json({ error: 'Invalid tenant for role override' });
//     }

//     const override = await RoleOverrides.findOneAndUpdate(
//       { tenantId, roleName },
//       { tenantId, roleName, objects, level: level || roleTemplate.level, createdBy: userId },
//       { upsert: true, new: true }
//     );

//     res.json({ override, permissions: res.locals.permissions });
//   } catch (error) {
//     console.error('Update Role Override Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// router.post('/super-admin', async (req, res) => {
//   try {
//     const { firstName, lastName, email } = req.body;

//     const superAdminRole = await RolesPermissionObject.findOne({ roleName: 'Super_Admin' });
//     if (!superAdminRole) {
//       throw new Error('Super Admin role not found');
//     }

//     const user = await Users.create({
//       firstName,
//       lastName,
//       email,
//       roleId: superAdminRole._id,
//       roleType: 'global',
//       status: 'active'
//     });

//     res.status(201).json({ user });
//   } catch (error) {
//     console.error('Create Super Admin Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

module.exports = router;


