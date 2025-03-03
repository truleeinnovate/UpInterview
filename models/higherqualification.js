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

const QualificationHistorySchema = new mongoose.Schema({
    qualificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'HigherQualification' },
    QualificationName: String,
    ModifiedDate: { type: Date, default: Date.now },
    ModifiedBy: String,
});

qualificationSchema.pre('save', function(next) {
    if (this.isNew) {
        this.CreatedDate = Date.now();
    }
    next();
});

const HigherQualification = mongoose.model("HigherQualification", qualificationSchema);
const HigherQualificationHistory = mongoose.model("HigherQualificationHistory", QualificationHistorySchema);

module.exports = { HigherQualification, HigherQualificationHistory };
