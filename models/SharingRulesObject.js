const mongoose = require('mongoose');

const sharingRulesObjectSchema = new mongoose.Schema({
  objects: [
    {
      type: String,
      required: true
    }
  ]
});

const SharingRulesObject = mongoose.model('SharingRulesObject', sharingRulesObjectSchema);
module.exports = SharingRulesObject;