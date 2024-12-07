const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true
  },
  Name: {
    type: String,
    required: true
  },
  Description: {
    type: String,
    required: true
  },
  Tabs: [
    {
      type: Map,
      of: String
    }
  ],
  Objects: [
    {
      type: Map,
      of: {
        View: Boolean,
        Create: Boolean,
        Edit: Boolean,
        Delete: Boolean
      }
    }
  ],
  organizationId: {
    type: String,
  }
});

const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;