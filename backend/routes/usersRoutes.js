const express = require('express');
const router = express.Router();

const { getUsers,getInterviewers,UpdateUser,getUsersByTenant,getUniqueUserByOwnerId } = require('../controllers/usersController.js');


// Define the route for fetching users
router.get('/', getUsers);

// Get user by ownerId

router.get('/owner/:ownerId', getUniqueUserByOwnerId);


router.get('/:userId', getUsersByTenant);



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

module.exports = router;

