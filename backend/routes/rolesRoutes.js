const express = require('express');
const router = express.Router();
const RolesPermissionObject = require('../models/RolesPermissionObject');
const RoleOverrides = require('../models/RoleOverrides');
const { getAllRoles } = require('../controllers/rolesController');
const loggingService = require('../middleware/loggingService.js');

router.get('/getAllRoles', getAllRoles);

router.post('/roles', loggingService.internalLoggingMiddleware, async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = 'Create Role Permission Object';

  try { 
    const roleData = req.body;
    const newRole = new RolesPermissionObject(roleData);
    await newRole.save();

    res.locals.logData = {
      tenantId: req.body?.tenantId || '',
      ownerId: newRole.ownerId?.toString() || req.body?.ownerId || '',
      processName: 'Create Role Permission Object',
      requestBody: req.body,
      status: 'success',
      message: 'Role permission object created successfully',
      responseBody: newRole,
    };

    res.status(201).json(newRole);
  } catch (error) {
    console.error('Error creating role:', error);

    res.locals.logData = {
      tenantId: req.body?.tenantId || '',
      ownerId: req.body?.ownerId || '',
      processName: 'Create Role Permission Object',
      requestBody: req.body,
      status: 'error',
      message: error.message,
    };

    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/roles/:id', loggingService.internalLoggingMiddleware, async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = 'Update Role Permission Object';

  try {
    const { id } = req.params;
    const roleData = req.body;
    const updatedRole = await RolesPermissionObject.findOneAndUpdate(
      { _id: id },
      { $set: roleData},
      { new: true }
    );
    if (!updatedRole) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.locals.logData = {
      tenantId: req.body?.tenantId || '',
      ownerId: updatedRole.ownerId?.toString() || req.body?.ownerId || '',
      processName: 'Update Role Permission Object',
      requestBody: req.body,
      status: 'success',
      message: 'Role permission object updated successfully',
      responseBody: updatedRole,
    };

    res.json(updatedRole);
  } catch (error) {
    console.error('Error updating role:', error);

    res.locals.logData = {
      tenantId: req.body?.tenantId || '',
      ownerId: req.body?.ownerId || '',
      processName: 'Update Role Permission Object',
      requestBody: req.body,
      status: 'error',
      message: error.message,
    };

    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/role-overrides', async (req, res) => {
  try {
    const { tenantId, roleName } = req.query;
    const override = await RoleOverrides.findOne({ tenantId, roleName });
    res.json(override || null);
  } catch (error) {
    console.error('Error fetching role override:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/role-overrides', loggingService.internalLoggingMiddleware, async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = 'Create Role Override';

  try {
    const overrideData = req.body;
    const newOverride = new RoleOverrides(overrideData);
    await newOverride.save();

    res.locals.logData = {
      tenantId: newOverride.tenantId || req.body?.tenantId || '',
      ownerId: newOverride.ownerId?.toString() || req.body?.ownerId || '',
      processName: 'Create Role Override',
      requestBody: req.body,
      status: 'success',
      message: 'Role override created successfully',
      responseBody: newOverride,
    };

    res.status(201).json(newOverride);
  } catch (error) {
    console.error('Error creating role override:', error);

    res.locals.logData = {
      tenantId: req.body?.tenantId || '',
      ownerId: req.body?.ownerId || '',
      processName: 'Create Role Override',
      requestBody: req.body,
      status: 'error',
      message: error.message,
    };

    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/role-overrides/:id', loggingService.internalLoggingMiddleware, async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = 'Update Role Override';

  try {
    const { id } = req.params;
    const updateData = req.body;

    // If objects are provided, merge with existing objects
    if (updateData.objects) {
      const existingOverride = await RoleOverrides.findById(id);
      if (!existingOverride) {
        return res.status(404).json({ message: 'Role override not found' });
      }

      const existingObjectsMap = new Map(
        existingOverride.objects.map((obj) => [obj.objectName, obj.permissions])
      );
      const updatedObjectsMap = new Map(
        updateData.objects.map((obj) => [obj.objectName, obj.permissions])
      );

      // Merge objects, prioritizing updated permissions
      const mergedObjects = Array.from(
        new Map([...existingObjectsMap, ...updatedObjectsMap]).entries()
      ).map(([objectName, permissions]) => ({
        objectName,
        permissions,
      }));

      updateData.objects = mergedObjects;
    }

    const updatedOverride = await RoleOverrides.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedOverride) {
      return res.status(404).json({ message: 'Role override not found' });
    }

    res.locals.logData = {
      tenantId: updatedOverride.tenantId || req.body?.tenantId || '',
      ownerId: updatedOverride.ownerId?.toString() || req.body?.ownerId || '',
      processName: 'Update Role Override',
      requestBody: req.body,
      status: 'success',
      message: 'Role override updated successfully',
      responseBody: updatedOverride,
    };

    res.json(updatedOverride);
  } catch (error) {
    console.error('Error updating role override:', error);

    res.locals.logData = {
      tenantId: req.body?.tenantId || '',
      ownerId: req.body?.ownerId || '',
      processName: 'Update Role Override',
      requestBody: req.body,
      status: 'error',
      message: error.message,
    };

    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;