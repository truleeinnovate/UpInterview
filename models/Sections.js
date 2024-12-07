const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    Category: String,
    SectionName: String,
    Position:String,
    CreatedDate: {
        type: Date,
        default: Date.now
    },
    CreatedBy: String,
    ModifiedDate: Date,
    ModifiedBy: String,
});
sectionSchema.pre('save', function(next) {
    if (this.isNew) {
        this.CreatedDate = Date.now();
    }
    next();
});

const Section = mongoose.model("Section", sectionSchema);
module.exports = Section;