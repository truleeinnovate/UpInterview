// // middleware/permissionMiddleware.js
// const mongoose = require('mongoose');
// const Role = mongoose.model('Role');
// const Users = mongoose.model('Users');

// const permissionMiddleware = async (req, res, next) => {
//   try {
//     const { tenantId, ownerId } = req.cookies; // From cookies
//     if (!tenantId || !ownerId) {
//       return res.status(401).json({ error: 'Unauthorized: Missing tenantId or ownerId' });
//     }

//     // Fetch user
//     const user = await Users.findById(ownerId).populate('roleId');
//     if (!user || user.tenantId.toString() !== tenantId) {
//       return res.status(401).json({ error: 'Unauthorized: Invalid user or tenant' });
//     }

//     // Initialize permissions and role level
//     let permissions = [];
//     let roleLevel = null;

//     if (user.roleId) {
//       const role = await Role.findById(user.roleId);
//       if (!role) {
//         return res.status(403).json({ error: 'Role not found' });
//       }
//       permissions = role.objects;
//       roleLevel = role.level;
//     } else {
//       permissions = user.permissions || [];
//     }

//     // Convert permissions to object
//     req.permissions = permissions.reduce((acc, obj) => {
//       acc[obj.objectName] = obj.permissions;
//       return acc;
//     }, {});
//     req.roleLevel = roleLevel;
//     req.tenantId = tenantId;
//     req.userId = ownerId;

//     // Pass to frontend context
//     res.locals.permissions = req.permissions;
//     res.locals.roleLevel = roleLevel;

//     next();
//   } catch (error) {
//     console.error('Permission Middleware Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// module.exports = { permissionMiddleware };