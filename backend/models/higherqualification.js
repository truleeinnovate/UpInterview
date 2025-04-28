const mongoose = require('mongoose');

const qualificationSchema = new mongoose.Schema({
    QualificationName: {
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

qualificationSchema.pre('save', function(next) {
    if (this.isNew) {
        this.CreatedDate = Date.now();
    }
    next();
});

const HigherQualification = mongoose.model("HigherQualification", qualificationSchema);

module.exports = { HigherQualification };
