const mongoose = require('mongoose');

const LocationMasterSchema = new mongoose.Schema({
  LocationName: { type: String, unique: true, required: true },
  TimeZone: String,
  CreatedBy: String,
  ModifiedBy: String
}, {
  collection: 'LocationMaster'
});

const LocationMaster = mongoose.model('LocationMaster', LocationMasterSchema);
module.exports = { LocationMaster };
