const mongoose = require('mongoose');

const pushNotificationSchema = new mongoose.Schema({
  ownerId: {
    type: String,
    required: true,
    index: true
  },
  tenantId: {
    type: String,
    //required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String
  },
  category: {
    type: String
  },
  unread: {
    type: Boolean,
    default: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('PushNotification', pushNotificationSchema);
