const express = require('express');
const router = express.Router();
const rolesPermissionController = require('../controllers/rolesPermissionController');

// GET all permission categories
router.get('/', rolesPermissionController.getAllPermissions);

// GET single permission category by ID
router.get('/:id', rolesPermissionController.getPermissionById);

// POST new permission category
router.post('/', rolesPermissionController.createPermission);

// PATCH update permission category
router.patch('/:id', rolesPermissionController.updatePermission);

module.exports = router;
