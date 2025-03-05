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

const University_CollegeHistorySchema = new mongoose.Schema({
    universityCollegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'University_CollegeName' },
    University_CollegeName: String,
    ModifiedDate: { type: Date, default: Date.now },
    ModifiedBy: String,
});

University_CollegeSchema.pre('save', function(next) {
    if (this.isNew) {
        this.CreatedDate = Date.now();
    }
    next();
});

const University_CollegeName = mongoose.model("University_CollegeName", University_CollegeSchema);
const University_CollegeHistory = mongoose.model("University_CollegeHistory", University_CollegeHistorySchema);

module.exports = { University_CollegeName, University_CollegeHistory };
