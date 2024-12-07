const mongoose = require('mongoose');

const ConnectedAppSchema = new mongoose.Schema({
    appName: { type: String, required: true },
    description: { type: String },
    redirectUrls: { type: String, required: true },
    originUrls: { type: String },
    scope: { type: [String], required: true, enum: ['read:candidate', 'read/write:candidate'] },
    clientId: { type: String, required: true },
    clientSecret: { type: String, required: true },
    accessToken: { type: String, required: true },
    expiry: { type: Date, required: true }
});

module.exports = mongoose.model('ConnectedApp', ConnectedAppSchema);
