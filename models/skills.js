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

const SkillsHistorySchema = new mongoose.Schema({
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skills' },
    SkillName: String,
    ModifiedDate: { type: Date, default: Date.now },
    ModifiedBy: String,
});

skillsSchema.pre('save', function(next) {
    if (this.isNew) {
        this.CreatedDate = Date.now();
    }
    next();
});

const Skills = mongoose.model("Skills", skillsSchema);
const SkillsHistory = mongoose.model("SkillsHistory", SkillsHistorySchema);

module.exports = { Skills, SkillsHistory };
