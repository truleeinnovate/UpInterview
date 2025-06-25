const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const PermissionGroupSchema = new Schema({
  objectName: { type: String, required: true },
  permissions: { type: Map, of: Boolean, required: true }
});
 
const RolesPermissionObjectSchema = new Schema({
  label: { type: String, required: true },
  roleName: { type: String, required: true },
  objects: [PermissionGroupSchema],
  level: { type: Number }, // Optional for individual/global roles
  // isGlobal: { type: Boolean, default: false }
  roleType: { type: String, enum: ['organization', 'individual', 'internal'], required: true },
  //internal type means super admin,support team
}, { timestamps: true });
 
module.exports = mongoose.models.RolesPermissionObject ||
  mongoose.model('RolesPermissionObject', RolesPermissionObjectSchema);


// const mongoose = require('mongoose');
 
// const permissionGroupSchema = new mongoose.Schema({
//   objectName: {
//     type: String,
//     required: true
//   },
//   permissions: {
//     type: Map,
//     of: Boolean,
//     required: true
//   }
// });
 
// const rolesPermissionObjectSchema = new mongoose.Schema({
//   label: {
//     type: String,
//     required: true
//   },
//   roleName: {
//     type: String,
//     required: true
//   },
//   objects: [permissionGroupSchema],
//   level: {
//     type: Number
//   }
// }, {
//   timestamps: true
// });
 
// const RolesPermissionObject = mongoose.model('RolesPermissionObject', rolesPermissionObjectSchema);
 
// module.exports = RolesPermissionObject;