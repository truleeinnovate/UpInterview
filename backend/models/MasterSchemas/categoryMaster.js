const mongoose = require('mongoose');

const CategoryMasterSchema = new mongoose.Schema({
    CategoryName: { type: String, unique: true, required: true, index: true },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
    collection: 'CategoryMaster'  
});

const CategoryMaster = mongoose.model('CategoryMaster', CategoryMasterSchema);
module.exports = { CategoryMaster };
