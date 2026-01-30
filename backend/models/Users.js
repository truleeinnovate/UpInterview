// const mongoose = require('mongoose');

// const UsersSchema = new mongoose.Schema({
//   lastName: { type: String },
//   firstName: { type: String },
//   email: { type: String },
//   password: { type: String },
//   isFreelancer: String,
//   isAddedTeam: String,
//   tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
//   roleId: { type: String },
//   profileId: String,//user id we have changed it to profileid
//   createdBy: { type: String },
//   modifiedBy: { type: String },
//   isProfileCompleted: { type: Boolean },
// },{ timestamps: true });

// const Users = mongoose.model('Users', UsersSchema);
// module.exports = {
const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, index: true },
    newEmail: { type: String }, //only when user change email
    password: { type: String, select: true },
    isFreelancer: String,
    isAddedTeam: String,
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
    // roleId: { type: String },
    //newly added for roles
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'RolesPermissionObject' },
    profileId: { type: String },
    status: { type: String, enum: ['active', 'inactive',], default: 'inactive' },
    isEmailVerified: { type: Boolean, default: false },
    createdBy: { type: String },
    modifiedBy: { type: String },
    isProfileCompleted: { type: Boolean },
}, { timestamps: true });

// added by mansoor for indexes to fetch the data fast
UsersSchema.index({ tenantId: 1 });
UsersSchema.index({ email: 1 });
UsersSchema.index({ roleId: 1 });
UsersSchema.index({ tenantId: 1, createdAt: -1 });

const Users = mongoose.model('Users', UsersSchema);
module.exports = { Users };