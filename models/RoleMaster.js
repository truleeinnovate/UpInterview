const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoleMasterSchema = new Schema({
    RoleName: {
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
    // ModifiedDate: {
    //     type: Date,
    //     default: Date.now
    // },
    // ModifiedBy: {
    //     type: String
    // }
}, { collection: 'RoleMaster' });

const RoleMasterHistorySchema = new mongoose.Schema({
    roleMasterId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoleMaster' },
    RoleName: String,
    ModifiedDate: { type: Date, default: Date.now },
    ModifiedBy: String,
});

// Pre-save hook to update ModifiedDate before saving
RoleMasterSchema.pre('save', function(next) {
    // Only set CreatedDate if it is a new document
    if (this.isNew) {
        this.CreatedDate = Date.now();
    }
    // Always update the ModifiedDate
    this.ModifiedDate = Date.now();
    next();
});

const RoleMaster = mongoose.model('RoleMaster', RoleMasterSchema);
const RoleMasterHistory = mongoose.model('RoleMasterHistory', RoleMasterHistorySchema);

module.exports = { RoleMaster, RoleMasterHistory };