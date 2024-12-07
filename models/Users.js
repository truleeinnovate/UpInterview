const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
  Name: { type: String },
  sub: { type: String },
  Firstname: { type: String },
  CountryCode: { type: String },
  UserId: { type: String, unique: true },
  Email: { type: String },
  password: { type: String, required: true },
  Phone: { type: String },
  LinkedinUrl: { type: String },
  TimeZone: { type: String },
  Language: { type: String },
  Gender: { type: String },
  isFreelancer: String,
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  RoleId: { type: String },
  ProfileId: { type: String },
  ImageData: {
    filename: String,
    path: String,
    contentType: String,
  },
  CreatedDate: { type: Date, default: Date.now },
  CreatedBy: { type: String },
  ModifiedDate: { type: Date, default: Date.now },
  ModifiedBy: { type: String },
});

const UserHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  Name: String,
  Firstname: String,
  CountryCode: String,
  UserId: String,
  Email: String,
  Phone: String,
  LinkedinUrl: String,
  Gender: String,
  isFreelancer: String,
  ImageData: String,
  CreatedDate: Date,
  CreatedBy: String,
  ModifiedDate: Date,
  ModifiedBy: String,
  updatedAt: { type: Date, default: Date.now }
});

const Users = mongoose.model('Users', UsersSchema);
const UserHistory = mongoose.model('UserHistory', UserHistorySchema);

module.exports = {
  Users,
  UserHistory
};