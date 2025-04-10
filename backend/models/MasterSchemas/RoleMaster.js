const mongoose = require('mongoose');

const RoleMasterSchema = new mongoose.Schema({
  RoleName: { type: String, required: true },
  CreatedDate: { type: Date, default: Date.now },
  CreatedBy: String,
  ModifiedDate: { type: Date, default: Date.now }
}, {
  collection: 'RoleMaster'  // 👈 force Mongoose to use this collection
});

const RoleMaster = mongoose.model('RoleMaster', RoleMasterSchema);
module.exports = { RoleMaster };