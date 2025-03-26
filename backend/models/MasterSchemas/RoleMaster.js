const mongoose = require('mongoose');

const RoleMasterSchema = new mongoose.Schema({
  RoleName: { type: String, required: true },
  CreatedBy: { type: String, required: true },
  CreatedDate: { type: Date, default: Date.now },
  ModifiedDate: { type: Date, default: Date.now }
});

const RoleMaster = mongoose.model('RoleMaster', RoleMasterSchema);
module.exports = { RoleMaster };