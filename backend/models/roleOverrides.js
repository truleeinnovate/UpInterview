const mongoose = require('mongoose');

const roleOverridesSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
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
  ]
});

// ✅ Prevent OverwriteModelError by checking existing models
module.exports = mongoose.models.RoleOverrides || mongoose.model('RoleOverrides', roleOverridesSchema);
