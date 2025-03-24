const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
  Name: { type: String },
  Firstname: { type: String },
  UserName: { type: String },
  Email: { type: String },
  password: { type: String },
  isFreelancer: String,
  isAddedTeam: String,
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  RoleId: { type: String },
  ProfileId: { type: String },
  CreatedDate: { type: Date, default: Date.now },
  CreatedBy: { type: String },
  ModifiedDate: { type: Date, default: Date.now },
  ModifiedBy: { type: String },
});

const Users = mongoose.model('Users', UsersSchema);

module.exports = { Users };