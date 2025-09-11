const mongoose = require('mongoose');

const CategoryQuestionsMasterSchema = new mongoose.Schema({
    CategoryName: { type: String, unique: true, required: true, index: true },
    status: {
        type: String,
        enum: ["Active","InActive"],
        default: "Active",
      },
}, {
    timestamps: true,
    collection: 'CategoryQuestionsMaster'  
});

const CategoryQuestionsMaster = mongoose.model('CategoryQuestionsMaster', CategoryQuestionsMasterSchema);
module.exports = { CategoryQuestionsMaster };
