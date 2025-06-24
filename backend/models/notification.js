const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    // toAddress:[String],
    // ccAddress:[String],
    // fromAddress: String,   
    // phoneNumber: [String],//i have commented this fields because we no need to define here based on notificationType we can pass fields from post method.this way we can stop generating empty fields in schema.
    title: String,
    body: String,
    notificationType: String,
    recipientId: { type: String }, // Changed from receiverId to recipientId
    object: { // Changed objectName to an object field
        objectName: String,
        objectId: String
    },
    status: String,
    createdBy: String,
    updatedBy: String,
    tenantId: String,
    ownerId: String,
}, { timestamps: true });//by using timestamps we can automatically add createdAt and updatedAt fields

const Notifications = mongoose.model("Notifications", NotificationSchema);
module.exports = Notifications;