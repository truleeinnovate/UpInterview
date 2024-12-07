const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TechnologyMasterSchema = new Schema({
    TechnologyMasterName: {
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
}, { collection: 'TechnologyMaster' });

const TechnologyMasterHistorySchema = new mongoose.Schema({
    technologyMasterId: { type: mongoose.Schema.Types.ObjectId, ref: 'TechnologyMaster' },
    TechnologyMasterName: String,
    ModifiedDate: { type: Date, default: Date.now },
    ModifiedBy: String,
});

TechnologyMasterSchema.pre('save', function(next) {
    // Only set CreatedDate if it is a new document
    if (this.isNew) {
        this.CreatedDate = Date.now();
    }
    // Always update the ModifiedDate
    this.ModifiedDate = Date.now();
    next();
});

const TechnologyMaster = mongoose.model('TechnologyMaster', TechnologyMasterSchema);
const TechnologyMasterHistory = mongoose.model('TechnologyMasterHistory', TechnologyMasterHistorySchema);

module.exports = { TechnologyMaster, TechnologyMasterHistory };