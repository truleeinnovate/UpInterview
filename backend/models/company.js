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

const CompanyHistorySchema = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    CompanyName: String,
    ModifiedDate: { type: Date, default: Date.now },
    ModifiedBy: String,
});

companySchema.pre('save', function(next) {
    if (this.isNew) {
        this.CreatedDate = Date.now();
    }
    next();
});

const Company = mongoose.model("Company", companySchema);
const CompanyHistory = mongoose.model("CompanyHistory", CompanyHistorySchema);

module.exports = { Company, CompanyHistory };