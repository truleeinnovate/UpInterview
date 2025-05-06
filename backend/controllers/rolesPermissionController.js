const RolesPermissionObject = require('../models/rolesPermissionObject');

// Get all permission categories
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await RolesPermissionObject.find();
    res.status(200).json(permissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new permission category
exports.createPermission = async (req, res) => {
  try {
    const newPermission = new RolesPermissionObject(req.body);
    const savedPermission = await newPermission.save();
    res.status(201).json(savedPermission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update permission category by ID
exports.updatePermission = async (req, res) => {
  try {
    const updatedPermission = await RolesPermissionObject.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedPermission) {
      return res.status(404).json({ message: 'Permission category not found' });
    }
    
    res.status(200).json(updatedPermission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get permission category by ID
exports.getPermissionById = async (req, res) => {
  try {
    const permission = await RolesPermissionObject.findOne({ id: req.params.id });
    
    if (!permission) {
      return res.status(404).json({ message: 'Permission category not found' });
    }
    
    res.status(200).json(permission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
