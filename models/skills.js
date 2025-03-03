const mongoose = require('mongoose');

const skillsSchema = new mongoose.Schema({
    SkillName : {
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


skillsSchema.pre('save', function(next) {
    if (this.isNew) {
        this.CreatedDate = Date.now();
    }
    next();
});

const Skills = mongoose.model("Skills", skillsSchema);

module.exports = { Skills };
