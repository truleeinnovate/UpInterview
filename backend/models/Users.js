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
//   Users,
// };


const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
    lastName: { type: String },
    firstName: { type: String },
    email: { type: String},
    password: { type: String },
    isFreelancer: String,
    isAddedTeam: String,
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    roleId: { type: String },
    profileId: { type: String },
    // status:{type:String},
    status: { type: String, enum: ['active', 'inactive', ], default: 'active' },
    createdBy: { type: String },
    modifiedBy: { type: String },
    isProfileCompleted: { type: Boolean },
}, { timestamps: true });

const Users = mongoose.model('Users', UsersSchema);
module.exports = { Users };