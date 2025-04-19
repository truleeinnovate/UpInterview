const mongoose = require('mongoose');

const RoleMasterSchema = new mongoose.Schema({
  RoleName: { type: String, required: true },
  CreatedDate: { type: Date, default: Date.now },
  CreatedBy: String,
  ModifiedDate: { type: Date, default: Date.now }
}
);

const RoleMaster = mongoose.model('rolemasters', RoleMasterSchema);
module.exports = { RoleMaster };