const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    LocationName: {
        type: String,
        required: true
    },
    CreatedDate: {
        type: Date,
        default: Date.now
    },
    CreatedBy: String,
    // ModifiedDate: Date,
    // ModifiedBy: String,
});

const LocationHistorySchema = new mongoose.Schema({
    locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    LocationName: String,
    ModifiedDate: { type: Date, default: Date.now },
    ModifiedBy: String,
});

locationSchema.pre('save', function(next) {
    if (this.isNew) {
        this.CreatedDate = Date.now();
    }
    next();
});

const Location = mongoose.model("Location", locationSchema);
const LocationHistory = mongoose.model("LocationHistory", LocationHistorySchema);

module.exports = { Location, LocationHistory };
