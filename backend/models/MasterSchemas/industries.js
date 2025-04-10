const mongoose = require('mongoose');

const IndustrySchema = new mongoose.Schema({
    IndustryName: {
        type: String,
        required: true
    },
    CreatedDate: {
        type: Date,
        default: Date.now
    },
    CreatedBy: String,
});

const Industry = mongoose.model("Industry", IndustrySchema);

module.exports = { Industry };
