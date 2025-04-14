const mongoose = require('mongoose');

const RoleMasterSchema = new mongoose.Schema({
  RoleName: { type: String, required: true },
  CreatedDate: { type: Date, default: Date.now },
  CreatedBy: String,
  ModifiedDate: { type: Date, default: Date.now }
}, {
  //for local
  collection: 'RoleMaster'

  // for deployment
  // collection: 'rolemasters' // this is to show the roles data from the data base of azure from rolesmaster table not from the RoleMaster (mansoor)
});

const RoleMaster = mongoose.model('RoleMaster', RoleMasterSchema);
module.exports = { RoleMaster };