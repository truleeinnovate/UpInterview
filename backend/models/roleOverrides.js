const mongoose = require('mongoose');

const roleOverridesSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },//here we dont have owner id
  roleName: {
    type: String,
    required: true,
  },
  objects: [
    {
      objectName: String,
      permissions: Object,
    }
  ],
  inherits: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RolesPermissionObject',
    }
  ],
  level: {
    type: Number,
    min: 1,
    max: 10,
  }
});

// Prevent OverwriteModelError by checking existing models
module.exports = mongoose.models.RoleOverrides || mongoose.model('RoleOverrides', roleOverridesSchema);
