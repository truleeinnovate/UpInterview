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
    // ModifiedDate: Date,
    // ModifiedBy: String,
});

const IndustryHistorySchema = new mongoose.Schema({
    industryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Industry' },
    IndustryName: String,
    ModifiedDate: { type: Date, default: Date.now },
    ModifiedBy: String,
});

IndustrySchema.pre('save', function(next) {
    if (this.isNew) {
        this.CreatedDate = Date.now();
    }
    next();
});

const Industry = mongoose.model("Industry", IndustrySchema);
const IndustryHistory = mongoose.model("IndustryHistory", IndustryHistorySchema);

module.exports = { Industry, IndustryHistory };
