const mongoose = require('mongoose');

const CategoryQuestionsMasterSchema = new mongoose.Schema({
    CategoryName: { type: String, unique: true, required: true, index: true },
    status: {
        type: String,
        enum: ["Active","InActive"],
        default: "Active",
      },
    createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
          default: null,
    },
    updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
          default: null,
    },
    ownerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
          default: null,
    },
}, {
    timestamps: true,
    collection: 'CategoryQuestionsMaster'  
});

const CategoryQuestionsMaster = mongoose.model('CategoryQuestionsMaster', CategoryQuestionsMasterSchema);
module.exports = { CategoryQuestionsMaster };
