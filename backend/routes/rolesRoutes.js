
const express = require('express');
const router = express.Router();
const RolesPermissionObject = require('../models/RolesPermissionObject');
const RoleOverrides = require('../models/RoleOverrides');
const { getAllRoles } = require('../controllers/rolesController');
router.get('/getAllRoles',getAllRoles)

router.post('/roles', async (req, res) => {
  try { 
    const roleData = req.body;
    const newRole = new RolesPermissionObject(roleData);
    await newRole.save();
    res.status(201).json(newRole);
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/roles/:id', async (req, res) => {
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
    res.json(updatedRole);
  } catch (error) {
    console.error('Error updating role:', error);
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
router.post('/role-overrides', async (req, res) => {
  try {
    const overrideData = req.body;
    const newOverride = new RoleOverrides(overrideData);
    await newOverride.save();
    res.status(201).json(newOverride);
  } catch (error) {
    console.error('Error creating role override:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/role-overrides/:id', async (req, res) => {
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
    res.json(updatedOverride);
  } catch (error) {
    console.error('Error updating role override:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;