const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LocationMasterSchema = new Schema({
    LocationName: {
        type: String,
        required: true
    },
    TimeZone: {
        type: String,
        required: true
    },
    CreatedDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    CreatedBy: {
        type: String,
        required: true
    },
    ModifiedDate: {
        type: Date,
        default: Date.now
    },
    ModifiedBy: {
        type: String
    }
}, { collection: 'LocationMaster' });

const LocationMasterHistorySchema = new mongoose.Schema({
    locationMasterId: { type: mongoose.Schema.Types.ObjectId, ref: 'LocationMaster' },
    LocationName: String,
    TimeZone: String,
    ModifiedDate: { type: Date, default: Date.now },
    ModifiedBy: String,
});

// Pre-save hook to update ModifiedDate before saving
LocationMasterSchema.pre('save', function(next) {
    // Only set CreatedDate if it is a new document
    if (this.isNew) {
        this.CreatedDate = Date.now();
    }
    // Always update the ModifiedDate
    this.ModifiedDate = Date.now();
    next();
});

const LocationMaster = mongoose.model('LocationMaster', LocationMasterSchema);
const LocationMasterHistory = mongoose.model('LocationMasterHistory', LocationMasterHistorySchema);

module.exports = { LocationMaster, LocationMasterHistory };
