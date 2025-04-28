const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    CompanyName: {
        type: String,
        required: true
    },
    CreatedDate: {
        type: Date,
        default: Date.now
    },
    CreatedBy: String,
});

companySchema.pre('save', function(next) {
    if (this.isNew) {
        this.CreatedDate = Date.now();
    }
    next();
});

const Company = mongoose.model("Company", companySchema);

module.exports = { Company };