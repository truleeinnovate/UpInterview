const mongoose = require('mongoose');

const tabsSchema = new mongoose.Schema({
  tabs: [
    {
      type: String,
      required: true
    }
  ]
});

const Tabs = mongoose.model('Tabs', tabsSchema);
module.exports = Tabs;