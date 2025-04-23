const mongoose = require('mongoose');
 
const permissionGroupSchema = new mongoose.Schema({
  objectName: {
    type: String,
    required: true
  },
  permissions: {
    type: Map,
    of: Boolean,
    required: true
  }
});
 
const rolesPermissionObjectSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true
  },
  roleName: {
    type: String,
    required: true
  },
  objects: [permissionGroupSchema],
  level: {
    type: Number
  }
}, {
  timestamps: true
});
 
const RolesPermissionObject = mongoose.model('RolesPermissionObject', rolesPermissionObjectSchema);
 
module.exports = RolesPermissionObject;