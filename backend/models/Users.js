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
    email: { type: String },
    newEmail: { type: String }, //only when user change email
    password: { type: String, select: true },
    isFreelancer: String,
    isAddedTeam: String,
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
    roleId: { type: String },
    //newly added for roles
    // roleId: { type: Schema.Types.ObjectId, ref: 'RolesPermissionObject' },
    // roleType: { type: String, enum: ['organization', 'individual', 'global'], required: true },
    profileId: { type: String },
    status: { type: String, enum: ['active', 'inactive',], default: 'inactive' },
    isEmailVerified: { type: Boolean, default: false },
    createdBy: { type: String },
    modifiedBy: { type: String },
    isProfileCompleted: { type: Boolean },
}, { timestamps: true });

const Users = mongoose.model('Users', UsersSchema);
module.exports = { Users };