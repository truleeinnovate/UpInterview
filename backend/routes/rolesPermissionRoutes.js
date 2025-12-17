const express = require('express');
const router = express.Router();
const rolesPermissionController = require('../controllers/rolesPermissionController');
const loggingService = require('../middleware/loggingService.js');

// GET all permission categories
router.get('/', rolesPermissionController.getAllPermissions);

// GET single permission category by ID
router.get('/:id', rolesPermissionController.getPermissionById);

// POST new permission category
router.post(
  '/',
  loggingService.internalLoggingMiddleware,
  rolesPermissionController.createPermission
);

// PATCH update permission category
router.patch(
  '/:id',
  loggingService.internalLoggingMiddleware,
  rolesPermissionController.updatePermission
);

module.exports = router;
