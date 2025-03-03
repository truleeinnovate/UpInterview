const mongoose = require('mongoose');

const FeedsSchema = new mongoose.Schema({
    tenantId: { type: String },
    feedType: { type: String, enum: ["info", "alert", "update"], required: true },
    action: {
        name: { type: String, required: true }, // Action performed (e.g., "candidate_updated")
        description: { type: String, required: false }, // Detailed description of the action
    },
    ownerId: { type: String, required: true },
    parentId: { type: String, required: true }, //ObjectId 
    parentObject: { type: String, required: true }, //Object Name 
    metadata: { type: mongoose.Schema.Types.Mixed }, // Additional data about the feed
    // history: [{
    //     fieldName: { type: String },
    //     oldValue: { type: mongoose.Schema.Types.Mixed },
    //     newValue: { type: mongoose.Schema.Types.Mixed },
    //     changedAt: { type: Date, default: Date.now },
    //     changedBy: { type: String }
    // }],
//    we are not defining message,history and fieldsmessage field here from controller we are directly passing to schema
    severity: { type: String, required: false }, //"low", "medium", "high" 
}, { timestamps: true,strict: false });

module.exports = mongoose.model('Feeds', FeedsSchema);


