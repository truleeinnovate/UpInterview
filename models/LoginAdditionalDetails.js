const mongoose = require('mongoose');

const LoginAdditionalDetailsSchema = new mongoose.Schema({
  CurrentRole: String,
  industry: String,
  Experience:String,
  location: String,
  Introduction: String
});

module.exports = mongoose.model('LoginAdditionalDetails', LoginAdditionalDetailsSchema);