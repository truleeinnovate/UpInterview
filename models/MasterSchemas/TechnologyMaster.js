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


module.exports = { TechnologyMaster};