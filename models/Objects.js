const mongoose = require('mongoose');

const objectsSchema = new mongoose.Schema({
  objects: [
    {
      type: String,
      required: true
    }
  ]
});

const Objects = mongoose.model('Objects', objectsSchema);
module.exports = Objects;