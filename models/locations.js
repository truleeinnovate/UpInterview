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

locationSchema.pre('save', function(next) {
    if (this.isNew) {
        this.CreatedDate = Date.now();
    }
    next();
});

const Location = mongoose.model("Location", locationSchema);

module.exports = { Location };
