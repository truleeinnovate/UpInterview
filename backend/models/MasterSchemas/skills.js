const mongoose = require('mongoose');

const skillsSchema = new mongoose.Schema({
  SkillName: {
    type: String,
    required: true
  },
  CreatedDate: {
    type: Date,
    default: Date.now
  },
  CreatedBy: String
}, {
  collection: 'skills' // 👈 Use lowercase to match your actual collection name
});

const Skills = mongoose.model("Skills", skillsSchema);

module.exports = { Skills };
