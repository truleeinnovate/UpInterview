

// models/RolesPermissionObject.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PermissionGroupSchema = new Schema({
  objectName: { type: String, required: true },
  permissions: { type: Map, of: Boolean, required: true },
  visibility: { type: String, enum: ['view_all', 'super_admin_only'], default: 'view_all' }
});

const RolesPermissionObjectSchema = new Schema({
  label: { type: String, required: true },
  roleName: { type: String, required: true },
  objects: [PermissionGroupSchema],
  level: { type: Number }, // Optional for individual/global roles
  // isGlobal: { type: Boolean, default: false }
  roleType: { type: String, enum: ['organization', 'individual', 'internal'], required: true },
  description: { type: String },
  //internal type means super admin,support team
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
}, { timestamps: true });

module.exports = mongoose.models.RolesPermissionObject ||
  mongoose.model('RolesPermissionObject', RolesPermissionObjectSchema);
