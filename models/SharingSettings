const mongoose = require('mongoose');

const SharingSettingsSchema = new mongoose.Schema({
    Name: { type: String, required: true },
    organizationId: { type: String, required: true },
    accessBody: [
        {
            ObjName: { type: String, required: true },
            Access: { type: String, required: true },
            GrantAccess: { type: Boolean, required: true },
            _id: false
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SharingSettings', SharingSettingsSchema);