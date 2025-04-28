const mongoose = require('mongoose');

const University_CollegeSchema = new mongoose.Schema({
    University_CollegeName : {
        type: String,
        required: true
    },
    CreatedDate: {
        type: Date,
        default: Date.now
    },
    CreatedBy: String,
});

University_CollegeSchema.pre('save', function(next) {
    if (this.isNew) {
        this.CreatedDate = Date.now();
    }
    next();
});

const University_CollegeName = mongoose.model("University_CollegeName", University_CollegeSchema);

module.exports = { University_CollegeName };
