const mongoose = require('mongoose');

const SharingRuleSchema = new mongoose.Schema({
    label: { type: String, required: true },
    name: { type: String, required: true },
    objectName: { type: String, required: true },
    ruleType: { type: String, required: true },
    access: { type: String, required: true },
    description: { type: String },
    orgId: { type: String, required: true },
    recordsOwnedBy: { type: String, enum: ['User', 'Role'], required: true },
    recordsOwnedById: { type: mongoose.Schema.Types.ObjectId, required: true },
    shareWith: { type: String, enum: ['User', 'Role'], required: true },
    shareWithId: { type: mongoose.Schema.Types.ObjectId, required: true } 
});

module.exports = mongoose.model('SharingRule', SharingRuleSchema);