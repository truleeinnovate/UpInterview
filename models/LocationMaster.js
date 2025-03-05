// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const LocationMasterSchema = new Schema({
//     LocationName: {
//         type: String,
//         required: true
//     },
//     TimeZone: {
//         type: String,
//         required: true
//     },
//     CreatedDate: {
//         type: Date,
//         required: true,
//         default: Date.now
//     },
//     CreatedBy: {
//         type: String,
//         required: true
//     },
//     ModifiedDate: {
//         type: Date,
//         default: Date.now
//     },
//     ModifiedBy: {
//         type: String
//     }
// }, { collection: 'LocationMaster' });


// // Pre-save hook to update ModifiedDate before saving
// LocationMasterSchema.pre('save', function(next) {
//     // Only set CreatedDate if it is a new document
//     if (this.isNew) {
//         this.CreatedDate = Date.now();
//     }
//     // Always update the ModifiedDate
//     this.ModifiedDate = Date.now();
//     next();
// });

// const LocationMaster = mongoose.model('LocationMaster', LocationMasterSchema);

// module.exports = { LocationMaster };



const mongoose = require('mongoose');

const LocationMasterSchema = new mongoose.Schema({
  LocationName: { type: String, unique: true, required: true },
  TimeZone: String,
  CreatedBy: String,
  ModifiedBy: String
});

const LocationMaster = mongoose.model('LocationMaster', LocationMasterSchema);
module.exports = { LocationMaster };
